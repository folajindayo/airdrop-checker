/**
 * Tests for Card Components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardImage,
  CardDivider,
  ClickableCard,
  CardGrid,
  StatsCard,
  FeatureCard,
} from '@/components/ui/card';

describe('Card', () => {
  describe('Basic Rendering', () => {
    it('should render card', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render as div by default', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('should render as article', () => {
      const { container } = render(<Card as="article">Content</Card>);
      expect(container.firstChild?.nodeName).toBe('ARTICLE');
    });

    it('should render as section', () => {
      const { container } = render(<Card as="section">Content</Card>);
      expect(container.firstChild?.nodeName).toBe('SECTION');
    });
  });

  describe('Variants', () => {
    it('should apply elevated variant (default)', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('shadow-md');
    });

    it('should apply outlined variant', () => {
      const { container } = render(<Card variant="outlined">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('border');
    });

    it('should apply filled variant', () => {
      const { container } = render(<Card variant="filled">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-gray-50');
    });
  });

  describe('Padding', () => {
    it('should apply no padding', () => {
      const { container } = render(<Card padding="none">Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('p-3', 'p-6', 'p-8');
    });

    it('should apply small padding', () => {
      const { container } = render(<Card padding="sm">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-3');
    });

    it('should apply medium padding (default)', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-6');
    });

    it('should apply large padding', () => {
      const { container } = render(<Card padding="lg">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Hoverable', () => {
    it('should apply hover styles when hoverable', () => {
      const { container } = render(<Card hoverable>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('cursor-pointer', 'hover:shadow-lg');
    });

    it('should not apply hover styles by default', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      const { container } = render(<Card loading>Content</Card>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide content when loading', () => {
      render(<Card loading>Content</Card>);
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should apply loading styles', () => {
      const { container } = render(<Card loading>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('pointer-events-none', 'opacity-60');
    });
  });
});

describe('CardHeader', () => {
  it('should render card header', () => {
    render(<CardHeader title="Header Title" />);
    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<CardHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('should render actions', () => {
    render(
      <CardHeader
        title="Title"
        actions={<button>Action</button>}
      />
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <CardHeader title="Title">
        <p>Custom content</p>
      </CardHeader>
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});

describe('CardBody', () => {
  it('should render card body', () => {
    render(<CardBody>Body content</CardBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('should apply padding by default', () => {
    const { container } = render(<CardBody>Content</CardBody>);
    const body = container.firstChild;
    expect(body).toHaveClass('mt-4');
  });

  it('should remove padding when noPadding', () => {
    const { container } = render(<CardBody noPadding>Content</CardBody>);
    const body = container.firstChild;
    expect(body).not.toHaveClass('mt-4');
  });
});

describe('CardFooter', () => {
  it('should render card footer', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should align left', () => {
    const { container } = render(<CardFooter align="left">Content</CardFooter>);
    const footer = container.firstChild;
    expect(footer).toHaveClass('justify-start');
  });

  it('should align center', () => {
    const { container } = render(<CardFooter align="center">Content</CardFooter>);
    const footer = container.firstChild;
    expect(footer).toHaveClass('justify-center');
  });

  it('should align right (default)', () => {
    const { container } = render(<CardFooter>Content</CardFooter>);
    const footer = container.firstChild;
    expect(footer).toHaveClass('justify-end');
  });

  it('should align between', () => {
    const { container } = render(<CardFooter align="between">Content</CardFooter>);
    const footer = container.firstChild;
    expect(footer).toHaveClass('justify-between');
  });
});

describe('CardImage', () => {
  it('should render card image', () => {
    render(<CardImage src="/test.jpg" alt="Test image" />);
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('should apply 16:9 aspect ratio (default)', () => {
    const { container } = render(<CardImage src="/test.jpg" alt="Test" />);
    const image = container.querySelector('img');
    expect(image).toHaveClass('aspect-video');
  });

  it('should apply 4:3 aspect ratio', () => {
    const { container } = render(
      <CardImage src="/test.jpg" alt="Test" aspectRatio="4/3" />
    );
    const image = container.querySelector('img');
    expect(image).toHaveClass('aspect-4/3');
  });

  it('should apply square aspect ratio', () => {
    const { container } = render(
      <CardImage src="/test.jpg" alt="Test" aspectRatio="1/1" />
    );
    const image = container.querySelector('img');
    expect(image).toHaveClass('aspect-square');
  });

  it('should position at top (default)', () => {
    const { container } = render(<CardImage src="/test.jpg" alt="Test" />);
    const image = container.querySelector('img');
    expect(image).toHaveClass('rounded-t-lg');
  });

  it('should position at bottom', () => {
    const { container } = render(
      <CardImage src="/test.jpg" alt="Test" position="bottom" />
    );
    const image = container.querySelector('img');
    expect(image).toHaveClass('rounded-b-lg');
  });
});

describe('CardDivider', () => {
  it('should render divider', () => {
    const { container } = render(<CardDivider />);
    const divider = container.querySelector('hr');
    expect(divider).toBeInTheDocument();
  });

  it('should apply divider styles', () => {
    const { container } = render(<CardDivider />);
    const divider = container.querySelector('hr');
    expect(divider).toHaveClass('border-t', 'border-gray-200');
  });
});

describe('ClickableCard', () => {
  it('should render clickable card', () => {
    render(<ClickableCard>Clickable</ClickableCard>);
    expect(screen.getByText('Clickable')).toBeInTheDocument();
  });

  it('should be hoverable by default', () => {
    const { container } = render(<ClickableCard>Content</ClickableCard>);
    const card = container.querySelector('[role="button"]');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ClickableCard onClick={handleClick}>Clickable</ClickableCard>);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<ClickableCard onClick={handleClick}>Clickable</ClickableCard>);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalled();
  });

  it('should render as link when href provided', () => {
    const { container } = render(
      <ClickableCard href="/test">Link Card</ClickableCard>
    );
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/test');
  });
});

describe('CardGrid', () => {
  it('should render card grid', () => {
    const { container } = render(
      <CardGrid>
        <Card>Card 1</Card>
        <Card>Card 2</Card>
      </CardGrid>
    );
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
  });

  it('should apply 3 columns by default', () => {
    const { container } = render(<CardGrid><div /></CardGrid>);
    const grid = container.firstChild;
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('should apply 1 column', () => {
    const { container } = render(<CardGrid columns={1}><div /></CardGrid>);
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid-cols-1');
  });

  it('should apply 2 columns', () => {
    const { container } = render(<CardGrid columns={2}><div /></CardGrid>);
    const grid = container.firstChild;
    expect(grid).toHaveClass('md:grid-cols-2');
  });

  it('should apply 4 columns', () => {
    const { container } = render(<CardGrid columns={4}><div /></CardGrid>);
    const grid = container.firstChild;
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('should apply medium gap (default)', () => {
    const { container } = render(<CardGrid><div /></CardGrid>);
    const grid = container.firstChild;
    expect(grid).toHaveClass('gap-6');
  });

  it('should apply small gap', () => {
    const { container } = render(<CardGrid gap="sm"><div /></CardGrid>);
    const grid = container.firstChild;
    expect(grid).toHaveClass('gap-3');
  });

  it('should apply large gap', () => {
    const { container } = render(<CardGrid gap="lg"><div /></CardGrid>);
    const grid = container.firstChild;
    expect(grid).toHaveClass('gap-8');
  });
});

describe('StatsCard', () => {
  it('should render stats card', () => {
    render(<StatsCard label="Total Users" value="1,234" />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should render change percentage', () => {
    render(<StatsCard label="Revenue" value="$10,000" change={15} />);
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('should render change label', () => {
    render(
      <StatsCard label="Revenue" value="$10,000" change={15} changeLabel="from last month" />
    );
    expect(screen.getByText('from last month')).toBeInTheDocument();
  });

  it('should apply up trend color', () => {
    const { container } = render(
      <StatsCard label="Revenue" value="$10,000" change={15} trend="up" />
    );
    const changeElement = container.querySelector('.text-green-600');
    expect(changeElement).toBeInTheDocument();
  });

  it('should apply down trend color', () => {
    const { container } = render(
      <StatsCard label="Revenue" value="$10,000" change={-15} trend="down" />
    );
    const changeElement = container.querySelector('.text-red-600');
    expect(changeElement).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(
      <StatsCard
        label="Users"
        value="100"
        icon={<span data-testid="icon">👤</span>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('FeatureCard', () => {
  it('should render feature card', () => {
    render(
      <FeatureCard
        icon={<span data-testid="icon">✓</span>}
        title="Feature Title"
        description="Feature description"
      />
    );
    expect(screen.getByText('Feature Title')).toBeInTheDocument();
    expect(screen.getByText('Feature description')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render action', () => {
    render(
      <FeatureCard
        icon={<span>✓</span>}
        title="Feature"
        description="Description"
        action={<button>Learn More</button>}
      />
    );
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });
});

