import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiPropertyOptional({
    example: 'Hola Current Global',
    maxLength: 2000,
    description: 'Texto del post. Obligatorio si no se envía imagen.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}
