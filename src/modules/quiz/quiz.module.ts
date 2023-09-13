import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { IQuizQuestionsQueryRepository } from './application/interfaces/quiz-questions-query-repository.abstract-class';
import { IQuizQuestionsRepository } from './application/interfaces/quiz-questions-repository.abstract-class';
import { Handlers } from './application/use-cases';
import { SAQuizQuestionsController } from './controllers/sa-quiz-questions.controller';
import { QuizQuestion } from './domain/entity/quiz-question.entity';
import { QuizQuestionsQueryRepository } from './infrastructure/quiz-questions.query-repository';
import { QuizQuestionsRepository } from './infrastructure/quiz-questions.repository';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([QuizQuestion]), AuthModule],
  controllers: [SAQuizQuestionsController],
  providers: [
    {
      provide: IQuizQuestionsQueryRepository,
      useClass: QuizQuestionsQueryRepository,
    },
    {
      provide: IQuizQuestionsRepository,
      useClass: QuizQuestionsRepository,
    },
    ...Handlers,
  ],
})
export class QuizModule {}
