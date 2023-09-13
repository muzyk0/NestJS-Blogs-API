import { ApiProperty } from '@nestjs/swagger';

export class ErrorMessage {
  @ApiProperty()
  message: string;
  @ApiProperty()
  field: string;
}

export class ErrorViewResultModel {
  @ApiProperty({ type: [ErrorMessage] })
  errorsMessages: ErrorMessage[];
}
