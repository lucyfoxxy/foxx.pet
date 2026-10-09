import { vi } from 'vitest';

export type CollectionEntry<T extends string = string> = {
  collection: T;
  id?: string;
  data: Record<string, unknown>;
};

export const getCollection = vi.fn(async () => [] as CollectionEntry[]);
