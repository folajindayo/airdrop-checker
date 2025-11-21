/**
 * Eligibility Status Component
 */

import React from 'react';
import { View, Text } from 'react-native';

interface EligibilityStatusProps {
  eligible: boolean;
  criteria?: {
    met: string[];
    unmet: string[];
  };
}

export const EligibilityStatus: React.FC<EligibilityStatusProps> = ({ 
  eligible, 
  criteria 
}) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <View className="flex-row items-center mb-3">
        <View className={`w-3 h-3 rounded-full mr-2 ${eligible ? 'bg-green-500' : 'bg-red-500'}`} />
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          {eligible ? 'Eligible' : 'Not Eligible'}
        </Text>
      </View>

      {criteria && (
        <>
          {criteria.met.length > 0 && (
            <View className="mb-3">
              <Text className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                ✓ Requirements Met:
              </Text>
              {criteria.met.map((item, i) => (
                <Text key={i} className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                  • {item}
                </Text>
              ))}
            </View>
          )}

          {criteria.unmet.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                ✗ Requirements Not Met:
              </Text>
              {criteria.unmet.map((item, i) => (
                <Text key={i} className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                  • {item}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

