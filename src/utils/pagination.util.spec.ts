import PaginationUtil from './pagination.util';

describe('PaginationUtil', () => {
  it('should return correct pagination object when given valid total, take, and skip values', () => {
    const paginationUtil = new PaginationUtil();
    const total = 100;
    const take = 10;
    const skip = 20;
    const result = paginationUtil.getPagination(total, take, skip);
    expect(result).toEqual({
      total_items: total,
      total_page: 10,
      current_page: 3,
      page_size: take,
    });
  });

  it('should return correct pagination parameters when given valid query object', () => {
    const paginationUtil = new PaginationUtil();
    const query = { page: 2, page_size: 10 };
    const result = paginationUtil.calculatePagination(query);
    expect(result).toEqual({ take: 10, skip: 10 });
  });

  it('should return default pagination parameters when given invalid query object', () => {
    const paginationUtil = new PaginationUtil();
    const query = { page: -1, page_size: -1 };
    const result = paginationUtil.calculatePagination(query);
    expect(result).toEqual({ take: 10, skip: 0 });
  });
});
