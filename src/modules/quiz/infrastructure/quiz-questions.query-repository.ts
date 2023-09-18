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
    const builder = this.repo.createQueryBuilder('qq');

    builder
      .select('qq.id', 'id')
      .addSelect('qq.body', 'body')
      .addSelect('qq.answers', 'correctAnswers')
      .addSelect('qq.createdAt', 'createdAt')
      .addSelect('qq.published', 'published')
      .addSelect('qq.updatedAt', 'updatedAt')
      .orderBy(`qq.${dto.sortBy!}`, dto.sortDirection)
      .limit(dto.pageSize)
      .skip(dto.skip);

    const result = await builder.getRawMany();

    const totalItems = await this.repo.count();

    return new PageDto({
      items: result as never as QuizQuestionViewModel[],
      itemsCount: totalItems,
      pageOptionsDto: dto,
    });
  }

  async getOneById(id: string): Promise<QuizQuestionViewModel> {
    const question = await this.repo.findOneOrFail({ where: { id } });

    return {
      id: question.id,
      body: question.body,
      correctAnswers: question.answers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt?.toISOString() ?? null,
    };
  }
}
