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
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<CommentDto | null> {
    const post = await this.postModel.findOne({ id: createCommentDto.postId });

    if (!post) {
      return null;
    }

    const comment = await this.commentModel.create(createCommentDto);

    return this.commentModel.findOne({ id: comment.id }, projectionFields);
  }

  async findOne(id: string): Promise<CommentDto> {
    return this.commentModel.findOne({ id }, projectionFields);
  }

  findOneWithUserId(id: string, userId: string) {
    return this.commentModel.findOne({ id, userId }, projectionFields);
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

  async update(updateCommentDto: UpdateCommentDto): Promise<CommentDto> {
    const updatedComment = await this.commentModel.findOneAndUpdate(
      { id: updateCommentDto.id },
      { $set: { content: updateCommentDto.content } },
      { returnDocument: 'after', projection: projectionFields },
    );

    return updatedComment;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.commentModel.deleteOne({ id });

    return result.deletedCount > 0;
  }
}
