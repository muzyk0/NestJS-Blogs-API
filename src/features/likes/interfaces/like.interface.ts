import { LikeParentTypeEnum } from './like-parent-type.enum';
import { LikeStatus } from './like-status.enum';

export type LikeInterface = {
  userId: string;
  parentId: string;
  parentType: LikeParentTypeEnum;
  status: LikeStatus | null;
};
