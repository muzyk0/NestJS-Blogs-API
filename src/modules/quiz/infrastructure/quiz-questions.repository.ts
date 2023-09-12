import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IQuizQuestionsRepository } from '../application/interfaces/quiz-questions-repository.abstract-class';
import { CreateQuizQuestionCommand } from '../application/use-cases/create-quiz-question.handler';
import { CreateOrUpdateQuizQuestionDto } from '../controllers/dto/create-or-update-quiz-question.dto';
import { PublishQuizQuestionDto } from '../controllers/dto/publish-quiz-question.dto';
import { QuizQuestion } from '../domain/entity/quiz-question.entity';

@Injectable()
export class QuizQuestionsRepository implements IQuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly repo: Repository<QuizQuestion>,
  ) {}

  async findOneById(id: string): Promise<QuizQuestion | null> {
    return await this.repo.findOneBy({ id });
  }

  async create(dto: CreateQuizQuestionCommand): Promise<QuizQuestion> {
    const question = this.repo.create({
      body: dto.body,
      answers: dto.correctAnswers,
    });

    return this.repo.save(question);
  }

  async delete(id: string): Promise<boolean> {
    const question = await this.repo.delete({
      id,
    });

    return !!question.affected;
  }

  async update(
    id: string,
    dto: CreateOrUpdateQuizQuestionDto,
  ): Promise<QuizQuestion | null> {
    await this.repo.update(
      { id, published: false },
      { body: dto.body, answers: dto.correctAnswers },
    );

    return await this.repo.findOneBy({ id });
  }

  async publish(id: string, dto: PublishQuizQuestionDto): Promise<boolean> {
    const result = await this.repo.update({ id }, { published: dto.published });

    return !!result.affected;
  }
}
