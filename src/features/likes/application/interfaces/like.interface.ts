import { LikeParentTypeEnum } from './like-parent-type.enum';
import { LikeStatus } from './like-status.enum';

export interface LikeInterface {
  userId: string;
  parentId: string;
  parentType: LikeParentTypeEnum;
  status: LikeStatus | null;
}
