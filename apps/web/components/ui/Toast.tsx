/**
 * Toast Component
 */

'use client';

import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <View className={`fixed top-4 right-4 ${getTypeStyles()} px-6 py-4 rounded-lg shadow-lg z-50 max-w-md`}>
      <Pressable onPress={onClose}>
        <Text className="text-white font-medium">{message}</Text>
      </Pressable>
    </View>
  );
};
