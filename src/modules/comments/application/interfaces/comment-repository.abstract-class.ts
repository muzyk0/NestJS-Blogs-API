import { Comment } from '../../domain/entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

export abstract class ICommentsRepository {
  abstract create({
    content,
    userId,
    postId,
  }: CreateCommentDto): Promise<Comment | null>;

  abstract findOne(id: string): Promise<Comment | null>;

  abstract update(
    commentId: string,
    { content }: UpdateCommentDto,
  ): Promise<Comment | null>;

  abstract remove(commentId: string): Promise<boolean>;
}
