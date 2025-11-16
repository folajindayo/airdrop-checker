/**
 * Portfolio Service Tests
 */

import { PortfolioService } from '../../../src/services/portfolio-service';

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    service = new PortfolioService();
  });

  it('should get portfolio for address', async () => {
    const portfolio = await service.getPortfolio('0x' + '0'.repeat(40));
    expect(portfolio).toHaveProperty('address');
    expect(portfolio).toHaveProperty('totalValue');
  });

  it('should compare multiple portfolios', async () => {
    const addresses = ['0x' + '0'.repeat(40), '0x' + '1'.repeat(40)];
    const result = await service.comparePortfolios(addresses);
    expect(result.portfolios).toHaveLength(2);
  });
});

