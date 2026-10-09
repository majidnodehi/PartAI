export interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export function pageWindow(
  page?: number,
  limit?: number,
): { page: number; limit: number; skip: number } {
  const safePage = page ?? 1;
  const safeLimit = limit ?? 20;
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}
