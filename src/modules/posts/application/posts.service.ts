import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { IBlogsRepository } from '../../blogs/infrastructure/blogs.sql.repository';
import { LikeParentTypeEnum } from '../../likes/application/interfaces/like-parent-type.enum';
import { LikeStringStatus } from '../../likes/application/interfaces/like-status.enum';
import { LikesService } from '../../likes/application/likes.service';
import { formatLikeStatusToInt } from '../../likes/utils/formatters';
import { PostsRepository } from '../infrastructure/posts.repository';

import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDbDto } from './dto/update-post-db.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export interface IPostService {
  create(createPostDto: Omit<CreatePostDto, 'id'>): Promise<PostDto>;

  findOne(id: string): Promise<PostDto>;

  update(
    postId: string,
    blogId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDto>;

  remove(id: string): Promise<boolean>;
}

@Injectable()
export class PostsService implements IPostService {
  constructor(
    private readonly postRepository: PostsRepository,
    private readonly blogRepository: IBlogsRepository,
    private readonly likeService: LikesService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const blog = await this.blogRepository.findOne(createPostDto.blogId);

    if (!blog) {
      return null;
    }

    const newPostInput: PostDto = {
      id: v4(),
      blogId: blog.id,
      blogName: blog.name,
      title: createPostDto.title,
      content: createPostDto.content,
      shortDescription: createPostDto.shortDescription,
      createdAt: new Date(),
    };

    return this.postRepository.create(newPostInput);
  }

  async findOne(id: string) {
    return this.postRepository.findOne(id);
  }

  async update(
    postId: string,
    blogId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDto> {
    const blog = await this.blogRepository.findOne(blogId);

    if (!blog) {
      return null;
    }

    const updatedPost: UpdatePostDbDto = {
      blogName: blog.name,
      title: updatePostDto.title,
      content: updatePostDto.content,
      shortDescription: updatePostDto.shortDescription,
    };

    return this.postRepository.update(postId, updatedPost);
  }

  async remove(id: string) {
    return this.postRepository.remove(id);
  }

  async updatePostLikeStatus(updateLike: {
    postId: string;
    userId: string;
    likeStatus: LikeStringStatus;
  }) {
    const post = await this.postRepository.findOne(updateLike.postId);

    if (!post) {
      return null;
    }

    const status = formatLikeStatusToInt(updateLike.likeStatus);

    return this.likeService.updateLikeStatus({
      parentId: updateLike.postId,
      parentType: LikeParentTypeEnum.POST,
      userId: updateLike.userId,
      likeStatus: status,
    });
  }
}
