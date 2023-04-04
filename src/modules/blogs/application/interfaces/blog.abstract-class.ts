import { Blog } from '../../domain/entities/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

export abstract class IBlogsRepository {
  abstract create(data: CreateBlogDto): Promise<Blog>;

  abstract findOne(id: string): Promise<Blog | null>;

  abstract update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog>;

  abstract remove(id: string): Promise<boolean>;

  abstract bindBlogOnUser(blogId: string, userId: string): Promise<Blog>;

  abstract updateBanStatus(
    blogId: string,
    isBanned: boolean,
  ): Promise<Blog | null>;
}
