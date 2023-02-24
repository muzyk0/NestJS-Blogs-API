import { PageOptionsDto } from './page-options.dto';

export interface PageMetaDtoParameters<T> {
  items: T[];
  pageOptionsDto: PageOptionsDto;
  itemsCount: number;
}
