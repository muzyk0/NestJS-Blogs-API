import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../../shared/paginator/page.dto';
import { BlogView, BlogViewDtoForSuperAdmin } from '../dto/blog.dto';

export abstract class IBlogsQueryRepository {
  abstract findOne(id: string): Promise<BlogView>;

  abstract findAll(
    pageOptionsDto: PageOptionsDto,
    userId?: string,
  ): Promise<PageDto<BlogView>>;

  abstract findAllForAdmin(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<BlogViewDtoForSuperAdmin>>;
}
