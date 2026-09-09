export type ItemStatus = 'draft' | 'published' | 'archived';

export type Item = {
  id: string;
  title: string;
  description: string | null;
  status: ItemStatus;
  ownerId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};
