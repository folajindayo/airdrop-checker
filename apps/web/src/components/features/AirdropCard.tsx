/**
 * Airdrop Card Component
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface AirdropCardProps {
  airdrop: {
    id: string;
    name: string;
    symbol: string;
    amount: string;
    status: string;
    endDate: string;
  };
  onPress?: () => void;
}

export const AirdropCard: React.FC<AirdropCardProps> = ({ airdrop, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'upcoming': return 'text-blue-500';
      case 'ended': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {airdrop.name}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {airdrop.symbol}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-sm font-medium ${getStatusColor(airdrop.status)}`}>
            {airdrop.status.toUpperCase()}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {airdrop.amount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};


