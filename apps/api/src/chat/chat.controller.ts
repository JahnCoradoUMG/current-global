import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiErrorResponses,
  ApiPageLimitQuery,
  ConversationListDto,
  ConversationSummaryDto,
  MessageDto,
  MessageReactionResultDto,
  PaginatedMessagesDto,
} from '../common/swagger-models';
import { SetReactionDto } from '../common/dto/set-reaction.dto';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@ApiErrorResponses(401)
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Conversaciones 1-a-1' })
  @ApiOkResponse({ type: ConversationListDto })
  listConversations(@CurrentUser() user: AuthUser) {
    return this.chatService.listConversations(user.id);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar o crear conversación' })
  @ApiOkResponse({ type: ConversationSummaryDto })
  @ApiErrorResponses(400, 404)
  findOrCreate(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.findOrCreate(user.id, dto.username);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Mensajes de una conversación' })
  @ApiParam({ name: 'id', description: 'UUID de la conversación' })
  @ApiPageLimitQuery()
  @ApiOkResponse({ type: PaginatedMessagesDto })
  @ApiErrorResponses(403, 404)
  listMessages(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.listMessages(id, user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar mensaje' })
  @ApiParam({ name: 'id', description: 'UUID de la conversación' })
  @ApiCreatedResponse({ type: MessageDto })
  @ApiErrorResponses(400, 403, 404)
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(id, user.id, dto);
  }

  @Post('messages/:messageId/reactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reaccionar a un mensaje (o quitar la misma reacción)' })
  @ApiParam({ name: 'messageId', description: 'UUID del mensaje' })
  @ApiOkResponse({ type: MessageReactionResultDto })
  @ApiErrorResponses(400, 403, 404)
  toggleMessageReaction(
    @CurrentUser() user: AuthUser,
    @Param('messageId') messageId: string,
    @Body() dto: SetReactionDto,
  ) {
    return this.chatService.toggleMessageReaction(
      messageId,
      user.id,
      dto.emoji,
    );
  }
}
