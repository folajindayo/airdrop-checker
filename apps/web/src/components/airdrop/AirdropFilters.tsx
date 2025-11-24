"use client";

import React, { useState } from "react";
import Button from "../ui/Button";

interface AirdropFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  status: string[];
  eligibility: string;
  chains: string[];
  sortBy: string;
}

/**
 * AirdropFilters Component
 * Filtering and sorting controls for airdrops
 */
export default function AirdropFilters({ onFilterChange }: AirdropFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    eligibility: "all",
    chains: [],
    sortBy: "date",
  });

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];

    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleEligibilityChange = (eligibility: string) => {
    const newFilters = { ...filters, eligibility };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      status: [],
      eligibility: "all",
      chains: [],
      sortBy: "date",
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {["active", "upcoming", "ended"].map((status) => (
              <label key={status} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusChange(status)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm capitalize text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Eligibility Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700">Eligibility</label>
          <div className="mt-2 flex gap-2">
            {["all", "eligible", "not-eligible"].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="eligibility"
                  checked={filters.eligibility === option}
                  onChange={() => handleEligibilityChange(option)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm capitalize text-gray-700">
                  {option.replace("-", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium text-gray-700">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}

