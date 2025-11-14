/**
 * @fileoverview Tests for Switch component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Switch, SwitchGroup } from '@/components/ui/switch';

describe('Switch Component', () => {
  describe('Rendering', () => {
    it('should render switch', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Switch label="Enable notifications" />);

      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });

    it('should render with description', () => {
      render(<Switch label="Enable" description="Turn on notifications" />);

      expect(screen.getByText('Turn on notifications')).toBeInTheDocument();
    });

    it('should support different sizes', () => {
      const { rerender } = render(<Switch aria-label="Test" size="sm" />);
      let switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-4', 'w-8');

      rerender(<Switch aria-label="Test" size="md" />);
      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-6', 'w-11');

      rerender(<Switch aria-label="Test" size="lg" />);
      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('h-7', 'w-14');
    });
  });

  describe('Controlled Mode', () => {
    it('should work as controlled component', () => {
      const onChange = jest.fn();
      const { rerender } = render(<Switch checked={false} onChange={onChange} aria-label="Test" />);

      let switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(switchElement);
      expect(onChange).toHaveBeenCalledWith(true);

      rerender(<Switch checked={true} onChange={onChange} aria-label="Test" />);
      switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should not change state without onChange handler', () => {
      render(<Switch checked={false} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Uncontrolled Mode', () => {
    it('should work as uncontrolled component', () => {
      render(<Switch defaultChecked={false} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'true');

      fireEvent.click(switchElement);
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should respect defaultChecked prop', () => {
      render(<Switch defaultChecked={true} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('should call onChange in uncontrolled mode', () => {
      const onChange = jest.fn();
      render(<Switch defaultChecked={false} onChange={onChange} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      const onChange = jest.fn();
      render(<Switch disabled onChange={onChange} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();

      fireEvent.click(switchElement);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle loading state', () => {
      const onChange = jest.fn();
      render(<Switch loading onChange={onChange} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
      
      fireEvent.click(switchElement);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should show loading indicator', () => {
      render(<Switch loading aria-label="Test" />);

      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('should include hidden input for form submission', () => {
      render(<Switch name="notifications" id="notif-switch" aria-label="Test" />);

      const hiddenInput = document.querySelector('input[type="checkbox"][name="notifications"]');
      expect(hiddenInput).toBeInTheDocument();
    });

    it('should sync hidden input with switch state', () => {
      render(<Switch name="test" defaultChecked={false} aria-label="Test" />);

      const hiddenInput = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(hiddenInput.checked).toBe(false);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      expect(hiddenInput.checked).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Switch aria-label="Test switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-checked');
      expect(switchElement).toHaveAttribute('type', 'button');
    });

    it('should support aria-label', () => {
      render(<Switch aria-label="Custom label" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should associate with label', () => {
      render(<Switch label="Enable feature" id="feature-switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-labelledby', 'feature-switch-label');
    });

    it('should associate with description', () => {
      render(<Switch label="Enable" description="Enable this feature" id="test-switch" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('aria-describedby', 'test-switch-description');
    });

    it('should have screen reader text', () => {
      render(<Switch aria-label="Toggle feature" />);

      expect(screen.getByText('Toggle feature', { selector: '.sr-only' })).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const onChange = jest.fn();
      render(<Switch onChange={onChange} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();
      expect(switchElement).toHaveFocus();

      // Space or Enter would trigger click in real browser
      fireEvent.click(switchElement);
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Visual States', () => {
    it('should apply checked styles', () => {
      render(<Switch checked={true} onChange={jest.fn()} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('bg-blue-600');
    });

    it('should apply unchecked styles', () => {
      render(<Switch checked={false} onChange={jest.fn()} aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('bg-gray-200');
    });

    it('should apply disabled opacity', () => {
      render(<Switch disabled aria-label="Test" />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveClass('opacity-50');
    });
  });

  describe('Custom Props', () => {
    it('should support custom className', () => {
      render(<Switch className="custom-class" aria-label="Test" />);

      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('should support custom id', () => {
      render(<Switch id="custom-id" name="test" aria-label="Test" />);

      const hiddenInput = document.getElementById('custom-id');
      expect(hiddenInput).toBeInTheDocument();
    });
  });
});

describe('SwitchGroup Component', () => {
  it('should render switch group', () => {
    render(
      <SwitchGroup label="Settings">
        <Switch label="Option 1" />
        <Switch label="Option 2" />
      </SwitchGroup>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(
      <SwitchGroup label="Settings" description="Configure your preferences">
        <Switch label="Option 1" />
      </SwitchGroup>
    );

    expect(screen.getByText('Configure your preferences')).toBeInTheDocument();
  });

  it('should have proper group role', () => {
    render(
      <SwitchGroup label="Settings">
        <Switch label="Option 1" />
      </SwitchGroup>
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-labelledby', 'group-label');
  });

  it('should support custom className', () => {
    const { container } = render(
      <SwitchGroup label="Settings" className="custom-group">
        <Switch label="Option 1" />
      </SwitchGroup>
    );

    expect(container.querySelector('.custom-group')).toBeInTheDocument();
  });

  it('should render multiple switches', () => {
    render(
      <SwitchGroup label="Notification Settings">
        <Switch label="Email" />
        <Switch label="Push" />
        <Switch label="SMS" />
      </SwitchGroup>
    );

    expect(screen.getAllByRole('switch')).toHaveLength(3);
  });
});

