import type { ReactionSummary } from "./reactions";

export type UserPublic = {
  id: string;
  email?: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio?: string | null;
};

export type AuthResponse = {
  user: UserPublic;
  accessToken: string;
};

export type PostItem = {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserSearchHit = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type UserProfile = UserPublic & {
  createdAt: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
};

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  reactions: ReactionSummary;
};

export type NotificationItem = {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "MESSAGE";
  actor: {
    id?: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  entityId: string;
  readAt?: string | null;
  createdAt: string;
};

export type ChatPeer = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  reactions: ReactionSummary;
};

export type ConversationListItem = {
  id: string;
  peer: ChatPeer;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  createdAt: string;
};
