import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { PageDto } from '../../../../shared/paginator/page.dto';
import { CommentViewDto } from '../../application/dto/comment.view.dto';

export abstract class ICommentsQueryRepository {
  abstract findOne(id: string, userId?: string): Promise<CommentViewDto | null>;

  abstract findPostComments(
    findAllCommentsOptions: PageOptionsDto,
    { postId, userId }: { postId: string; userId?: string },
  ): Promise<PageDto<CommentViewDto>>;

  abstract findPostCommentsInsideUserBlogs(
    pageOptionsDto: PageOptionsDto,
    userId: string,
  ): Promise<PageDto<unknown>>;
}
