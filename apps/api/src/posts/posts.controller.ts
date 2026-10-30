import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiErrorResponses,
  ApiPageLimitQuery,
  CommentDto,
  CommentReactionResultDto,
  LikeToggleDto,
  PaginatedCommentsDto,
  PostDto,
} from '../common/swagger-models';
import { SetReactionDto } from '../common/dto/set-reaction.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@ApiBearerAuth()
@ApiErrorResponses(401)
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear post (texto y/o imagen)' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    description:
      'JSON con content, o multipart con content y file (jpeg, png o webp, máximo 5 MB). Hace falta texto o imagen.',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          maxLength: 2000,
          example: 'Hola Current Global',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Opcional. image/jpeg, image/png o image/webp. Máximo 5 MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: PostDto })
  @ApiErrorResponses(400)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.create(user.id, dto, file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un post' })
  @ApiParam({ name: 'id', description: 'UUID del post' })
  @ApiOkResponse({ type: PostDto })
  @ApiErrorResponses(404)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.postsService.findOne(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar post (solo el autor)' })
  @ApiParam({ name: 'id', description: 'UUID del post' })
  @ApiNoContentResponse()
  @ApiErrorResponses(403, 404)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.postsService.remove(id, user.id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alternar like' })
  @ApiParam({ name: 'id', description: 'UUID del post' })
  @ApiOkResponse({ type: LikeToggleDto })
  @ApiErrorResponses(404)
  toggleLike(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.postsService.toggleLike(id, user.id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Comentarios de un post' })
  @ApiParam({ name: 'id', description: 'UUID del post' })
  @ApiPageLimitQuery()
  @ApiOkResponse({ type: PaginatedCommentsDto })
  @ApiErrorResponses(404)
  listComments(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.listComments(id, user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Comentar un post' })
  @ApiParam({ name: 'id', description: 'UUID del post' })
  @ApiCreatedResponse({ type: CommentDto })
  @ApiErrorResponses(400, 404)
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(id, user.id, dto);
  }

  @Post('comments/:commentId/reactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reaccionar a un comentario (o quitar la misma reacción)' })
  @ApiParam({ name: 'commentId', description: 'UUID del comentario' })
  @ApiOkResponse({ type: CommentReactionResultDto })
  @ApiErrorResponses(400, 404)
  toggleCommentReaction(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SetReactionDto,
  ) {
    return this.postsService.toggleCommentReaction(
      commentId,
      user.id,
      dto.emoji,
    );
  }
}
