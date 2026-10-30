type AuthorShape = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

type PostWithRelations = {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: Date;
  updatedAt?: Date;
  author: AuthorShape;
  _count: { likes: number; comments: number };
  likes?: { userId: string }[];
};

export type PostResponse = {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: Date;
  author: AuthorShape;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
};

export function mapPost(
  post: PostWithRelations,
  currentUserId?: string,
): PostResponse {
  return {
    id: post.id,
    content: post.content,
    mediaUrl: post.mediaUrl,
    mediaType: post.mediaType,
    createdAt: post.createdAt,
    author: post.author,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByMe: currentUserId
      ? (post.likes?.some((l) => l.userId === currentUserId) ?? false)
      : false,
  };
}

export const postInclude = {
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  _count: { select: { likes: true, comments: true } },
} as const;

export function likedByMeInclude(userId: string) {
  return {
    likes: {
      where: { userId },
      select: { userId: true },
      take: 1,
    },
  };
}
