import { Pagination, PaginationParam } from './types';

/**
 * Utility class for handling pagination operations.
 * @class
 */
export default class PaginationUtil {
  /**
   * Get pagination object based on total items, items per page, and current page.
   * @param total - The total number of items.
   * @param take - The number of items per page.
   * @param skip - The number of items to skip.
   * @returns An object containing totalItems, totalPage, currentPage, and pageSize.
   */
  getPagination(total: number, take: number, skip: number): Pagination {
    return {
      total_items: total,
      total_page: Math.ceil(total / take),
      current_page: Math.floor(skip / take) + 1,
      page_size: take,
    };
  }

  /**
   * Calculate the pagination parameters based on the provided query.
   * @param query - The pagination parameters including page and pageSize.
   * @returns An object with 'take' representing the number of items to take and 'skip' representing the number of items to skip.
   */
  calculatePagination(query: PaginationParam): {
    take: number;
    skip: number;
  } {
    query.page = Number(query?.page);
    query.page_size = Number(query?.page_size);

    const pageSize = query?.page_size && query.page_size > 0 ? query?.page_size : 10;
    const page = query?.page && query?.page > 0 ? query?.page : 1;

    const skip = (page - 1) * pageSize;
    const take = pageSize ? pageSize : 10;

    return { take, skip };
  }
}
