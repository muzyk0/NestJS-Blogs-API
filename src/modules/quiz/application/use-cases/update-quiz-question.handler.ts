import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateOrUpdateQuizQuestionDto } from '../../controllers/dto/create-or-update-quiz-question.dto';
import { IQuizQuestionsRepository } from '../interfaces/quiz-questions-repository.abstract-class';

export class UpdateQuizQuestionCommand extends CreateOrUpdateQuizQuestionDto {
  constructor(
    public readonly id: string,
    body: string,
    correctAnswers: string[],
  ) {
    super(body, correctAnswers);
  }
}

@CommandHandler(UpdateQuizQuestionCommand)
export class UpdateQuizQuestionHandler
  implements ICommandHandler<UpdateQuizQuestionCommand>
{
  constructor(private readonly repo: IQuizQuestionsRepository) {}

  async execute({ id, ...dto }: UpdateQuizQuestionCommand): Promise<boolean> {
    const question = await this.repo.findOneById(id);

    if (!question || question.published) {
      throw new NotFoundException({
        field: '',
        message: "Question doesn't exist",
      });
    }

    const updatedQuestion = await this.repo.update(id, dto);

    return !!updatedQuestion;
  }
}
