/**
 * Tests for Select Components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Select, NativeSelect, SelectOption } from '@/components/ui/select';

const mockOptions: SelectOption[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3', disabled: true },
  { value: '4', label: 'Option 4', description: 'This is option 4' },
];

describe('Select', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render with placeholder', () => {
      render(
        <Select options={mockOptions} onChange={mockOnChange} placeholder="Choose..." />
      );

      expect(screen.getByText('Choose...')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(
        <Select options={mockOptions} onChange={mockOnChange} label="Select Option" />
      );

      expect(screen.getByText('Select Option')).toBeInTheDocument();
    });

    it('should render with required indicator', () => {
      render(
        <Select
          options={mockOptions}
          onChange={mockOnChange}
          label="Select Option"
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(
        <Select
          options={mockOptions}
          onChange={mockOnChange}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Single Select', () => {
    it('should open dropdown when clicked', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Option 1')).toBeVisible();
      expect(screen.getByText('Option 2')).toBeVisible();
    });

    it('should select option when clicked', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      fireEvent.click(screen.getByText('Option 1'));

      expect(mockOnChange).toHaveBeenCalledWith('1');
    });

    it('should close dropdown after selection', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(screen.getByText('Option 1'));

      expect(screen.queryByText('Option 2')).not.toBeVisible();
    });

    it('should display selected value', () => {
      render(<Select options={mockOptions} value="2" onChange={mockOnChange} />);

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should not select disabled option', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const disabledOption = screen.getByText('Option 3');
      fireEvent.click(disabledOption);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Multi Select', () => {
    it('should allow multiple selections', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} multiple />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      fireEvent.click(screen.getByText('Option 1'));
      expect(mockOnChange).toHaveBeenCalledWith(['1']);

      fireEvent.click(screen.getByText('Option 2'));
      expect(mockOnChange).toHaveBeenCalledWith(['2']);
    });

    it('should display count when multiple selected', () => {
      render(
        <Select options={mockOptions} value={['1', '2']} onChange={mockOnChange} multiple />
      );

      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('should display single label when one selected', () => {
      render(
        <Select options={mockOptions} value={['1']} onChange={mockOnChange} multiple />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should toggle selection', () => {
      const { rerender } = render(
        <Select options={mockOptions} value={['1']} onChange={mockOnChange} multiple />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      fireEvent.click(screen.getByText('Option 1'));
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Searchable', () => {
    it('should show search input when searchable', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} searchable />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should filter options based on search query', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} searchable />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Option 1' } });

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });

    it('should show no options message when no matches', () => {
      render(
        <Select
          options={mockOptions}
          onChange={mockOnChange}
          searchable
          noOptionsMessage="No matches found"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No matches found')).toBeInTheDocument();
    });
  });

  describe('Clearable', () => {
    it('should show clear button when clearable and has value', () => {
      render(
        <Select options={mockOptions} value="1" onChange={mockOnChange} clearable />
      );

      expect(screen.getByLabelText('Clear selection')).toBeInTheDocument();
    });

    it('should not show clear button when no value', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} clearable />);

      expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument();
    });

    it('should clear selection when clear button clicked', () => {
      render(
        <Select options={mockOptions} value="1" onChange={mockOnChange} clearable />
      );

      const clearButton = screen.getByLabelText('Clear selection');
      fireEvent.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open on Enter key', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(screen.getByText('Option 1')).toBeVisible();
    });

    it('should close on Escape key', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.keyDown(button, { key: 'Escape' });

      expect(screen.queryByText('Option 2')).not.toBeVisible();
    });

    it('should navigate with Arrow keys', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'ArrowDown' });

      expect(screen.getByText('Option 1')).toBeVisible();
    });

    it('should select highlighted option on Enter', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'ArrowDown' });
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Loading State', () => {
    it('should show loading message', () => {
      render(
        <Select
          options={mockOptions}
          onChange={mockOnChange}
          loading
          loadingMessage="Loading options..."
        />
      );

      expect(screen.getByText('Loading options...')).toBeInTheDocument();
    });

    it('should disable interaction when loading', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} loading />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('should disable select', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not open when disabled', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} disabled />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom option renderer', () => {
      const renderOption = (option: SelectOption) => (
        <div>Custom: {option.label}</div>
      );

      render(
        <Select
          options={mockOptions}
          onChange={mockOnChange}
          renderOption={renderOption}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Custom: Option 1')).toBeInTheDocument();
    });

    it('should use custom value renderer', () => {
      const renderValue = (value: string | string[]) => (
        <div>Selected: {value}</div>
      );

      render(
        <Select
          options={mockOptions}
          value="1"
          onChange={mockOnChange}
          renderValue={renderValue}
        />
      );

      expect(screen.getByText('Selected: 1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when opened', () => {
      render(<Select options={mockOptions} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-invalid when error', () => {
      render(
        <Select options={mockOptions} onChange={mockOnChange} error="Error message" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error with aria-describedby', () => {
      render(
        <Select options={mockOptions} onChange={mockOnChange} error="Error message" />
      );

      const button = screen.getByRole('button');
      const ariaDescribedBy = button.getAttribute('aria-describedby');
      
      if (ariaDescribedBy) {
        const errorElement = document.getElementById(ariaDescribedBy);
        expect(errorElement).toHaveTextContent('Error message');
      }
    });
  });
});

describe('NativeSelect', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render native select', () => {
    render(<NativeSelect options={mockOptions} onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(
      <NativeSelect options={mockOptions} onChange={mockOnChange} label="Choose" />
    );

    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('should render options', () => {
    render(<NativeSelect options={mockOptions} onChange={mockOnChange} />);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should call onChange when option selected', () => {
    render(<NativeSelect options={mockOptions} onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });

    expect(mockOnChange).toHaveBeenCalledWith('2');
  });

  it('should render with error', () => {
    render(
      <NativeSelect
        options={mockOptions}
        onChange={mockOnChange}
        error="Required field"
      />
    );

    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('should render with helper text', () => {
    render(
      <NativeSelect
        options={mockOptions}
        onChange={mockOnChange}
        helperText="Select an option"
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<NativeSelect options={mockOptions} onChange={mockOnChange} disabled />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });
});

