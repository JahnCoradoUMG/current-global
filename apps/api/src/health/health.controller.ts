import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthDto } from '../common/swagger-models';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Estado del API' })
  @ApiOkResponse({ type: HealthDto })
  check() {
    return { status: 'ok' };
  }
}
