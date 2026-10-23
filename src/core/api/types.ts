export type RequestParams = Record<string, unknown>;

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiFailure = {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, string | string[]>;
  status?: number;
  requestId?: string;
};

export type PaginatedData<T> = {
  data: T[];
  page?: number;
  limit?: number;
  totalCount?: number;
  total?: number;
  pages?: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
export type ApiListResponse<T> = ApiSuccess<PaginatedData<T>>;

export type EntityId = string;

export type IdentifiedEntity = {
  _id?: EntityId;
  id?: EntityId;
};
