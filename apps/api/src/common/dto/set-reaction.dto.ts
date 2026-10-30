import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const REACTION_KIND_VALUES = [
  'LIKE',
  'HEART',
  'LAUGH',
  'WOW',
  'SAD',
] as const;

export class SetReactionDto {
  @ApiProperty({ enum: REACTION_KIND_VALUES, example: 'HEART' })
  @IsIn(REACTION_KIND_VALUES)
  emoji!: (typeof REACTION_KIND_VALUES)[number];
}
