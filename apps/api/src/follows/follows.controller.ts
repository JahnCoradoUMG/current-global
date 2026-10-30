import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiErrorResponses, FollowResultDto } from '../common/swagger-models';
import { FollowsService } from './follows.service';

@ApiTags('Follows')
@ApiBearerAuth()
@ApiErrorResponses(401)
@Controller('users')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':username/follow')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Seguir usuario' })
  @ApiParam({ name: 'username', example: 'cesar' })
  @ApiCreatedResponse({ type: FollowResultDto })
  @ApiErrorResponses(400, 404)
  follow(
    @Param('username') username: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.followsService.follow(user.id, username);
  }

  @Delete(':username/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dejar de seguir' })
  @ApiParam({ name: 'username', example: 'cesar' })
  @ApiNoContentResponse()
  @ApiErrorResponses(404)
  async unfollow(
    @Param('username') username: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.followsService.unfollow(user.id, username);
  }
}
