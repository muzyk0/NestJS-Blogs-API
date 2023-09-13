import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
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
import { DeleteQuizQuestionCommand } from '../application/use-cases/delete-quiz-question.handler';
import { PublishQuizQuestionCommand } from '../application/use-cases/publish-quiz-question.handler';
import { UpdateQuizQuestionCommand } from '../application/use-cases/update-quiz-question.handler';
import { QuizQuestion } from '../domain/entity/quiz-question.entity';

import { CreateOrUpdateQuizQuestionDto } from './dto/create-or-update-quiz-question.dto';
import { PublishQuizQuestionDto } from './dto/publish-quiz-question.dto';
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

  @ApiNoContentResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string): Promise<boolean> {
    const isDeleted = await this.commandBus.execute<
      DeleteQuizQuestionCommand,
      boolean
    >(new DeleteQuizQuestionCommand(id));

    if (!isDeleted) {
      throw new NotFoundException({
        field: '',
        message: "Question doesn't exist",
      });
    }

    return true;
  }

  @ApiNoContentResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No Content',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      "If the inputModel has incorrect values or property 'correctAnswers' are not passed but property 'published' is true",
    type: ErrorViewResultModel,
  })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: CreateOrUpdateQuizQuestionDto,
  ): Promise<boolean> {
    return await this.commandBus.execute<UpdateQuizQuestionCommand, boolean>(
      new UpdateQuizQuestionCommand(id, dto.body, dto.correctAnswers),
    );
  }

  @ApiNoContentResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No Content',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      "If the inputModel has incorrect values or property 'correctAnswers' are not passed but property 'published' is true",
    type: ErrorViewResultModel,
  })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
  })
  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param('id') id: string,
    @Body() dto: PublishQuizQuestionDto,
  ): Promise<boolean> {
    return await this.commandBus.execute<PublishQuizQuestionCommand, boolean>(
      new PublishQuizQuestionCommand(id, dto.published),
    );
  }
}
