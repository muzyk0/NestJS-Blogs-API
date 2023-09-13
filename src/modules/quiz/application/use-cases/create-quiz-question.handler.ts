import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateOrUpdateQuizQuestionDto } from '../../controllers/dto/create-or-update-quiz-question.dto';
import { QuizQuestion } from '../../domain/entity/quiz-question.entity';
import { IQuizQuestionsRepository } from '../interfaces/quiz-questions-repository.abstract-class';

export class CreateQuizQuestionCommand extends CreateOrUpdateQuizQuestionDto {
  constructor(body: string, correctAnswers: string[]) {
    super(body, correctAnswers);
  }
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
