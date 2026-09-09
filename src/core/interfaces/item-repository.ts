import type { Item, ItemStatus } from '@/core/models';
import type { Result } from '@/lib/utils';

export type ItemListFilters = {
  query: string;
  status: ItemStatus;
  limit: number;
  offset: number;
};

export type ItemCreateInput = {
  title: string;
  description?: string | null;
  status: ItemStatus;
  ownerId: string;
  tags?: string[];
};

export type ItemRepository = {
  list: (filters?: Partial<ItemListFilters>) => Promise<Result<Item[]>>;
  getById: (id: string) => Promise<Result<Item | null>>;
  create: (input: ItemCreateInput) => Promise<Result<Item>>;
};
