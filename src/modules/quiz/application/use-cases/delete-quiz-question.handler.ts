import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { IQuizQuestionsRepository } from '../interfaces/quiz-questions-repository.abstract-class';

export class DeleteQuizQuestionCommand {
  @ApiProperty({ type: 'string' })
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionHandler
  implements ICommandHandler<DeleteQuizQuestionCommand>
{
  constructor(private readonly repo: IQuizQuestionsRepository) {}

  async execute(dto: DeleteQuizQuestionCommand): Promise<boolean> {
    return this.repo.delete(dto.id);
  }
}
