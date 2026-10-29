/** Names of the paging and sorting parameters of a paginated endpoint. */
export interface PagingParams {
  readonly page: string;
  readonly pageSize: string;
  readonly sortBy: string;
  readonly sortDirection: string;
}

/** A page of a paginated endpoint, the shape every list API of this project returns. */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
