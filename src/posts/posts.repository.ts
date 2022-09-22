import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsInt, IsOptional } from 'class-validator';
import { Model } from 'mongoose';

import { Blogger, BloggerDocument } from '../bloggers/schemas/bloggers.schema';
import { BASE_PROJECTION } from '../common/mongoose/constants';
import { PageOptionsDto } from '../common/paginator/page-options.dto';
import { PageDto } from '../common/paginator/page.dto';

import { CreatePostDbDto } from './dto/create-post-db.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDbDto } from './dto/update-post-db.dto';
import { Post, PostDocument } from './schemas/posts.schema';

export class FindAllPostsOptions extends PageOptionsDto {
  @IsInt()
  @IsOptional()
  blogId?: string;
}

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blogger.name) private bloggerModel: Model<BloggerDocument>,
  ) {}

  async create(createPostDto: CreatePostDbDto) {
    const blogger = await this.bloggerModel.findOne({
      id: createPostDto.blogId,
    });

    if (!blogger) {
      return null;
    }

    const post = await this.postModel.create(createPostDto);

    return this.postModel.findOne({ id: post.id }, BASE_PROJECTION);
  }

  async findAll(options: FindAllPostsOptions) {
    const filter = {
      ...(options?.SearchNameTerm
        ? { title: { $regex: options.SearchNameTerm } }
        : {}),
      ...(options?.blogId ? { bloggerId: options.blogId } : {}),
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
      .limit(options.PageSize);

    return new PageDto({
      items,
      itemsCount,
      pageOptionsDto: options,
    });
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
