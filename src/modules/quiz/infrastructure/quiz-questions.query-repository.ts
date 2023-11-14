import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PublishQuizQuestionEnum,
  QuizPageOptionsDto,
} from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { IQuizQuestionsQueryRepository } from '../application/interfaces/quiz-questions-query-repository.abstract-class';
import { QuizQuestionViewModel } from '../controllers/dto/quiz-question-view-model';
import { QuizQuestion } from '../domain/entity/quiz-question.entity';

@Injectable()
export class QuizQuestionsQueryRepository
  implements IQuizQuestionsQueryRepository
{
  mappedPublishedStatus = {
    [PublishQuizQuestionEnum.PUBLISHED]: true,
    [PublishQuizQuestionEnum.NOT_PUBLISHED]: false,
  };

  constructor(
    @InjectRepository(QuizQuestion)
    private readonly repo: Repository<QuizQuestion>,
  ) {}

  async getAll(
    dto: QuizPageOptionsDto,
  ): Promise<PageDto<QuizQuestionViewModel>> {
    const builder = this.repo.createQueryBuilder('qq');

    builder
      .select('qq.id')
      .addSelect('qq.body')
      .addSelect('qq.correctAnswers')
      .addSelect('qq.createdAt')
      .addSelect('qq.published')
      .addSelect('qq.updatedAt')
      .orderBy(`qq."${dto.sortBy!}"`, dto.sortDirection)
      .take(dto.pageSize)
      .skip(dto.skip);

    if (dto.bodySearchTerm) {
      builder.andWhere(`qq.body ilike '%' || :searchTerm || '%'`, {
        searchTerm: dto.bodySearchTerm,
      });
    }

    if (
      dto.publishedStatus &&
      this.mappedPublishedStatus[dto.publishedStatus] !== undefined
    ) {
      builder.andWhere(`qq.published = :publishedStatus`, {
        publishedStatus: this.mappedPublishedStatus[dto.publishedStatus],
      });
    }

    console.log(builder.getSql());

    const [questions, totalItems] = await builder.getManyAndCount();

    return new PageDto({
      items: questions.map(this.mapToViewModel),
      itemsCount: totalItems,
      pageOptionsDto: dto,
    });
  }

  async getOneById(id: string): Promise<QuizQuestionViewModel> {
    const question = await this.repo.findOneOrFail({ where: { id } });

    return this.mapToViewModel(question);
  }

  mapToViewModel(question: QuizQuestion): QuizQuestionViewModel {
    return {
      id: question.id,
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt?.toISOString() ?? null,
    };
  }
}
