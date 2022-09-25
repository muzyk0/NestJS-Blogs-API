import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { Blog, BlogDocument } from '../blogs/schemas/blogs.schema';
import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { CreatePostDbDto } from './dto/create-post-db.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDbDto } from './dto/update-post-db.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './schemas/posts.schema';

export interface IPostsQueryRepository {
  findAll(options: FindAllPostsOptions): Promise<PageDto<PostDto>>;
  findOne(id: string): Promise<PostDto>;
}

export class FindAllPostsOptions extends PageOptionsDto {
  @IsInt()
  @IsOptional()
  blogId?: string;
}

@Injectable()
export class PostsQueryRepository implements IPostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async findAll(options: FindAllPostsOptions) {
    const filter = {
      ...(options?.searchNameTerm
        ? { title: { $regex: options.searchNameTerm } }
        : {}),
      ...(options?.blogId ? { blogId: options.blogId } : {}),
    };

    const itemsCount = await this.postModel.countDocuments(filter);

    const items = await this.postModel
      .find(
        filter,
        {
          projection: BASE_PROJECTION,
        },
        { _id: 0, __v: 0 },
      )
      .skip(options.skip)
      .sort({
        [options.sortBy]: options.sortDirection,
      })
      .limit(options.pageSize);

    return new PageDto({
      items,
      itemsCount,
      pageOptionsDto: options,
    });
  }

  async findOne(id: string) {
    return this.postModel.findOne({ id }, { projection: BASE_PROJECTION });
  }
}
