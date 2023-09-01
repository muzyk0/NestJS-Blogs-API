import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IQuizQuestionsRepository } from '../application/interfaces/quiz-questions-repository.abstract-class';
import { CreateQuizQuestionCommand } from '../application/use-cases/create-quiz-question.handler';
import { QuizQuestion } from '../domain/entity/quiz-question.entity';

@Injectable()
export class QuizQuestionsRepository implements IQuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly repo: Repository<QuizQuestion>,
  ) {}

  async create(dto: CreateQuizQuestionCommand): Promise<QuizQuestion> {
    const question = await this.repo.create({
      body: dto.body,
      answers: dto.correctAnswers,
    });

    return this.repo.save(question);
  }
}
