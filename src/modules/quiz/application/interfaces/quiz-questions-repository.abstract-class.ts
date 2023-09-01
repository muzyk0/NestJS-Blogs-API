import { QuizQuestion } from '../../domain/entity/quiz-question.entity';
import { CreateQuizQuestionCommand } from '../use-cases/create-quiz-question.handler';

export abstract class IQuizQuestionsRepository {
  abstract create(dto: CreateQuizQuestionCommand): Promise<QuizQuestion>;
}
