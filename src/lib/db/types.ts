export interface DatabaseOptions {
  genre?: string;
  theme?: string;
  artist?: string;
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface SaveOptions {
  generateId?: boolean;
  merge?: boolean;
}