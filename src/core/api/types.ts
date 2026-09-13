export type RequestParams = Record<string, unknown>;

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors?: unknown;
};

export type PaginatedData<T> = {
  data: T[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

export type EntityId = string;

export type IdentifiedEntity = {
  _id?: EntityId;
  id?: EntityId;
};
