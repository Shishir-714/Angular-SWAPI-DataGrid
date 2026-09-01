import { describe, it, expect } from 'vitest';
import { resolveNextPage, flattenPages } from './swapi-pagination.utils';

//testing that nextPageParams read in show-starship-response.ts is correct against dummy response.
describe('resolveNextPage', () => {
  it('extracts the next page number from the `next` URL', () => {
    //dummy response.
    const lastPage = { count: 36, next: 'https://swapi.dev/api/starships/?page=3', previous: null, results: [] };
    expect(resolveNextPage(lastPage)).toBe(3);
  });

  it('returns undefined when there is no next page', () => {
    const lastPage = { count: 36, next: null, previous: null, results: [] };
    expect(resolveNextPage(lastPage)).toBeUndefined();
  });
});

//testing that Starship stores a single array via flatmap.
describe('flattenPages', () => {
  it('combines results from multiple pages into a single flat array', () => {
    const pages = [
      { count: 4, next: null, previous: null, results: [{ name: 'X-wing' }, { name: 'Y-wing' }] },
      { count: 4, next: null, previous: null, results: [{ name: 'A-wing' }] },
    ];
    expect(flattenPages(pages)).toEqual([{ name: 'X-wing' }, { name: 'Y-wing' }, { name: 'A-wing' }]);
  });
});