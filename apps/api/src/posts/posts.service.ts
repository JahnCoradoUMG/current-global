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
import {
  likedByMeInclude,
  mapPost,
  postInclude,
} from '../common/post-mapper';
import { MediaService } from '../media/media.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(
    authorId: string,
    dto: CreatePostDto,
    file?: Express.Multer.File,
  ) {
    const content = dto.content?.trim() ?? '';
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (file) {
      const uploaded = await this.media.uploadImage(file);
      mediaUrl = uploaded.url;
      mediaType = uploaded.mediaType;
    }

    if (!content && !mediaUrl) {
      throw new BadRequestException(
        'Post requires content and/or an image file',
      );
    }

    const post = await this.prisma.post.create({
      data: {
        authorId,
        content: content || '',
        mediaUrl,
        mediaType,
      },
      include: {
        ...postInclude,
        ...likedByMeInclude(authorId),
      },
    });

    return mapPost(post, authorId);
  }

  async findOne(id: string, currentUserId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        ...postInclude,
        ...likedByMeInclude(currentUserId),
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return mapPost(post, currentUserId);
  }

  async remove(id: string, currentUserId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('Only the author can delete this post');
    }

    await this.prisma.post.delete({ where: { id } });
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    let liked: boolean;

    if (existing) {
      await this.prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
      liked = false;
    } else {
      await this.prisma.like.create({
        data: { userId, postId },
      });
      liked = true;
      await this.notifications.createIfNeeded({
        userId: post.authorId,
        actorId: userId,
        type: NotificationType.LIKE,
        entityId: postId,
      });
    }

    const likesCount = await this.prisma.like.count({ where: { postId } });

    this.realtime.emitToPost(postId, 'post:like:updated', {
      postId,
      likesCount,
      userId,
      liked,
    });

    return { liked, likesCount };
  }

  async listComments(
    postId: string,
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { page, limit, skip } = normalizePagination(query);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.comment.count({ where: { postId } }),
      this.prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          reactions: {
            select: { emoji: true, userId: true },
          },
        },
      }),
    ]);

    return paginated(
      rows.map((row) => this.mapComment(row, userId)),
      total,
      page,
      limit,
    );
  }

  async addComment(
    postId: string,
    authorId: string,
    dto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId,
        content: dto.content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    await this.notifications.createIfNeeded({
      userId: post.authorId,
      actorId: authorId,
      type: NotificationType.COMMENT,
      entityId: comment.id,
    });

    const commentsCount = await this.prisma.comment.count({
      where: { postId },
    });

    const mapped = {
      ...comment,
      reactions: emptyReactionSummary(),
    };

    this.realtime.emitToPost(postId, 'post:comment:updated', {
      postId,
      commentsCount,
      comment: mapped,
    });

    return mapped;
  }

  async toggleCommentReaction(
    commentId: string,
    userId: string,
    emoji: ReactionKind,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existing = await this.prisma.commentReaction.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing?.emoji === emoji) {
      await this.prisma.commentReaction.delete({
        where: { userId_commentId: { userId, commentId } },
      });
    } else if (existing) {
      await this.prisma.commentReaction.update({
        where: { userId_commentId: { userId, commentId } },
        data: { emoji },
      });
    } else {
      await this.prisma.commentReaction.create({
        data: { userId, commentId, emoji },
      });
    }

    const rows = await this.prisma.commentReaction.findMany({
      where: { commentId },
      select: { emoji: true, userId: true },
    });
    const reaction = toReactionUpdate(summarizeReactions(rows, userId), userId);

    this.realtime.emitToPost(comment.postId, 'comment:reaction:updated', {
      commentId,
      postId: comment.postId,
      reaction,
    });

    return { commentId, postId: comment.postId, reaction };
  }

  private mapComment(
    row: {
      id: string;
      postId: string;
      authorId: string;
      content: string;
      createdAt: Date;
      author: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
      };
      reactions: { emoji: ReactionKind; userId: string }[];
    },
    userId: string,
  ) {
    const { reactions, ...comment } = row;
    return {
      ...comment,
      reactions: summarizeReactions(reactions, userId),
    };
  }
}
