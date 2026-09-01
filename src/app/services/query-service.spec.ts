import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { QueryService } from './queryService';

describe('QueryService', () => {
  let service: QueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('requests the given resource and page number', async () => {
    //dummy response.
    const mockResponse = { count: 36, next: null, previous: null, results: [{ name: 'Death Star' }] };
    //mock API call to return the dummy response.
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await service.getResponse('starships', 2);

    //checking for endpoint and params based on dummy response.
    const requestedUrl = fetchSpy.mock.calls[0][0] as URL;
    expect(requestedUrl.toString()).toContain('starships/');
    expect(requestedUrl.searchParams.get('page')).toBe('2');
    expect(result).toEqual(mockResponse);
  });

  //mocking a failed API call.
  it('throws a descriptive error when the response is not ok', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue({ ok: false, status: 404 } as Response);
    await expect(service.getResponse('starships', 999)).rejects.toThrow('Status: 404');
  });
});