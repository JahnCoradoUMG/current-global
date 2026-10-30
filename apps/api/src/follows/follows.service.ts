import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly notifications: NotificationsService,
  ) {}

  async follow(followerId: string, username: string) {
    const followingId = await this.users.findIdByUsername(username);

    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existing) {
      return { following: true };
    }

    await this.prisma.follow.create({
      data: { followerId, followingId },
    });

    await this.notifications.createIfNeeded({
      userId: followingId,
      actorId: followerId,
      type: NotificationType.FOLLOW,
      entityId: followerId,
    });

    return { following: true };
  }

  async unfollow(followerId: string, username: string) {
    const followingId = await this.users.findIdByUsername(username);

    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
  }
}
