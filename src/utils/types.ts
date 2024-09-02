export interface PaginationParam {
  page: number;
  page_size: number;
}

export interface Pagination {
  total_items: number;
  total_page: number;
  current_page: number;
  page_size: number;
}
