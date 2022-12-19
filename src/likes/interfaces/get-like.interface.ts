import { LikeParentTypeEnum } from './like-parent-type.enum';

export interface GetCommentLikeByUser {
  userId: string;
  parentId: string;
  parentType: LikeParentTypeEnum;
}
