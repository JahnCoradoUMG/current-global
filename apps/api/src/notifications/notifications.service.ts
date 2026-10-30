import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { normalizePagination, paginated } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async createIfNeeded(params: {
    userId: string;
    actorId: string;
    type: NotificationType;
    entityId: string;
  }) {
    if (params.userId === params.actorId) {
      return null;
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        actorId: params.actorId,
        type: params.type,
        entityId: params.entityId,
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.realtime.emitToUser(params.userId, 'notification:new', {
      id: notification.id,
      type: notification.type,
      actor: notification.actor,
      entityId: notification.entityId,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async list(userId: string, query: { page?: number; limit?: number }) {
    const { page, limit, skip } = normalizePagination(query);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    const data = rows.map((n) => ({
      id: n.id,
      type: n.type,
      actor: n.actor,
      entityId: n.entityId,
      readAt: n.readAt,
      createdAt: n.createdAt,
    }));

    return paginated(data, total, page, limit);
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Not your notification');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
      include: {
        actor: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { status: 'ok' };
  }
}
