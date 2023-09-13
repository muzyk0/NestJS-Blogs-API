import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PublishQuizQuestionDto } from '../../controllers/dto/publish-quiz-question.dto';
import { IQuizQuestionsRepository } from '../interfaces/quiz-questions-repository.abstract-class';

export class PublishQuizQuestionCommand extends PublishQuizQuestionDto {
  constructor(public readonly id: string, published: boolean) {
    super(published);
  }
}

@CommandHandler(PublishQuizQuestionCommand)
export class PublishQuizQuestionHandler
  implements ICommandHandler<PublishQuizQuestionCommand>
{
  constructor(private readonly repo: IQuizQuestionsRepository) {}

  async execute({ id, ...dto }: PublishQuizQuestionCommand): Promise<boolean> {
    const question = await this.repo.findOneById(id);

    if (!question) {
      throw new BadRequestException({
        field: '',
        message: "Question doesn't exist",
      });
    }

    return await this.repo.publish(id, dto);
  }
}
