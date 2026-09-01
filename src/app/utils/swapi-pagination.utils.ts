import { SwapiResponse } from '../types/index.types';

export function resolveNextPage<T>(lastPage: SwapiResponse<T>): number | undefined {
  if (!lastPage.next) return undefined;
  const nextPage = Number(new URL(lastPage.next).searchParams.get('page'));
  return Number.isInteger(nextPage) ? nextPage : undefined;
}

export function flattenPages<T>(pages: SwapiResponse<T>[]): T[] {
  return pages.flatMap((page) => page.results);
}