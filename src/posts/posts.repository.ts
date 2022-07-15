import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/posts.schema';
import { UpdatePostDbDto } from './dto/update-post-db.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto) {
    const post = await this.postModel.create(createPostDto);

    return this.postModel.findOne({ id: post.id }, { _id: false, __v: false });
  }

  async findAll(searchNameTerm?: string) {
    const filter = {
      ...(searchNameTerm ? { title: { $regex: searchNameTerm } } : {}),
    };

    return this.postModel.find(filter, { projection: { _id: false } });
  }

  async findOne(id: string) {
    return this.postModel.findOne({ id }, { projection: { _id: false } });
  }

  async update(id: string, updatePostDbDto: UpdatePostDbDto) {
    const modifyPost = await this.postModel.findOneAndUpdate(
      { id: id },
      {
        $set: updatePostDbDto,
      },
      { returnDocument: 'after', projection: { _id: false } },
    );

    return modifyPost;
  }

  async remove(id: string) {
    const result = await this.postModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
}
