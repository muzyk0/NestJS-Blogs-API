import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { QuizPageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth-guard';
import { IQuizQuestionsQueryRepository } from '../application/interfaces/quiz-questions-query-repository.abstract-class';

import {
  QuizQuestionSwaggerViewModel,
  QuizQuestionViewModel,
} from './dto/quiz-question-view-model';

@ApiBasicAuth()
@ApiTags('QuizQuestions')
@UseGuards(BaseAuthGuard)
@Controller('sa/quiz/questions')
export class SAQuizQuestionsController {
  constructor(private readonly repo: IQuizQuestionsQueryRepository) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: () => QuizQuestionSwaggerViewModel,
  })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @Get()
  async getAllQuizQuestions(
    @Query() pageOptionsDto: QuizPageOptionsDto,
  ): Promise<PageDto<QuizQuestionViewModel>> {
    return this.repo.getAll(pageOptionsDto);
  }
}
