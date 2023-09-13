import { PostDomain } from '../../domain/post.domain';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

export abstract class IPostsRepository {
  abstract create(createPostDto: CreatePostDto): Promise<PostDomain>;

  abstract findOne(postId: string): Promise<PostDomain | null>;

  abstract update(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDomain | null>;

  abstract remove(postId: string): Promise<boolean>;
}
