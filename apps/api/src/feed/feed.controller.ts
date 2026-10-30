import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiErrorResponses,
  ApiPageLimitQuery,
  PaginatedPostsDto,
} from '../common/swagger-models';
import { FeedService } from './feed.service';

@ApiTags('Feed')
@ApiBearerAuth()
@ApiErrorResponses(401)
@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({ summary: 'Feed global o de seguidos' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['global', 'following'],
    description: 'Default global',
  })
  @ApiPageLimitQuery()
  @ApiOkResponse({ type: PaginatedPostsDto })
  getFeed(
    @CurrentUser() user: AuthUser,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getFeed(user.id, type, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
