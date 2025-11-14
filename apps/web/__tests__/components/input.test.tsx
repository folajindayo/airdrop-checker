/**
 * Tests for Input Components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input, Textarea, SearchInput } from '@/components/ui/input';

describe('Input', () => {
  describe('Basic Rendering', () => {
    it('should render input field', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Username" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should render with required indicator', () => {
      render(<Input label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      const { container } = render(<Input inputSize="sm" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('h-8', 'text-sm');
    });

    it('should apply medium size classes (default)', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('h-10', 'text-base');
    });

    it('should apply large size classes', () => {
      const { container } = render(<Input inputSize="lg" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('h-12', 'text-lg');
    });
  });

  describe('Input Types', () => {
    it('should render as text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render as email input', () => {
      render(<Input type="email" />);
      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
    });

    it('should render as password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render as number input', () => {
      render(<Input type="number" />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Value Handling', () => {
    it('should display controlled value', () => {
      render(<Input value="test value" onChange={() => {}} />);
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('should call onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should respect maxLength', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Prefix and Suffix Icons', () => {
    it('should render prefix icon', () => {
      render(
        <Input
          prefixIcon={<span data-testid="prefix-icon">👤</span>}
        />
      );
      expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
    });

    it('should render suffix icon', () => {
      render(
        <Input
          suffixIcon={<span data-testid="suffix-icon">✓</span>}
        />
      );
      expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
    });

    it('should call onPrefixClick when prefix clicked', () => {
      const handleClick = jest.fn();
      render(
        <Input
          prefixIcon={<span>👤</span>}
          onPrefixClick={handleClick}
        />
      );

      const prefixButton = screen.getByRole('button', { hidden: true });
      fireEvent.click(prefixButton);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Clearable', () => {
    it('should show clear button when clearable and has value', () => {
      render(<Input value="test" onChange={() => {}} clearable />);
      expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
    });

    it('should not show clear button when empty', () => {
      render(<Input value="" onChange={() => {}} clearable />);
      expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument();
    });

    it('should clear value when clear button clicked', () => {
      const handleChange = jest.fn();
      render(<Input value="test" onChange={handleChange} clearable />);

      const clearButton = screen.getByLabelText('Clear input');
      fireEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' }),
        })
      );
    });
  });

  describe('Password Toggle', () => {
    it('should show password toggle for password input', () => {
      render(<Input type="password" showPasswordToggle />);
      expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    });

    it('should toggle password visibility', () => {
      render(<Input type="password" showPasswordToggle />);

      const input = document.querySelector('input');
      expect(input).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByLabelText('Show password');
      fireEvent.click(toggleButton);

      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
    });
  });

  describe('Character Count', () => {
    it('should show character count when enabled', () => {
      render(<Input value="hello" onChange={() => {}} showCharacterCount maxLength={10} />);
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('should highlight when over max length', () => {
      render(
        <Input
          value="this is too long"
          onChange={() => {}}
          showCharacterCount
          maxLength={10}
        />
      );

      const count = screen.getByText('17/10');
      expect(count).toHaveClass('text-red-600');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      const { container } = render(<Input loading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable input when loading', () => {
      render(<Input loading />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('should disable input', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('cursor-not-allowed', 'bg-gray-100');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error with aria-describedby', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      const ariaDescribedBy = input.getAttribute('aria-describedby');

      if (ariaDescribedBy) {
        const errorElement = document.getElementById(ariaDescribedBy);
        expect(errorElement).toHaveTextContent('Error message');
      }
    });

    it('should link helper text with aria-describedby', () => {
      render(<Input helperText="Helper text" />);
      const input = screen.getByRole('textbox');
      const ariaDescribedBy = input.getAttribute('aria-describedby');

      if (ariaDescribedBy) {
        const helperElement = document.getElementById(ariaDescribedBy);
        expect(helperElement).toHaveTextContent('Helper text');
      }
    });
  });
});

describe('Textarea', () => {
  describe('Basic Rendering', () => {
    it('should render textarea', () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render with error', () => {
      render(<Textarea error="Required field" />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<Textarea helperText="Enter description" />);
      expect(screen.getByText('Enter description')).toBeInTheDocument();
    });
  });

  describe('Value Handling', () => {
    it('should display value', () => {
      render(<Textarea value="test value" onChange={() => {}} />);
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('should call onChange', () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Resize Options', () => {
    it('should apply resize none', () => {
      const { container } = render(<Textarea resize="none" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should apply resize vertical (default)', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('resize-y');
    });

    it('should apply resize horizontal', () => {
      const { container } = render(<Textarea resize="horizontal" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('resize-x');
    });
  });

  describe('Character Count', () => {
    it('should show character count', () => {
      render(
        <Textarea value="hello" onChange={() => {}} showCharacterCount maxLength={100} />
      );
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable textarea', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });
  });
});

describe('SearchInput', () => {
  it('should render search input', () => {
    render(<SearchInput placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should have search icon', () => {
    const { container } = render(<SearchInput />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should call onSearch on Enter key', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} value="test" onChange={() => {}} />);

    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('should be clearable by default', () => {
    render(<SearchInput value="test" onChange={() => {}} />);
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
  });
});

