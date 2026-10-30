import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

type JwtPayload = { sub: string };

const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

@WebSocketGateway({
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly socketUsers = new Map<string, string>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('RealtimeGateway ready');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        client.emit('error', { code: 'UNAUTHORIZED' });
        client.disconnect(true);
        return;
      }

      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true },
      });

      if (!user) {
        client.emit('error', { code: 'UNAUTHORIZED' });
        client.disconnect(true);
        return;
      }

      this.socketUsers.set(client.id, user.id);
      client.data.userId = user.id;
      await client.join(`user:${user.id}`);
      this.logger.debug(`Socket ${client.id} joined user:${user.id}`);
    } catch {
      client.emit('error', { code: 'UNAUTHORIZED' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.socketUsers.delete(client.id);
    this.logger.debug(`Socket ${client.id} disconnected`);
  }

  private userIdOf(client: Socket): string | undefined {
    return (
      (client.data?.userId as string | undefined) ??
      this.socketUsers.get(client.id)
    );
  }

  private postIdOf(body: unknown): string | undefined {
    if (typeof body === 'string') return body;
    if (body && typeof body === 'object' && 'postId' in body) {
      const value = (body as { postId?: unknown }).postId;
      return typeof value === 'string' ? value : undefined;
    }
    return undefined;
  }

  private conversationIdOf(body: unknown): string | undefined {
    if (typeof body === 'string') return body;
    if (body && typeof body === 'object' && 'conversationId' in body) {
      const value = (body as { conversationId?: unknown }).conversationId;
      return typeof value === 'string' ? value : undefined;
    }
    return undefined;
  }

  @SubscribeMessage('post:subscribe')
  handlePostSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ) {
    const userId = this.userIdOf(client);
    const postId = this.postIdOf(body);
    if (!userId || !postId) {
      return { ok: false };
    }
    void client.join(`post:${postId}`);
    return { ok: true };
  }

  @SubscribeMessage('post:unsubscribe')
  handlePostUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ) {
    const postId = this.postIdOf(body);
    if (!postId) {
      return { ok: false };
    }
    void client.leave(`post:${postId}`);
    return { ok: true };
  }

  @SubscribeMessage('conversation:subscribe')
  async handleConversationSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ) {
    const userId = this.userIdOf(client);
    const conversationId = this.conversationIdOf(body);
    if (!userId || !conversationId) {
      return { ok: false };
    }

    const membership = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!membership) {
      return { ok: false, error: 'FORBIDDEN' };
    }

    await client.join(`conversation:${conversationId}`);
    return { ok: true };
  }

  @SubscribeMessage('conversation:unsubscribe')
  handleConversationUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ) {
    const conversationId = this.conversationIdOf(body);
    if (!conversationId) {
      return { ok: false };
    }
    void client.leave(`conversation:${conversationId}`);
    return { ok: true };
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToPost(postId: string, event: string, payload: unknown) {
    this.server.to(`post:${postId}`).emit(event, payload);
  }

  emitToConversation(
    conversationId: string,
    event: string,
    payload: unknown,
  ) {
    this.server.to(`conversation:${conversationId}`).emit(event, payload);
  }
}
