import { CreateOrUpdateQuizQuestionDto } from '../../controllers/dto/create-or-update-quiz-question.dto';
import { PublishQuizQuestionDto } from '../../controllers/dto/publish-quiz-question.dto';
import { QuizQuestion } from '../../domain/entity/quiz-question.entity';
import { CreateQuizQuestionCommand } from '../use-cases/create-quiz-question.handler';

export abstract class IQuizQuestionsRepository {
  abstract findOneById(id: string): Promise<QuizQuestion | null>;
  abstract create(dto: CreateQuizQuestionCommand): Promise<QuizQuestion>;
  abstract delete(id: string): Promise<boolean>;
  abstract update(
    id: string,
    dto: CreateOrUpdateQuizQuestionDto,
  ): Promise<QuizQuestion | null>;
  abstract publish(id: string, dto: PublishQuizQuestionDto): Promise<boolean>;
}
