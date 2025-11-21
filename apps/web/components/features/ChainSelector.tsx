/**
 * Chain Selector Component
 */

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

interface ChainSelectorProps {
  onChainSelect: (chainId: number) => void;
  selectedChain?: number;
}

const CHAINS = [
  { id: 1, name: 'Ethereum', icon: '⟠' },
  { id: 137, name: 'Polygon', icon: '⬡' },
  { id: 56, name: 'BSC', icon: '●' },
  { id: 43114, name: 'Avalanche', icon: '▲' },
  { id: 42161, name: 'Arbitrum', icon: '◇' },
  { id: 10, name: 'Optimism', icon: '○' },
];

export const ChainSelector: React.FC<ChainSelectorProps> = ({ 
  onChainSelect, 
  selectedChain 
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
    >
      <View className="flex-row gap-2">
        {CHAINS.map((chain) => (
          <Pressable
            key={chain.id}
            onPress={() => onChainSelect(chain.id)}
            className={`px-4 py-2 rounded-lg flex-row items-center ${
              selectedChain === chain.id
                ? 'bg-blue-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <Text className="text-lg mr-2">{chain.icon}</Text>
            <Text
              className={`font-medium ${
                selectedChain === chain.id
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {chain.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

