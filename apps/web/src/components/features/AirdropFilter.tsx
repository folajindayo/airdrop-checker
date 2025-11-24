/**
 * Airdrop Filter Component
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface AirdropFilterProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
}

export const AirdropFilter: React.FC<AirdropFilterProps> = ({ 
  onFilterChange, 
  activeFilter 
}) => {
  const filters = ['all', 'active', 'upcoming', 'ended'];

  return (
    <View className="flex-row gap-2 p-4">
      {filters.map((filter) => (
        <Pressable
          key={filter}
          onPress={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === filter
              ? 'bg-blue-500'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <Text
            className={`font-medium ${
              activeFilter === filter
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};


