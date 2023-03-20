// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { IsInt, IsOptional } from 'class-validator';
// import { Model } from 'mongoose';
//
// import { BASE_PROJECTION } from '../../../shared/mongoose/constants';
// import { PageOptionsDto } from '../../../shared/paginator/page-options.dto';
// import { CreatePostDbDto } from '../application/dto/create-post-db.dto';
// import { CreatePostDto } from '../application/dto/create-post.dto';
// import { UpdatePostDbDto } from '../application/dto/update-post-db.dto';
// import { UpdatePostDto } from '../application/dto/update-post.dto';
// import { PostDomain } from '../domain/post.domain';
// import { Post, PostDocument } from '../domain/schemas/posts.schema';
//
// export class FindAllPostsOptions extends PageOptionsDto {
//   @IsInt()
//   @IsOptional()
//   blogId?: string;
// }
//
// export interface IPostsRepository {
//   create(createPostDto: CreatePostDto): Promise<PostDomain>;
//
//   findOne(id: string): Promise<PostDomain>;
//
//   update(id: string, updatePostDto: UpdatePostDto): Promise<PostDomain>;
//
//   remove(id: string): Promise<boolean>;
//
//   findManyByBlogsIds(blogsIds: string[]): Promise<Post[]>;
// }
//
// @Injectable()
// export class PostsRepository implements IPostsRepository {
//   blogModel: any;
//
//   constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
//
//   async create(createPostDto: CreatePostDbDto) {
//     const blog = await this.blogModel.findOne({
//       id: createPostDto.blogId,
//     });
//
//     if (!blog) {
//       return null;
//     }
//
//     const post = await this.postModel.create(createPostDto);
//
//     return this.postModel.findOne({ id: post.id }, BASE_PROJECTION).lean();
//   }
//
//   async findOne(id: string) {
//     return this.postModel.findOne({ id }, { projection: BASE_PROJECTION });
//   }
//
//   async update(
//     id: string,
//     updatePostDbDto: UpdatePostDbDto,
//   ): Promise<PostDomain | null> {
//     const post = await this.findOne(id);
//
//     if (!post) {
//       return null;
//     }
//
//     const modifyPost = await this.postModel.findOneAndUpdate(
//       { id: id },
//       {
//         $set: updatePostDbDto,
//       },
//       { returnDocument: 'after', projection: BASE_PROJECTION },
//     );
//
//     return modifyPost;
//   }
//
//   async remove(id: string) {
//     const result = await this.postModel.deleteOne({ id });
//     return result.deletedCount === 1;
//   }
//
//   async findManyByBlogsIds(blogsIds: string[]) {
//     return this.postModel.find({
//       blogId: { $in: blogsIds },
//     });
//   }
// }
