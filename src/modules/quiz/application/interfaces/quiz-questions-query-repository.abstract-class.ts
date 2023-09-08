import { QuizPageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../../shared/paginator/page.dto';
import { QuizQuestionViewModel } from '../../controllers/dto/quiz-question-view-model';

export abstract class IQuizQuestionsQueryRepository {
  abstract getAll(
    dto: QuizPageOptionsDto,
  ): Promise<PageDto<QuizQuestionViewModel>>;

  abstract getOneById(id: string): Promise<QuizQuestionViewModel>;
}
