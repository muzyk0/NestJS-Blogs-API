import { BaseEntityDto } from '../../../../shared/base-entity/base.entity.dto';

export class UserRowSqlDto extends BaseEntityDto {
  id: string;

  login: string;

  email: string;

  password: string;

  isConfirmed: boolean;

  confirmationCode: string | null;

  expirationDate: Date | null;

  banned: string;

  banReason: string;
}
