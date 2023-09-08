import { CreateQuizQuestionHandler } from './create-quiz-question.handler';
import { DeleteQuizQuestionHandler } from './delete-quiz-question.handler';
import { PublishQuizQuestionHandler } from './publish-quiz-question.handler';
import { UpdateQuizQuestionHandler } from './update-quiz-question.handler';

export const Handlers = [
  CreateQuizQuestionHandler,
  DeleteQuizQuestionHandler,
  UpdateQuizQuestionHandler,
  PublishQuizQuestionHandler,
];
