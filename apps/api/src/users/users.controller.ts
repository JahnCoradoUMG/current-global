import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiErrorResponses,
  ApiPageLimitQuery,
  AuthUserDto,
  PaginatedPostsDto,
  UserProfileDto,
  UserSearchResultDto,
} from '../common/swagger-models';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiErrorResponses(401)
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil propio' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiErrorResponses(400)
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar usuarios por username o nombre' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto a buscar. Mínimo 2 caracteres.',
    schema: { type: 'string', minLength: 2 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de resultados (default 8, máximo 20)',
    schema: { type: 'integer', default: 8, minimum: 1, maximum: 20 },
  })
  @ApiOkResponse({ type: UserSearchResultDto })
  @ApiErrorResponses(400)
  search(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.usersService.search(q ?? '', limit ? Number(limit) : undefined);
  }

  @Get(':username/posts')
  @ApiOperation({ summary: 'Posts de un usuario' })
  @ApiParam({ name: 'username', example: 'cesar' })
  @ApiPageLimitQuery()
  @ApiOkResponse({ type: PaginatedPostsDto })
  @ApiErrorResponses(404)
  listPosts(
    @Param('username') username: string,
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.listPostsByUsername(username, user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':username')
  @ApiOperation({ summary: 'Perfil público y contadores' })
  @ApiParam({ name: 'username', example: 'cesar' })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiErrorResponses(404)
  getByUsername(
    @Param('username') username: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.findByUsername(username, user.id);
  }
}
