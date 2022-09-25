import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';
import { Post, PostDocument } from '../posts/schemas/posts.schema';

import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentDocument, Comment } from './schemas/comments.schema';

const projectionFields = { ...BASE_PROJECTION, postId: 0 };
export class FindAllCommentsOptions extends PageOptionsDto {
  constructor(postId: string) {
    super();
    this.postId = postId;
  }

  @IsInt()
  @IsOptional()
  postId?: string;
}

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async findOne(id: string): Promise<CommentDto> {
    return this.commentModel.findOne({ id }, projectionFields);
  }

  async findPostComments(
    findAllCommentsOptions: FindAllCommentsOptions,
  ): Promise<PageDto<CommentDto>> {
    const filter = { postId: findAllCommentsOptions.postId };

    const itemsCount = await this.commentModel.countDocuments(filter);

    const items = await this.commentModel
      .find(filter, projectionFields)
      .skip(findAllCommentsOptions.skip)
      .sort({
        [findAllCommentsOptions.sortBy]: findAllCommentsOptions.sortDirection,
      })
      .limit(findAllCommentsOptions.pageSize);

    return new PageDto({
      items,
      itemsCount,
      pageOptionsDto: findAllCommentsOptions,
    });
  }
}
