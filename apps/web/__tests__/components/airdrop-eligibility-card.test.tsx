/**
 * @fileoverview Tests for AirdropEligibilityCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  AirdropEligibilityCard,
  EligibilityStatus,
  type AirdropEligibility,
  type Criterion,
} from '@/components/features/airdrop-eligibility-card';

describe('AirdropEligibilityCard', () => {
  const mockCriteria: Criterion[] = [
    {
      name: 'Wallet Age',
      description: 'Wallet must be at least 6 months old',
      met: true,
      currentValue: '12 months',
      requiredValue: '6 months',
      points: 20,
    },
    {
      name: 'Transaction Count',
      description: 'At least 50 transactions',
      met: true,
      currentValue: 150,
      requiredValue: 50,
      points: 30,
    },
    {
      name: 'Token Holdings',
      description: 'Hold at least $1000 in tokens',
      met: false,
      currentValue: '$500',
      requiredValue: '$1000',
      points: 50,
    },
  ];

  const mockEligibility: AirdropEligibility = {
    projectName: 'Example Protocol',
    projectLogo: 'https://example.com/logo.png',
    status: EligibilityStatus.ELIGIBLE,
    estimatedAllocation: 1000,
    allocationSymbol: 'EXAMPLE',
    estimatedValueUSD: 5000,
    criteria: mockCriteria,
    score: 85,
    maxScore: 100,
    claimUrl: 'https://example.com/claim',
    deadline: new Date('2024-12-31'),
  };

  describe('Rendering', () => {
    it('should render project name', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      expect(screen.getByText('Example Protocol')).toBeInTheDocument();
    });

    it('should render project logo', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      const logo = screen.getByAlt('Example Protocol');
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('should render eligibility status badge', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      expect(screen.getByText('Eligible')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <AirdropEligibilityCard
          eligibility={mockEligibility}
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Status Badges', () => {
    it('should show eligible status with check icon', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      const badge = screen.getByText('Eligible');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveTextContent('✓');
    });

    it('should show not eligible status', () => {
      const notEligible = { ...mockEligibility, status: EligibilityStatus.NOT_ELIGIBLE };
      render(<AirdropEligibilityCard eligibility={notEligible} />);
      
      expect(screen.getByText('Not Eligible')).toBeInTheDocument();
    });

    it('should show partial eligibility status', () => {
      const partial = { ...mockEligibility, status: EligibilityStatus.PARTIAL };
      render(<AirdropEligibilityCard eligibility={partial} />);
      
      expect(screen.getByText('Partially Eligible')).toBeInTheDocument();
    });

    it('should show pending status', () => {
      const pending = { ...mockEligibility, status: EligibilityStatus.PENDING };
      render(<AirdropEligibilityCard eligibility={pending} />);
      
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should show claimed status', () => {
      const claimed = { ...mockEligibility, status: EligibilityStatus.CLAIMED };
      render(<AirdropEligibilityCard eligibility={claimed} />);
      
      expect(screen.getByText('Claimed')).toBeInTheDocument();
    });
  });

  describe('Allocation Display', () => {
    it('should display estimated allocation', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      expect(screen.getByText('Estimated Allocation')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('EXAMPLE')).toBeInTheDocument();
    });

    it('should display USD value', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      expect(screen.getByText('≈ $5,000.00')).toBeInTheDocument();
    });

    it('should not show allocation in compact mode', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} compact={true} />);
      
      expect(screen.queryByText('Estimated Allocation')).not.toBeInTheDocument();
    });

    it('should not show allocation when undefined', () => {
      const noAllocation = { ...mockEligibility, estimatedAllocation: undefined };
      render(<AirdropEligibilityCard eligibility={noAllocation} />);
      
      expect(screen.queryByText('Estimated Allocation')).not.toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('should display eligibility score', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      expect(screen.getByText('Eligibility Score')).toBeInTheDocument();
      expect(screen.getByText('85 / 100')).toBeInTheDocument();
    });

    it('should show score progress bar', () => {
      const { container } = render(
        <AirdropEligibilityCard eligibility={mockEligibility} />
      );
      
      const progressBars = container.querySelectorAll('.h-2');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should not show score in compact mode', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} compact={true} />);
      
      expect(screen.queryByText('Eligibility Score')).not.toBeInTheDocument();
    });
  });

  describe('Criteria Summary', () => {
    it('should show criteria met count', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      expect(screen.getByText('Criteria:')).toBeInTheDocument();
      expect(screen.getByText('2 / 3 met')).toBeInTheDocument();
    });

    it('should show criteria progress bar', () => {
      const { container } = render(
        <AirdropEligibilityCard eligibility={mockEligibility} />
      );
      
      const progressBars = container.querySelectorAll('.h-1\\.5');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Deadline Display', () => {
    it('should show claim deadline', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} />);
      
      expect(screen.getByText(/Claim by:/)).toBeInTheDocument();
      expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
    });

    it('should not show deadline in compact mode', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} compact={true} />);
      
      expect(screen.queryByText(/Claim by:/)).not.toBeInTheDocument();
    });

    it('should not show deadline when undefined', () => {
      const noDeadline = { ...mockEligibility, deadline: undefined };
      render(<AirdropEligibilityCard eligibility={noDeadline} />);
      
      expect(screen.queryByText(/Claim by:/)).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show claim button when eligible and claimable', () => {
      render(
        <AirdropEligibilityCard
          eligibility={mockEligibility}
          onClaim={jest.fn()}
        />
      );
      
      expect(screen.getByText('Claim Airdrop')).toBeInTheDocument();
    });

    it('should call onClaim when claim button is clicked', () => {
      const onClaim = jest.fn();
      
      render(
        <AirdropEligibilityCard
          eligibility={mockEligibility}
          onClaim={onClaim}
        />
      );
      
      fireEvent.click(screen.getByText('Claim Airdrop'));
      expect(onClaim).toHaveBeenCalledWith(mockEligibility);
    });

    it('should not show claim button when already claimed', () => {
      const claimed = { ...mockEligibility, status: EligibilityStatus.CLAIMED };
      
      render(
        <AirdropEligibilityCard
          eligibility={claimed}
          onClaim={jest.fn()}
        />
      );
      
      expect(screen.queryByText('Claim Airdrop')).not.toBeInTheDocument();
    });

    it('should not show claim button when not eligible', () => {
      const notEligible = { ...mockEligibility, status: EligibilityStatus.NOT_ELIGIBLE };
      
      render(
        <AirdropEligibilityCard
          eligibility={notEligible}
          onClaim={jest.fn()}
        />
      );
      
      expect(screen.queryByText('Claim Airdrop')).not.toBeInTheDocument();
    });

    it('should show view criteria button', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} showCriteria={true} />);
      
      expect(screen.getByText('View Criteria')).toBeInTheDocument();
    });

    it('should toggle criteria details', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} showCriteria={true} />);
      
      const button = screen.getByText('View Criteria');
      fireEvent.click(button);
      
      expect(screen.getByText('Hide Criteria')).toBeInTheDocument();
      expect(screen.getByText('Eligibility Criteria')).toBeInTheDocument();
    });

    it('should not show actions in compact mode', () => {
      render(
        <AirdropEligibilityCard
          eligibility={mockEligibility}
          compact={true}
          onClaim={jest.fn()}
        />
      );
      
      expect(screen.queryByText('Claim Airdrop')).not.toBeInTheDocument();
      expect(screen.queryByText('View Criteria')).not.toBeInTheDocument();
    });
  });

  describe('Criteria Details', () => {
    beforeEach(() => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} showCriteria={true} />);
      fireEvent.click(screen.getByText('View Criteria'));
    });

    it('should display all criteria', () => {
      expect(screen.getByText('Wallet Age')).toBeInTheDocument();
      expect(screen.getByText('Transaction Count')).toBeInTheDocument();
      expect(screen.getByText('Token Holdings')).toBeInTheDocument();
    });

    it('should display criterion descriptions', () => {
      expect(screen.getByText('Wallet must be at least 6 months old')).toBeInTheDocument();
      expect(screen.getByText('At least 50 transactions')).toBeInTheDocument();
      expect(screen.getByText('Hold at least $1000 in tokens')).toBeInTheDocument();
    });

    it('should show met criteria with check mark', () => {
      const walletAgeCriterion = screen.getByText('Wallet Age').closest('div');
      const checkMark = walletAgeCriterion?.querySelector('.bg-green-500');
      expect(checkMark).toHaveTextContent('✓');
    });

    it('should show unmet criteria with X mark', () => {
      const tokenHoldingsCriterion = screen.getByText('Token Holdings').closest('div');
      const xMark = tokenHoldingsCriterion?.querySelector('.bg-gray-400');
      expect(xMark).toHaveTextContent('✗');
    });

    it('should display current and required values', () => {
      expect(screen.getByText(/Current:/)).toBeInTheDocument();
      expect(screen.getByText(/Required:/)).toBeInTheDocument();
    });

    it('should display points for each criterion', () => {
      expect(screen.getByText('+20 pts')).toBeInTheDocument();
      expect(screen.getByText('+30 pts')).toBeInTheDocument();
      expect(screen.getByText('+50 pts')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should have smaller padding in compact mode', () => {
      const { container } = render(
        <AirdropEligibilityCard eligibility={mockEligibility} compact={true} />
      );
      
      const card = container.querySelector('.p-3');
      expect(card).toBeInTheDocument();
    });

    it('should have smaller logo in compact mode', () => {
      const { container } = render(
        <AirdropEligibilityCard eligibility={mockEligibility} compact={true} />
      );
      
      const logo = container.querySelector('.w-12');
      expect(logo).toBeInTheDocument();
    });

    it('should not show criteria expansion in compact mode', () => {
      render(<AirdropEligibilityCard eligibility={mockEligibility} compact={true} />);
      
      expect(screen.queryByText('View Criteria')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(
        <AirdropEligibilityCard
          eligibility={mockEligibility}
          onClaim={jest.fn()}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper focus styles', () => {
      render(
        <AirdropEligibilityCard
          eligibility={mockEligibility}
          onClaim={jest.fn()}
        />
      );
      
      const claimButton = screen.getByText('Claim Airdrop');
      expect(claimButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Styling', () => {
    it('should have hover effect', () => {
      const { container } = render(
        <AirdropEligibilityCard eligibility={mockEligibility} />
      );
      
      expect(container.firstChild).toHaveClass('hover:shadow-lg');
    });

    it('should support dark mode classes', () => {
      const { container } = render(
        <AirdropEligibilityCard eligibility={mockEligibility} />
      );
      
      expect(container.firstChild).toHaveClass('dark:bg-gray-800');
    });

    it('should have gradient claim button', () => {
      render(
        <AirdropEligibilityCard
          eligibility={mockEligibility}
          onClaim={jest.fn()}
        />
      );
      
      const claimButton = screen.getByText('Claim Airdrop');
      expect(claimButton).toHaveClass('bg-gradient-to-r');
    });
  });
});

