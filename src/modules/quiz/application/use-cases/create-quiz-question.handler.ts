import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, Length } from 'class-validator';

import { QuizQuestion } from '../../domain/entity/quiz-question.entity';
import { IQuizQuestionsRepository } from '../interfaces/quiz-questions-repository.abstract-class';

export class CreateQuizQuestionCommand {
  @ApiProperty({ type: 'string', minLength: 10, maxLength: 500 })
  @IsString()
  @Length(10, 500)
  body: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  correctAnswers: string[];
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionHandler
  implements ICommandHandler<CreateQuizQuestionCommand>
{
  constructor(private readonly repo: IQuizQuestionsRepository) {}

  async execute(dto: CreateQuizQuestionCommand): Promise<QuizQuestion> {
    return this.repo.create(dto);
  }
}
