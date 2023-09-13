import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, Length } from 'class-validator';

export class CreateOrUpdateQuizQuestionDto {
  @ApiProperty({ type: 'string', minLength: 10, maxLength: 500 })
  @IsString()
  @Length(10, 500)
  body: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  correctAnswers: string[];

  constructor(body: string, correctAnswers: string[]) {
    this.body = body;
    this.correctAnswers = correctAnswers;
  }
}
