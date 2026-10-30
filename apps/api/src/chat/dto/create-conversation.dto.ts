import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConversationDto {
  @ApiProperty({
    example: 'otro',
    minLength: 3,
    maxLength: 30,
    pattern: '^[a-z0-9_]+$',
    description: 'Username del otro participante. Crea la conversación si no existe.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/)
  username!: string;
}
