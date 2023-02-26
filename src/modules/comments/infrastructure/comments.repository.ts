import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../../../shared/mongoose/constants';
import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
import { ICommentsRepository } from '../application/comments.service';
import { CommentDto } from '../application/dto/comment.dto';
import { CreateCommentDto } from '../application/dto/create-comment.dto';
import { UpdateCommentDto } from '../application/dto/update-comment.dto';
import { Comment, CommentDocument } from '../domain/schemas/comments.schema';

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
export class CommentsRepository implements ICommentsRepository {
  postModel: any;
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
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
