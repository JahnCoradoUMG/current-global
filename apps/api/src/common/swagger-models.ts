import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiQuery, ApiResponse } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Texto o lista de mensajes de validación',
  })
  message!: string;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}

export class HealthDto {
  @ApiProperty({ example: 'ok' })
  status!: string;
}

export class PublicUserDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'cesar' })
  username!: string;

  @ApiProperty({ example: 'Cesar Puac' })
  displayName!: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  avatarUrl!: string | null;
}

export class AuthUserDto extends PublicUserDto {
  @ApiPropertyOptional({ type: String, nullable: true, example: null })
  bio?: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ type: PublicUserDto })
  user!: PublicUserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiJ9.payload.signature',
    description: 'JWT para el header Authorization: Bearer',
  })
  accessToken!: string;
}

export class UserSearchHitDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'cesar' })
  username!: string;

  @ApiProperty({ example: 'Cesar Puac' })
  displayName!: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  avatarUrl!: string | null;
}

export class UserSearchResultDto {
  @ApiProperty({ type: [UserSearchHitDto] })
  data!: UserSearchHitDto[];
}

export class UserProfileDto extends AuthUserDto {
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: 3 })
  postsCount!: number;

  @ApiProperty({ example: 10 })
  followersCount!: number;

  @ApiProperty({ example: 4 })
  followingCount!: number;

  @ApiProperty({ example: false })
  isFollowing!: boolean;
}

export class PostAuthorDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'cesar' })
  username!: string;

  @ApiProperty({ example: 'Cesar Puac' })
  displayName!: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  avatarUrl!: string | null;
}

export class PostDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'Hola Current Global' })
  content!: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  mediaUrl!: string | null;

  @ApiProperty({ type: String, nullable: true, example: null })
  mediaType!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: PostAuthorDto })
  author!: PostAuthorDto;

  @ApiProperty({ example: 3 })
  likesCount!: number;

  @ApiProperty({ example: 1 })
  commentsCount!: number;

  @ApiProperty({ example: false })
  likedByMe!: boolean;
}

export class LikeToggleDto {
  @ApiProperty({ example: true })
  liked!: boolean;

  @ApiProperty({ example: 12 })
  likesCount!: number;
}

export class ReactionCountsDto {
  @ApiProperty({ example: 1 })
  LIKE!: number;

  @ApiProperty({ example: 0 })
  HEART!: number;

  @ApiProperty({ example: 0 })
  LAUGH!: number;

  @ApiProperty({ example: 0 })
  WOW!: number;

  @ApiProperty({ example: 0 })
  SAD!: number;
}

export class ReactionSummaryDto {
  @ApiProperty({ type: ReactionCountsDto })
  counts!: ReactionCountsDto;

  @ApiProperty({
    enum: ['LIKE', 'HEART', 'LAUGH', 'WOW', 'SAD'],
    nullable: true,
    example: 'HEART',
  })
  mine!: 'LIKE' | 'HEART' | 'LAUGH' | 'WOW' | 'SAD' | null;
}

export class ReactionUpdateDto {
  @ApiProperty({ type: ReactionCountsDto })
  counts!: ReactionCountsDto;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  actorId!: string;

  @ApiProperty({
    enum: ['LIKE', 'HEART', 'LAUGH', 'WOW', 'SAD'],
    nullable: true,
    example: 'HEART',
  })
  actorEmoji!: 'LIKE' | 'HEART' | 'LAUGH' | 'WOW' | 'SAD' | null;
}

export class CommentReactionResultDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  commentId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  postId!: string;

  @ApiProperty({ type: ReactionUpdateDto })
  reaction!: ReactionUpdateDto;
}

export class MessageReactionResultDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  messageId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  conversationId!: string;

  @ApiProperty({ type: ReactionUpdateDto })
  reaction!: ReactionUpdateDto;
}

export class CommentDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  postId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  authorId!: string;

  @ApiProperty({ example: 'Nice!' })
  content!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: PostAuthorDto })
  author!: PostAuthorDto;

  @ApiProperty({ type: () => ReactionSummaryDto })
  reactions!: ReactionSummaryDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class PaginatedPostsDto {
  @ApiProperty({ type: [PostDto] })
  data!: PostDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class PaginatedCommentsDto {
  @ApiProperty({ type: [CommentDto] })
  data!: CommentDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class NotificationActorDto {
  @ApiProperty({ example: 'cesar' })
  username!: string;

  @ApiProperty({ example: 'Cesar Puac' })
  displayName!: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  avatarUrl!: string | null;
}

export class NotificationDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ enum: ['LIKE', 'COMMENT', 'FOLLOW', 'MESSAGE'], example: 'LIKE' })
  type!: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MESSAGE';

  @ApiProperty({ type: NotificationActorDto })
  actor!: NotificationActorDto;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  entityId!: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true, example: null })
  readAt!: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class PaginatedNotificationsDto {
  @ApiProperty({ type: [NotificationDto] })
  data!: NotificationDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class FollowResultDto {
  @ApiProperty({ example: true })
  following!: boolean;
}

export class ChatPeerDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'otro' })
  username!: string;

  @ApiProperty({ example: 'Otro Usuario' })
  displayName!: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  avatarUrl!: string | null;
}

export class ChatMessagePreviewDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'Hola' })
  content!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  senderId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class ConversationSummaryDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ type: ChatPeerDto })
  peer!: ChatPeerDto;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class ConversationDto extends ConversationSummaryDto {
  @ApiProperty({ type: ChatMessagePreviewDto, nullable: true })
  lastMessage!: ChatMessagePreviewDto | null;
}

export class ConversationListDto {
  @ApiProperty({ type: [ConversationDto] })
  data!: ConversationDto[];
}

export class MessageDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  conversationId!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  senderId!: string;

  @ApiProperty({ example: 'Hola' })
  content!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: () => ReactionSummaryDto })
  reactions!: ReactionSummaryDto;
}

export class PaginatedMessagesDto {
  @ApiProperty({ type: [MessageDto] })
  data!: MessageDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export function ApiPageLimitQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      schema: { type: 'integer', default: 1, minimum: 1 },
      description: 'Página (default 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      schema: { type: 'integer', default: 20, minimum: 1, maximum: 50 },
      description: 'Tamaño de página (default 20, máximo 50)',
    }),
  );
}

export function ApiErrorResponses(...codes: number[]) {
  return applyDecorators(
    ...codes.map((status) =>
      ApiResponse({
        status,
        description: apiErrorDescription(status),
        type: ApiErrorDto,
      }),
    ),
  );
}

function apiErrorDescription(status: number): string {
  switch (status) {
    case 400:
      return 'Validación o regla de negocio';
    case 401:
      return 'Sin token o token inválido';
    case 403:
      return 'Autenticado pero sin permiso';
    case 404:
      return 'Recurso no encontrado';
    case 409:
      return 'Conflicto (email o username duplicado)';
    default:
      return 'Error';
  }
}
