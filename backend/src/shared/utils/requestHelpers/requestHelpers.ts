export const parsePagination = (page?: string, limit?: string): { page?: number; limit?: number } => ({
  page: page ? parseInt(page, 10) : undefined,
  limit: limit ? parseInt(limit, 10) : undefined,
});

export const parsePaginationOrDefault = (page?: string, limit?: string, defaultLimit = 20): { page: number; limit: number } => ({
  page: parseInt(page || '1', 10),
  limit: parseInt(limit || String(defaultLimit), 10),
});

export const resolveBranchId = (role: string, userBranchId?: string, queryBranchId?: string): string | undefined =>
  role === 'owner' ? (queryBranchId || userBranchId) : userBranchId;

export const endOfDay = (date: string): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
