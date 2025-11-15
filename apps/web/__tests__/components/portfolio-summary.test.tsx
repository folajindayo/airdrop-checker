/**
 * @fileoverview Tests for PortfolioSummary component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PortfolioSummary,
  type PortfolioSummaryData,
} from '@/components/features/portfolio-summary';

describe('PortfolioSummary', () => {
  const mockData: PortfolioSummaryData = {
    metrics: {
      totalValueUSD: 50000,
      change24h: 5.2,
      change24hUSD: 2600,
      change7d: 12.5,
      change30d: -3.2,
      allTimeHigh: 75000,
      allTimeLow: 10000,
    },
    assets: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        percentage: 45,
        valueUSD: 22500,
        color: '#627EEA',
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        percentage: 30,
        valueUSD: 15000,
        color: '#F7931A',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        percentage: 15,
        valueUSD: 7500,
        color: '#2775CA',
      },
      {
        symbol: 'MATIC',
        name: 'Polygon',
        percentage: 7,
        valueUSD: 3500,
        color: '#8247E5',
      },
      {
        symbol: 'DAI',
        name: 'Dai',
        percentage: 3,
        valueUSD: 1500,
        color: '#F5AC37',
      },
    ],
    chains: [
      {
        chain: 'Ethereum',
        valueUSD: 30000,
        percentage: 60,
        tokenCount: 15,
        icon: '⟠',
      },
      {
        chain: 'Polygon',
        valueUSD: 15000,
        percentage: 30,
        tokenCount: 8,
        icon: '⬡',
      },
      {
        chain: 'Binance Smart Chain',
        valueUSD: 5000,
        percentage: 10,
        tokenCount: 3,
        icon: '⬡',
      },
    ],
  };

  describe('Rendering', () => {
    it('should render total portfolio value', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    });

    it('should render 24h change', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('$2,600.00')).toBeInTheDocument();
      expect(screen.getByText('(5.2%)')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <PortfolioSummary data={mockData} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Change Indicators', () => {
    it('should show positive change with green color and up arrow', () => {
      render(<PortfolioSummary data={mockData} />);
      
      const changeElement = screen.getByText('$2,600.00').parentElement;
      expect(changeElement).toHaveClass('text-green-600');
      expect(changeElement).toHaveTextContent('↑');
    });

    it('should show negative change with red color and down arrow', () => {
      const negativeData = {
        ...mockData,
        metrics: {
          ...mockData.metrics,
          change24h: -5.2,
          change24hUSD: -2600,
        },
      };
      
      render(<PortfolioSummary data={negativeData} />);
      
      const changeElement = screen.getByText('$2,600.00').parentElement;
      expect(changeElement).toHaveClass('text-red-600');
      expect(changeElement).toHaveTextContent('↓');
    });
  });

  describe('Metric Cards', () => {
    it('should display 7 day change when available', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('7 Day Change')).toBeInTheDocument();
      expect(screen.getByText('12.5%')).toBeInTheDocument();
    });

    it('should display 30 day change when available', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('30 Day Change')).toBeInTheDocument();
      expect(screen.getByText('3.2%')).toBeInTheDocument();
    });

    it('should display all-time high when available', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('All-Time High')).toBeInTheDocument();
      expect(screen.getByText('$75,000.00')).toBeInTheDocument();
    });

    it('should display all-time low when available', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('All-Time Low')).toBeInTheDocument();
      expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    });

    it('should not display metrics when undefined', () => {
      const minimalData = {
        ...mockData,
        metrics: {
          totalValueUSD: 50000,
          change24h: 5.2,
          change24hUSD: 2600,
        },
      };
      
      render(<PortfolioSummary data={minimalData} />);
      
      expect(screen.queryByText('7 Day Change')).not.toBeInTheDocument();
      expect(screen.queryByText('30 Day Change')).not.toBeInTheDocument();
      expect(screen.queryByText('All-Time High')).not.toBeInTheDocument();
    });
  });

  describe('Asset Allocation', () => {
    it('should display asset allocation section', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    });

    it('should display top 5 assets', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('USDC')).toBeInTheDocument();
      expect(screen.getByText('MATIC')).toBeInTheDocument();
      expect(screen.getByText('DAI')).toBeInTheDocument();
    });

    it('should display asset names', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('USD Coin')).toBeInTheDocument();
    });

    it('should display asset percentages', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    it('should display asset values', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('$22,500.00')).toBeInTheDocument();
      expect(screen.getByText('$15,000.00')).toBeInTheDocument();
      expect(screen.getByText('$7,500.00')).toBeInTheDocument();
    });

    it('should show "more assets" message when more than 5 assets', () => {
      const manyAssets = {
        ...mockData,
        assets: [
          ...mockData.assets,
          {
            symbol: 'LINK',
            name: 'Chainlink',
            percentage: 2,
            valueUSD: 1000,
            color: '#2A5ADA',
          },
        ],
      };
      
      render(<PortfolioSummary data={manyAssets} />);
      
      expect(screen.getByText('+1 more assets')).toBeInTheDocument();
    });
  });

  describe('Chain Distribution', () => {
    it('should display chain distribution section', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('Chain Distribution')).toBeInTheDocument();
    });

    it('should display all chains', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('Ethereum')).toBeInTheDocument();
      expect(screen.getByText('Polygon')).toBeInTheDocument();
      expect(screen.getByText('Binance Smart Chain')).toBeInTheDocument();
    });

    it('should display chain icons', () => {
      render(<PortfolioSummary data={mockData} />);
      
      const icons = screen.getAllByText('⟠');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display chain percentages', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should display chain values', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('$30,000.00')).toBeInTheDocument();
    });

    it('should display token counts', () => {
      render(<PortfolioSummary data={mockData} />);
      
      expect(screen.getByText('15 tokens')).toBeInTheDocument();
      expect(screen.getByText('8 tokens')).toBeInTheDocument();
      expect(screen.getByText('3 tokens')).toBeInTheDocument();
    });

    it('should show singular "token" for count of 1', () => {
      const oneTokenData = {
        ...mockData,
        chains: [
          {
            chain: 'Ethereum',
            valueUSD: 30000,
            percentage: 100,
            tokenCount: 1,
            icon: '⟠',
          },
        ],
      };
      
      render(<PortfolioSummary data={oneTokenData} />);
      
      expect(screen.getByText('1 token')).toBeInTheDocument();
    });

    it('should show empty state when no chains', () => {
      const noChainsData = {
        ...mockData,
        chains: [],
      };
      
      render(<PortfolioSummary data={noChainsData} />);
      
      expect(screen.getByText('No chain data available')).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should render donut chart when showCharts is true', () => {
      const { container } = render(<PortfolioSummary data={mockData} showCharts={true} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not render donut chart when showCharts is false', () => {
      const { container } = render(<PortfolioSummary data={mockData} showCharts={false} />);
      
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should render chart with correct number of segments', () => {
      const { container } = render(<PortfolioSummary data={mockData} showCharts={true} />);
      
      const circles = container.querySelectorAll('circle');
      // Base circle + 5 asset segments
      expect(circles.length).toBe(6);
    });
  });

  describe('Styling', () => {
    it('should support dark mode classes', () => {
      const { container } = render(<PortfolioSummary data={mockData} />);
      
      const darkModeElements = container.querySelectorAll('.dark\\:bg-gray-800');
      expect(darkModeElements.length).toBeGreaterThan(0);
    });

    it('should have hover effects on list items', () => {
      const { container } = render(<PortfolioSummary data={mockData} />);
      
      const hoverElements = container.querySelectorAll('.hover\\:bg-gray-50');
      expect(hoverElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(<PortfolioSummary data={mockData} />);
      
      const gridElements = container.querySelectorAll('.md\\:grid-cols-2, .md\\:grid-cols-4');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const zeroData = {
        ...mockData,
        metrics: {
          ...mockData.metrics,
          totalValueUSD: 0,
          change24h: 0,
          change24hUSD: 0,
        },
      };
      
      render(<PortfolioSummary data={zeroData} />);
      
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle empty assets array', () => {
      const noAssetsData = {
        ...mockData,
        assets: [],
      };
      
      render(<PortfolioSummary data={noAssetsData} />);
      
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const largeData = {
        ...mockData,
        metrics: {
          ...mockData.metrics,
          totalValueUSD: 1000000000,
        },
      };
      
      render(<PortfolioSummary data={largeData} />);
      
      expect(screen.getByText('$1,000,000,000.00')).toBeInTheDocument();
    });
  });
});

