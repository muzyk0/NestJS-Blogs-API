import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishQuizQuestionDto {
  @ApiProperty({ type: 'boolean' })
  @IsBoolean()
  published: boolean;

  constructor(published: boolean) {
    this.published = published;
  }
}
