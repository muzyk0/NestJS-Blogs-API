import { BanUnbanUserInput } from '../../../users/application/dto/ban-unban-user.input';

export abstract class IUserBanRepository {
  abstract createOrUpdateBan(
    id: string,
    payload: BanUnbanUserInput,
  ): Promise<boolean>;
}
