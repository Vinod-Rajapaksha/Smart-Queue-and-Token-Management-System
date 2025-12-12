export const getPagination = (page = 1, limit = 10) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const perPage = Math.max(parseInt(limit, 10) || 10, 1);

  const skip = (currentPage - 1) * perPage;

  return {
    page: currentPage,
    limit: perPage,
    skip,
  };
};
