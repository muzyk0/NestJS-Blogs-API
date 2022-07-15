import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDto } from './dto/post.dto';
import { v4 } from 'uuid';
import { PostsRepository } from './posts.repository';
import { BloggersRepository } from '../bloggers/bloggers.repository';
import { UpdatePostDbDto } from './dto/update-post-db.dto';

interface IPostService {
  create(createPostDto: Omit<CreatePostDto, 'id'>): Promise<PostDto>;
  findAll(): Promise<PostDto[]>;
  findOne(id: string): Promise<PostDto>;
  update(id: string, updatePostDto: UpdatePostDto): Promise<PostDto>;
  remove(id: string): Promise<boolean>;
}

@Injectable()
export class PostsService implements IPostService {
  constructor(
    private postRepository: PostsRepository,
    private bloggerRepository: BloggersRepository,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const blogger = await this.bloggerRepository.findOne(
      createPostDto.bloggerId,
    );

    if (!blogger) {
      return null;
    }

    const newPostInput: PostDto = {
      id: v4(),
      bloggerId: blogger.id,
      bloggerName: blogger.name,
      title: createPostDto.title,
      content: createPostDto.content,
      shortDescription: createPostDto.shortDescription,
    };

    return this.postRepository.create(newPostInput);
  }

  async findAll(searchNameTerm?: string) {
    return this.postRepository.findAll(searchNameTerm);
  }

  async findOne(id: string) {
    return this.postRepository.findOne(id);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const blogger = await this.bloggerRepository.findOne(
      updatePostDto.bloggerId,
    );

    if (!blogger) {
      return null;
    }

    const updatedPost: UpdatePostDbDto = {
      bloggerName: blogger.name,
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
