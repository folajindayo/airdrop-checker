/**
 * Search Bar Component
 */

import React, { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = 'Search...' 
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    onSearch(query);
  };

  return (
    <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-3 m-4 shadow-sm">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        onSubmitEditing={handleSubmit}
        className="flex-1 text-gray-900 dark:text-white"
      />
      <Pressable
        onPress={handleSubmit}
        className="ml-2 px-4 py-2 bg-blue-500 rounded-lg"
      >
        <Text className="text-white font-medium">Search</Text>
      </Pressable>
    </View>
  );
};


