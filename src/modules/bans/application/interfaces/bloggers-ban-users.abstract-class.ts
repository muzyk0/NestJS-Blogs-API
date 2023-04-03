import { BloggerBanUser } from '../../domain/entity/blogger-ban-user.entity';
import { CreateBanInput } from '../input/create-ban.input';

export abstract class IBloggersBanUsersRepository {
  abstract updateOrCreateBan(
    createBanInput: CreateBanInput,
  ): Promise<BloggerBanUser>;
}
