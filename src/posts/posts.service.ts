import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { BlogsRepository } from '../blogs/blogs.repository';

import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDbDto } from './dto/update-post-db.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { IPostService } from './posts.controller';
import { PostsRepository } from './posts.repository';

export interface IPostsRepository {
  create(createPostDto: CreatePostDto): Promise<PostDto>;

  findOne(id: string): Promise<PostDto>;

  update(id: string, updatePostDto: UpdatePostDto): Promise<PostDto>;

  remove(id: string): Promise<boolean>;
}

@Injectable()
export class PostsService implements IPostService {
  constructor(
    private postRepository: PostsRepository,
    private blogRepository: BlogsRepository,
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
    };

    return this.postRepository.create(newPostInput);
  }

  async findOne(id: string) {
    return this.postRepository.findOne(id);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const blog = await this.blogRepository.findOne(updatePostDto.blogId);

    if (!blog) {
      return null;
    }

    const updatedPost: UpdatePostDbDto = {
      blogName: blog.name,
      title: updatePostDto.title,
      content: updatePostDto.content,
      shortDescription: updatePostDto.shortDescription,
    };

    return this.postRepository.update(id, updatedPost);
  }

  async remove(id: string) {
    return this.postRepository.remove(id);
  }
}
