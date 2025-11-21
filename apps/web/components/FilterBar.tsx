/**
 * FilterBar Component
 */

'use client';

import { useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  onFilterChange: (value: string) => void;
  defaultValue?: string;
}

export function FilterBar({ options, onFilterChange, defaultValue = 'all' }: FilterBarProps) {
  const [selected, setSelected] = useState(defaultValue);

  const handleChange = (value: string) => {
    setSelected(value);
    onFilterChange(value);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition
            ${
              selected === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

