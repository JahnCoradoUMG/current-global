import { Injectable } from '@nestjs/common';
import { normalizePagination, paginated } from '../common/pagination';
import {
  likedByMeInclude,
  mapPost,
  postInclude,
} from '../common/post-mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(
    userId: string,
    type: string | undefined,
    query: { page?: number; limit?: number },
  ) {
    const feedType = type === 'following' ? 'following' : 'global';
    const { page, limit, skip } = normalizePagination(query);

    let authorFilter: { authorId?: { in: string[] } } = {};

    if (feedType === 'following') {
      const following = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const ids = following.map((f) => f.followingId);
      if (ids.length === 0) {
        return paginated([], 0, page, limit);
      }
      authorFilter = { authorId: { in: ids } };
    }

    const where = authorFilter;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          ...postInclude,
          ...likedByMeInclude(userId),
        },
      }),
    ]);

    return paginated(
      rows.map((p) => mapPost(p, userId)),
      total,
      page,
      limit,
    );
  }
}
