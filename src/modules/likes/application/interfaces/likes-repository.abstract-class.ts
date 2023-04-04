import { Like } from '../../domain/entity/like.entity';

import { LikeInterface } from './like.interface';

export abstract class ILikesRepository {
  abstract createOrUpdatePostLikeStatus(
    createLike: Omit<LikeInterface, 'commentId'>,
  ): Promise<Like | null>;

  abstract createOrUpdateCommentLikeStatus(
    createLike: Omit<LikeInterface, 'postId'>,
  ): Promise<Like | null>;
}
