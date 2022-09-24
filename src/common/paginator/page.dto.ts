import { IsArray } from 'class-validator';

import { PageMetaDtoParameters } from './interfaces';

export class PageDto<T> {
  readonly page: number;

  readonly pageSize: number;

  readonly totalCount: number;

  readonly pagesCount: number;

  // readonly hasPreviousPage: boolean;

  // readonly hasNextPage: boolean;

  @IsArray()
  readonly items: T[];

  constructor({ items, pageOptionsDto, itemsCount }: PageMetaDtoParameters<T>) {
    this.page = pageOptionsDto.pageNumber;
    this.pageSize = pageOptionsDto.pageSize;
    this.totalCount = itemsCount;
    this.pagesCount = Math.ceil(this.totalCount / this.pageSize);
    // this.hasPreviousPage = this.page > 1;
    // this.hasNextPage = this.page < this.pagesCount;

    this.items = items;
  }
}
