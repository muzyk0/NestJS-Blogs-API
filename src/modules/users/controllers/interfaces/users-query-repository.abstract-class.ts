import { PageOptionsForUserDto } from '../../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../../shared/paginator/page.dto';
import {
  UserBloggerViewModel,
  UserMeQueryViewModel,
  UserViewModel,
} from '../../infrastructure/dto/user.view';

export abstract class IUsersQueryRepository {
  abstract findOneForMeQuery(id: string): Promise<UserMeQueryViewModel | null>;

  abstract findOne(id: string): Promise<UserViewModel | null>;

  abstract findAll(
    pageOptionsDto: PageOptionsForUserDto,
  ): Promise<PageDto<UserViewModel>>;

  abstract getBannedUsersForBlog(
    pageOptionsDto: PageOptionsForUserDto,
    blogId: string,
  ): Promise<PageDto<UserBloggerViewModel>>;
}
