import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post, PostDocument } from '../posts/schemas/posts.schema';

import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentDocument, Comment } from './schemas/comments.schema';

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

    return this.commentModel.findOne({ id: comment.id });
  }

  async findOne(id: string): Promise<CommentDto> {
    return this.commentModel.findOne({ id });
  }

  async findPostComments(postId: string): Promise<CommentDto[]> {
    return this.commentModel.find({ postId: postId });
  }

  async update(updateCommentDto: UpdateCommentDto): Promise<CommentDto> {
    const updatedComment = await this.commentModel.findOneAndUpdate(
      { id: updateCommentDto.id },
      { $set: { content: updateCommentDto.content } },
      { returnDocument: 'after' },
    );

    return updatedComment;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.commentModel.deleteOne({ id });

    return result.deletedCount > 0;
  }
}
