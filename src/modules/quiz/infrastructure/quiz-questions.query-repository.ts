import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizPageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { IQuizQuestionsQueryRepository } from '../application/interfaces/quiz-questions-query-repository.abstract-class';
import { QuizQuestionViewModel } from '../controllers/dto/quiz-question-view-model';
import { QuizQuestion } from '../domain/entity/quiz-question.entity';

@Injectable()
export class QuizQuestionsQueryRepository
  implements IQuizQuestionsQueryRepository
{
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly repo: Repository<QuizQuestion>,
  ) {}

  async getAll(
    dto: QuizPageOptionsDto,
  ): Promise<PageDto<QuizQuestionViewModel>> {
    return new PageDto({
      items: [],
      itemsCount: 10,
      pageOptionsDto: dto,
    });
  }

  async getOneById(id: string): Promise<QuizQuestionViewModel> {
    const question = await this.repo.findOne({ where: { id } });

    return {
      id: question.id,
      body: question.id,
      correctAnswers: question.answers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }
}
