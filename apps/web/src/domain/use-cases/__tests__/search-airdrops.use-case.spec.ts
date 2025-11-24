/**
 * SearchAirdropsUseCase Tests
 */

import { SearchAirdropsUseCase } from '../search-airdrops.use-case';

describe('SearchAirdropsUseCase', () => {
  let useCase: SearchAirdropsUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      search: jest.fn(),
    };
    useCase = new SearchAirdropsUseCase(mockRepository);
  });

  it('should search airdrops by query', async () => {
    const mockResults = [
      { id: '1', name: 'Test Airdrop', status: 'active' },
    ];
    mockRepository.search.mockResolvedValue(mockResults);

    const result = await useCase.execute({ query: 'test' });

    expect(result).toEqual(mockResults);
    expect(mockRepository.search).toHaveBeenCalledWith({ query: 'test' });
  });

  it('should handle empty results', async () => {
    mockRepository.search.mockResolvedValue([]);

    const result = await useCase.execute({ query: 'nonexistent' });

    expect(result).toEqual([]);
  });
});


