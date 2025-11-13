/**
 * Tests for StatusBadge component
 */

import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/common/status-badge';

describe('StatusBadge', () => {
  it('should render confirmed status badge', () => {
    render(<StatusBadge status="confirmed" />);
    const badge = screen.getByText('Confirmed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
  });

  it('should render rumored status badge', () => {
    render(<StatusBadge status="rumored" />);
    const badge = screen.getByText('Rumored');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('should render speculative status badge', () => {
    render(<StatusBadge status="speculative" />);
    const badge = screen.getByText('Speculative');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100');
  });

  it('should render expired status badge', () => {
    render(<StatusBadge status="expired" />);
    const badge = screen.getByText('Expired');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
  });

  it('should apply custom className', () => {
    render(<StatusBadge status="confirmed" className="custom-class" />);
    const badge = screen.getByText('Confirmed');
    expect(badge).toHaveClass('custom-class');
  });

  it('should have correct base classes', () => {
    render(<StatusBadge status="confirmed" />);
    const badge = screen.getByText('Confirmed');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
  });
});

