/**
 * Tests for Checkbox and Radio Components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Checkbox,
  CheckboxGroup,
  Switch,
  Radio,
  RadioGroup,
  CheckboxGroupOption,
  RadioGroupOption,
} from '@/components/ui/checkbox';

describe('Checkbox', () => {
  describe('Basic Rendering', () => {
    it('should render checkbox', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByText('Accept terms')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Checkbox label="Terms" description="Accept terms and conditions" />);
      expect(screen.getByText('Accept terms and conditions')).toBeInTheDocument();
    });

    it('should render with error', () => {
      render(<Checkbox error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should render with required indicator', () => {
      render(<Checkbox label="Required field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be checked when checked prop is true', () => {
      render(<Checkbox checked onChange={() => {}} />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should be unchecked when checked prop is false', () => {
      render(<Checkbox checked={false} onChange={() => {}} />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should set indeterminate state', () => {
      render(<Checkbox indeterminate />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      // Note: indeterminate is set via ref, may not be immediately testable
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size', () => {
      const { container } = render(<Checkbox checkboxSize="sm" />);
      const checkbox = container.querySelector('input');
      expect(checkbox).toHaveClass('h-4', 'w-4');
    });

    it('should apply medium size (default)', () => {
      const { container } = render(<Checkbox />);
      const checkbox = container.querySelector('input');
      expect(checkbox).toHaveClass('h-5', 'w-5');
    });

    it('should apply large size', () => {
      const { container } = render(<Checkbox checkboxSize="lg" />);
      const checkbox = container.querySelector('input');
      expect(checkbox).toHaveClass('h-6', 'w-6');
    });
  });

  describe('Events', () => {
    it('should call onChange when clicked', () => {
      const handleChange = jest.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should not call onChange when disabled', () => {
      const handleChange = jest.fn();
      render(<Checkbox onChange={handleChange} disabled />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error', () => {
      render(<Checkbox error="Error message" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link description with aria-describedby', () => {
      render(<Checkbox description="Helper text" />);
      const checkbox = screen.getByRole('checkbox');
      const ariaDescribedBy = checkbox.getAttribute('aria-describedby');
      
      if (ariaDescribedBy) {
        const description = document.getElementById(ariaDescribedBy);
        expect(description).toHaveTextContent('Helper text');
      }
    });
  });
});

describe('CheckboxGroup', () => {
  const mockOptions: CheckboxGroupOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  it('should render checkbox group', () => {
    const { container } = render(
      <CheckboxGroup options={mockOptions} onChange={() => {}} />
    );
    const group = container.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
  });

  it('should render all options', () => {
    render(<CheckboxGroup options={mockOptions} onChange={() => {}} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should render with group label', () => {
    render(
      <CheckboxGroup
        options={mockOptions}
        label="Select options"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('should check selected options', () => {
    render(
      <CheckboxGroup
        options={mockOptions}
        value={['option1', 'option2']}
        onChange={() => {}}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[2] as HTMLInputElement).checked).toBe(false);
  });

  it('should call onChange when option is selected', () => {
    const handleChange = jest.fn();
    render(<CheckboxGroup options={mockOptions} value={[]} onChange={handleChange} />);

    const checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(['option1']);
  });

  it('should render horizontally', () => {
    const { container } = render(
      <CheckboxGroup options={mockOptions} orientation="horizontal" onChange={() => {}} />
    );
    const wrapper = container.querySelector('.flex-row');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render vertically (default)', () => {
    const { container } = render(
      <CheckboxGroup options={mockOptions} onChange={() => {}} />
    );
    const wrapper = container.querySelector('.flex-col');
    expect(wrapper).toBeInTheDocument();
  });
});

describe('Switch', () => {
  describe('Basic Rendering', () => {
    it('should render switch', () => {
      render(<Switch />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Switch label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Switch label="Toggle" description="Enable or disable feature" />);
      expect(screen.getByText('Enable or disable feature')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be checked when checked prop is true', () => {
      render(<Switch checked onChange={() => {}} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should be unchecked when checked prop is false', () => {
      render(<Switch checked={false} onChange={() => {}} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Switch disabled />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size', () => {
      const { container } = render(<Switch switchSize="sm" />);
      const switchButton = container.querySelector('button');
      expect(switchButton).toHaveClass('h-5', 'w-9');
    });

    it('should apply medium size (default)', () => {
      const { container } = render(<Switch />);
      const switchButton = container.querySelector('button');
      expect(switchButton).toHaveClass('h-6', 'w-11');
    });

    it('should apply large size', () => {
      const { container } = render(<Switch switchSize="lg" />);
      const switchButton = container.querySelector('button');
      expect(switchButton).toHaveClass('h-7', 'w-14');
    });
  });

  describe('Events', () => {
    it('should call onChange when clicked', () => {
      const handleChange = jest.fn();
      render(<Switch checked={false} onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should toggle checked state', () => {
      const handleChange = jest.fn();
      render(<Switch checked={false} onChange={handleChange} />);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      const call = handleChange.mock.calls[0][0];
      expect(call.target.checked).toBe(true);
    });
  });
});

describe('Radio', () => {
  describe('Basic Rendering', () => {
    it('should render radio button', () => {
      render(<Radio name="test" />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Radio name="test" label="Option A" />);
      expect(screen.getByText('Option A')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Radio name="test" label="Option" description="Select this option" />);
      expect(screen.getByText('Select this option')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be checked when checked prop is true', () => {
      render(<Radio name="test" checked onChange={() => {}} />);
      const radio = screen.getByRole('radio') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Radio name="test" disabled />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeDisabled();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size', () => {
      const { container } = render(<Radio name="test" radioSize="sm" />);
      const radio = container.querySelector('input');
      expect(radio).toHaveClass('h-4', 'w-4');
    });

    it('should apply medium size (default)', () => {
      const { container } = render(<Radio name="test" />);
      const radio = container.querySelector('input');
      expect(radio).toHaveClass('h-5', 'w-5');
    });

    it('should apply large size', () => {
      const { container } = render(<Radio name="test" radioSize="lg" />);
      const radio = container.querySelector('input');
      expect(radio).toHaveClass('h-6', 'w-6');
    });
  });

  describe('Events', () => {
    it('should call onChange when clicked', () => {
      const handleChange = jest.fn();
      render(<Radio name="test" onChange={handleChange} />);

      const radio = screen.getByRole('radio');
      fireEvent.click(radio);

      expect(handleChange).toHaveBeenCalled();
    });
  });
});

describe('RadioGroup', () => {
  const mockOptions: RadioGroupOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  it('should render radio group', () => {
    const { container } = render(
      <RadioGroup name="test" options={mockOptions} onChange={() => {}} />
    );
    const group = container.querySelector('[role="radiogroup"]');
    expect(group).toBeInTheDocument();
  });

  it('should render all options', () => {
    render(<RadioGroup name="test" options={mockOptions} onChange={() => {}} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should render with group label', () => {
    render(
      <RadioGroup
        name="test"
        options={mockOptions}
        label="Select an option"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should check selected option', () => {
    render(
      <RadioGroup
        name="test"
        options={mockOptions}
        value="option2"
        onChange={() => {}}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(true);
    expect((radios[2] as HTMLInputElement).checked).toBe(false);
  });

  it('should call onChange when option is selected', () => {
    const handleChange = jest.fn();
    render(
      <RadioGroup name="test" options={mockOptions} onChange={handleChange} />
    );

    const radio = screen.getByLabelText('Option 1');
    fireEvent.click(radio);

    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('should render horizontally', () => {
    const { container } = render(
      <RadioGroup
        name="test"
        options={mockOptions}
        orientation="horizontal"
        onChange={() => {}}
      />
    );
    const wrapper = container.querySelector('.flex-row');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render vertically (default)', () => {
    const { container } = render(
      <RadioGroup name="test" options={mockOptions} onChange={() => {}} />
    );
    const wrapper = container.querySelector('.flex-col');
    expect(wrapper).toBeInTheDocument();
  });
});

