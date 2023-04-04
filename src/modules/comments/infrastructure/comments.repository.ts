import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { BloggerBanUser } from '../../bans/domain/entity/blogger-ban-user.entity';
import { CreateCommentDto } from '../application/dto/create-comment.dto';
import { UpdateCommentDto } from '../application/dto/update-comment.dto';
import { ICommentsRepository } from '../application/interfaces/comment-repository.abstract-class';
import { Comment } from '../domain/entities/comment.entity';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(BloggerBanUser)
    private readonly bloggerBanUserRepo: Repository<BloggerBanUser>,
  ) {}

  async create({
    content,
    userId,
    postId,
  }: CreateCommentDto): Promise<Comment | null> {
    const bannedUserForBlog = await this.bloggerBanUserRepo.findOne({
      where: { userId, banned: Not(IsNull()) },
    });

    if (bannedUserForBlog) {
      return null;
    }

    const comment = this.commentsRepo.create({
      content,
      userId,
      postId,
    });

    return this.commentsRepo.save(comment);
  }

  async findOne(id: string): Promise<Comment> {
    return this.commentsRepo.findOneById(id);
  }

  async update(
    commentId: string,
    { content }: UpdateCommentDto,
  ): Promise<Comment | null> {
    const result = await this.commentsRepo.update(
      { id: commentId },
      { content },
    );

    if (!result.affected) {
      return null;
    }
    return this.commentsRepo.findOneById(commentId);
  }

  async remove(commentId: string): Promise<boolean> {
    const result = await this.commentsRepo.delete(commentId);
    if (!result.affected) {
      return false;
    }

    return true;
  }
}
