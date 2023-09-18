import { ApiProperty } from '@nestjs/swagger';

import { PageDto } from '../../../../shared/paginator/page.dto';

export class QuizQuestionViewModel {
  @ApiProperty()
  id: string;
  @ApiProperty()
  body: string;
  @ApiProperty()
  correctAnswers: string[];
  @ApiProperty({ default: false })
  published: boolean;
  @ApiProperty({ type: Date })
  createdAt: string;
  @ApiProperty({ type: Date, nullable: true })
  updatedAt: string | null;
}

export class QuizQuestionSwaggerViewModel
  implements PageDto<QuizQuestionViewModel>
{
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly pageSize: number;

  @ApiProperty()
  readonly totalCount: number;

  @ApiProperty()
  readonly pagesCount: number;

  @ApiProperty({ type: [QuizQuestionViewModel] })
  items: QuizQuestionViewModel[];
}
