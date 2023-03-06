import { Injectable } from '@nestjs/common';

import { IBlogsRepository } from '../../blogs/infrastructure/blogs.sql.repository';
import { LikeStringStatus } from '../../likes/application/interfaces/like-status.enum';
import { LikesService } from '../../likes/application/likes.service';
import { formatLikeStatusToInt } from '../../likes/utils/formatters';
import { PostDomain } from '../domain/post.domain';
import { IPostsRepository } from '../infrastructure/posts.sql.repository';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export interface IPostService {
  create(createPostDto: Omit<CreatePostDto, 'id'>): Promise<PostDomain>;

  findOne(id: string): Promise<PostDomain>;

  update(
    postId: string,
    blogId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDomain>;

  remove(id: string): Promise<boolean>;
}

@Injectable()
export class PostsService implements IPostService {
  constructor(
    private readonly postRepository: IPostsRepository,
    private readonly blogRepository: IBlogsRepository,
    private readonly likeService: LikesService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const blog = await this.blogRepository.findOne(createPostDto.blogId);

    if (!blog) {
      return null;
    }

    const newPostInput: CreatePostDto = {
      blogId: blog.id,
      title: createPostDto.title,
      content: createPostDto.content,
      shortDescription: createPostDto.shortDescription,
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
  ): Promise<PostDomain> {
    const blog = await this.blogRepository.findOne(blogId);

    if (!blog) {
      return null;
    }

    const updatedPost: UpdatePostDto = {
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

    return this.likeService.updatePostLikeStatus({
      postId: updateLike.postId,
      userId: updateLike.userId,
      likeStatus: status,
    });
  }
}
