import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateQuizQuestion {
  constructor(public readonly token: string) {}
}

@CommandHandler(CreateQuizQuestion)
export class CreateQuizQuestionHandler
  implements ICommandHandler<CreateQuizQuestion>
{
  async execute({ token }: CreateQuizQuestion): Promise<boolean> {
    return true;
  }
}
