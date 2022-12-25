import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { BASE_PROJECTION } from '../../common/mongoose/constants';
import { PageOptionsDto } from '../../common/paginator/page-options.dto';
import { Blog, BlogDocument } from '../blogs/schemas/blogs.schema';

import { CreatePostDbDto } from './dto/create-post-db.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDbDto } from './dto/update-post-db.dto';
import { IPostsRepository } from './posts.service';
import { Post, PostDocument } from './schemas/posts.schema';

export class FindAllPostsOptions extends PageOptionsDto {
  @IsInt()
  @IsOptional()
  blogId?: string;
}

@Injectable()
export class PostsRepository implements IPostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}

  async create(createPostDto: CreatePostDbDto) {
    const blog = await this.blogModel.findOne({
      id: createPostDto.blogId,
    });

    if (!blog) {
      return null;
    }

    const post = await this.postModel.create(createPostDto);

    return this.postModel.findOne({ id: post.id }, BASE_PROJECTION).lean();
  }

  async findOne(id: string) {
    return this.postModel.findOne({ id }, { projection: BASE_PROJECTION });
  }

  async update(
    id: string,
    updatePostDbDto: UpdatePostDbDto,
  ): Promise<PostDto | null> {
    const post = await this.findOne(id);

    if (!post) {
      return null;
    }

    const modifyPost = await this.postModel.findOneAndUpdate(
      { id: id },
      {
        $set: updatePostDbDto,
      },
      { returnDocument: 'after', projection: BASE_PROJECTION },
    );

    return modifyPost;
  }

  async remove(id: string) {
    const result = await this.postModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
}
