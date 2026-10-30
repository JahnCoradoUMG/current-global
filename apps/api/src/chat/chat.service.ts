import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, ReactionKind } from '@prisma/client';
import { normalizePagination, paginated } from '../common/pagination';
import {
  emptyReactionSummary,
  summarizeReactions,
  toReactionUpdate,
} from '../common/reactions';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';

const peerSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async listConversations(userId: string) {
    const memberships = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: peerSelect } },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    const items = memberships
      .map((m) => {
        const peer = m.conversation.participants.find(
          (p) => p.userId !== userId,
        )?.user;
        if (!peer) return null;
        const lastMessage = m.conversation.messages[0] ?? null;
        return {
          id: m.conversation.id,
          peer,
          lastMessage,
          createdAt: m.conversation.createdAt,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? a.createdAt;
        const bTime = b.lastMessage?.createdAt ?? b.createdAt;
        return bTime.getTime() - aTime.getTime();
      });

    return { data: items };
  }

  async findOrCreate(userId: string, username: string) {
    const peerId = await this.users.findIdByUsername(username);

    if (peerId === userId) {
      throw new BadRequestException('Cannot chat with yourself');
    }

    const peer = await this.prisma.user.findUniqueOrThrow({
      where: { id: peerId },
      select: peerSelect,
    });

    const myConversationIds = (
      await this.prisma.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true },
      })
    ).map((r) => r.conversationId);

    if (myConversationIds.length > 0) {
      const shared = await this.prisma.conversationParticipant.findMany({
        where: {
          userId: peerId,
          conversationId: { in: myConversationIds },
        },
        include: {
          conversation: {
            include: {
              participants: true,
            },
          },
        },
      });

      const existing = shared.find(
        (s) =>
          s.conversation.participants.length === 2 &&
          s.conversation.participants.every((p) =>
            [userId, peerId].includes(p.userId),
          ),
      );

      if (existing) {
        return {
          id: existing.conversationId,
          peer,
          createdAt: existing.conversation.createdAt,
        };
      }
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: peerId }],
        },
      },
    });

    return {
      id: conversation.id,
      peer,
      createdAt: conversation.createdAt,
    };
  }

  async listMessages(
    conversationId: string,
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.assertParticipant(conversationId, userId);

    const { page, limit, skip } = normalizePagination(query);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.message.count({ where: { conversationId } }),
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          createdAt: true,
          reactions: {
            select: { emoji: true, userId: true },
          },
        },
      }),
    ]);

    return paginated(
      rows.map((row) => {
        const { reactions, ...message } = row;
        return {
          ...message,
          reactions: summarizeReactions(reactions, userId),
        };
      }),
      total,
      page,
      limit,
    );
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: CreateMessageDto,
  ) {
    await this.assertParticipant(conversationId, senderId);

    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    const peerId = participants.find((p) => p.userId !== senderId)?.userId;
    if (!peerId) {
      throw new NotFoundException('Peer not found');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: dto.content,
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        createdAt: true,
      },
    });

    const payload = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      reactions: emptyReactionSummary(),
    };

    this.realtime.emitToConversation(
      conversationId,
      'chat:message:new',
      payload,
    );
    this.realtime.emitToUser(peerId, 'chat:message:new', payload);

    await this.notifications.createIfNeeded({
      userId: peerId,
      actorId: senderId,
      type: NotificationType.MESSAGE,
      entityId: conversationId,
    });

    return payload;
  }

  async toggleMessageReaction(
    messageId: string,
    userId: string,
    emoji: ReactionKind,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, conversationId: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await this.assertParticipant(message.conversationId, userId);

    const existing = await this.prisma.messageReaction.findUnique({
      where: { userId_messageId: { userId, messageId } },
    });

    if (existing?.emoji === emoji) {
      await this.prisma.messageReaction.delete({
        where: { userId_messageId: { userId, messageId } },
      });
    } else if (existing) {
      await this.prisma.messageReaction.update({
        where: { userId_messageId: { userId, messageId } },
        data: { emoji },
      });
    } else {
      await this.prisma.messageReaction.create({
        data: { userId, messageId, emoji },
      });
    }

    const rows = await this.prisma.messageReaction.findMany({
      where: { messageId },
      select: { emoji: true, userId: true },
    });
    const reaction = toReactionUpdate(summarizeReactions(rows, userId), userId);

    this.realtime.emitToConversation(
      message.conversationId,
      'chat:reaction:updated',
      {
        messageId,
        conversationId: message.conversationId,
        reaction,
      },
    );

    return {
      messageId,
      conversationId: message.conversationId,
      reaction,
    };
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const membership = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      const exists = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException('Conversation not found');
      }
      throw new ForbiddenException('Not a participant');
    }
  }
}
