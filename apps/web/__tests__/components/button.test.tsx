/**
 * Tests for Button Components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Button,
  IconButton,
  ButtonGroup,
  LinkButton,
  CloseButton,
  CopyButton,
} from '@/components/ui/button';

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render as button by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render with custom type', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant (default)', () => {
      const { container } = render(<Button>Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should apply secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-gray-600');
    });

    it('should apply outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('border-2', 'border-blue-600');
    });

    it('should apply ghost variant', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-gray-700');
    });

    it('should apply danger variant', () => {
      const { container } = render(<Button variant="danger">Danger</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('should apply success variant', () => {
      const { container } = render(<Button variant="success">Success</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-green-600');
    });

    it('should apply warning variant', () => {
      const { container } = render(<Button variant="warning">Warning</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-yellow-600');
    });
  });

  describe('Sizes', () => {
    it('should apply extra small size', () => {
      const { container } = render(<Button size="xs">XS</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-xs', 'h-7');
    });

    it('should apply small size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-sm', 'h-8');
    });

    it('should apply medium size (default)', () => {
      const { container } = render(<Button>Medium</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-base', 'h-10');
    });

    it('should apply large size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-lg', 'h-12');
    });

    it('should apply extra large size', () => {
      const { container } = render(<Button size="xl">XL</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-xl', 'h-14');
    });
  });

  describe('Icons', () => {
    it('should render with left icon', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>With Icon</Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render with right icon', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>With Icon</Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should render with both icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Both
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show spinner when loading', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide icons when loading', () => {
      render(
        <Button loading leftIcon={<span data-testid="left-icon">←</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('should disable button', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Full Width', () => {
    it('should apply full width class', () => {
      const { container } = render(<Button fullWidth>Full Width</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Events', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});

describe('IconButton', () => {
  it('should render icon button', () => {
    render(
      <IconButton icon={<span data-testid="icon">✓</span>} aria-label="Check" />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should have aria-label', () => {
    render(
      <IconButton icon={<span>✓</span>} aria-label="Check" />
    );
    const button = screen.getByLabelText('Check');
    expect(button).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    const { container } = render(
      <IconButton icon={<span>✓</span>} aria-label="Check" size="lg" />
    );
    const button = container.querySelector('button');
    expect(button).toHaveClass('h-12', 'w-12');
  });
});

describe('ButtonGroup', () => {
  it('should render button group', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonGroup>
    );

    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
  });

  it('should render horizontally by default', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>
    );

    const group = container.querySelector('[role="group"]');
    expect(group).toHaveClass('flex-row');
  });

  it('should render vertically', () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <Button>First</Button>
        <Button>Second</Button>
      </ButtonGroup>
    );

    const group = container.querySelector('[role="group"]');
    expect(group).toHaveClass('flex-col');
  });
});

describe('LinkButton', () => {
  it('should render as anchor tag', () => {
    render(<LinkButton href="/test">Link</LinkButton>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should apply link styling', () => {
    const { container } = render(<LinkButton href="/test">Link</LinkButton>);
    const link = container.querySelector('a');
    expect(link).toHaveClass('text-blue-600');
  });

  it('should be disabled', () => {
    render(
      <LinkButton href="/test" disabled>
        Disabled Link
      </LinkButton>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveClass('pointer-events-none');
  });

  it('should apply size classes', () => {
    const { container } = render(
      <LinkButton href="/test" size="lg">
        Large Link
      </LinkButton>
    );
    const link = container.querySelector('a');
    expect(link).toHaveClass('text-lg');
  });
});

describe('CloseButton', () => {
  it('should render close button', () => {
    render(<CloseButton />);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('should use custom aria-label', () => {
    render(<CloseButton aria-label="Close modal" />);
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('should render close icon', () => {
    const { container } = render(<CloseButton />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<CloseButton onClick={handleClick} />);

    const button = screen.getByLabelText('Close');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});

describe('CopyButton', () => {
  const originalClipboard = { ...global.navigator.clipboard };

  beforeEach(() => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    // @ts-ignore
    global.navigator.clipboard = mockClipboard;
  });

  afterEach(() => {
    // @ts-ignore
    global.navigator.clipboard = originalClipboard;
    jest.clearAllMocks();
  });

  it('should render copy button', () => {
    render(<CopyButton text="Hello World" />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should copy text to clipboard when clicked', async () => {
    render(<CopyButton text="Hello World" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello World');
    });
  });

  it('should show "Copied!" after copying', async () => {
    render(<CopyButton text="Hello World" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should call onCopy callback', async () => {
    const handleCopy = jest.fn();
    render(<CopyButton text="Hello World" onCopy={handleCopy} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleCopy).toHaveBeenCalled();
    });
  });

  it('should render custom children', () => {
    render(<CopyButton text="Hello World">Custom Copy</CopyButton>);
    expect(screen.getByText('Custom Copy')).toBeInTheDocument();
  });

  it('should reset to "Copy" after timeout', async () => {
    jest.useFakeTimers();
    render(<CopyButton text="Hello World" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});

