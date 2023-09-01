import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorViewResultModel } from '../../../common/filters/interfaces/error-view-result.model';
import { QuizPageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../shared/paginator/page.dto';
import { BaseAuthGuard } from '../../auth/guards/base-auth-guard';
import { IQuizQuestionsQueryRepository } from '../application/interfaces/quiz-questions-query-repository.abstract-class';
import { CreateQuizQuestionCommand } from '../application/use-cases/create-quiz-question.handler';
import { QuizQuestion } from '../domain/entity/quiz-question.entity';

import {
  QuizQuestionSwaggerViewModel,
  QuizQuestionViewModel,
} from './dto/quiz-question-view-model';

@ApiBasicAuth()
@ApiTags('QuizQuestions')
@UseGuards(BaseAuthGuard)
@Controller('sa/quiz/questions')
export class SAQuizQuestionsController {
  constructor(
    private readonly queryRepo: IQuizQuestionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: QuizQuestionSwaggerViewModel,
  })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @Get()
  async getAllQuizQuestions(
    @Query() pageOptionsDto: QuizPageOptionsDto,
  ): Promise<PageDto<QuizQuestionViewModel>> {
    return this.queryRepo.getAll(pageOptionsDto);
  }

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Created',
    type: QuizQuestionViewModel,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'If the inputModel has incorrect values',
    type: ErrorViewResultModel,
  })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @Post()
  async createQuestion(
    @Body() command: CreateQuizQuestionCommand,
  ): Promise<QuizQuestionViewModel> {
    const result = await this.commandBus.execute<
      CreateQuizQuestionCommand,
      QuizQuestion
    >(command);

    return this.queryRepo.getOneById(result.id);
  }
}
