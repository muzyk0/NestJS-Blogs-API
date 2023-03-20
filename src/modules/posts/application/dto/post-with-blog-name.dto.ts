import { PostDomain } from '../../domain/post.domain';

export class PostWithBlogNameDto extends PostDomain {
  blogName: string;
}
