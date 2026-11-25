import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <View
      className={`rounded-3xl p-4 mb-4 ${className}`}
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          borderWidth: 1.2,
          borderColor: 'rgba(255, 255, 255, 0.92)',
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.05,
          shadowRadius: 14,
          elevation: 3,
        },
        style,
      ]}
      {...props}
    >
      {(title || action) && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            {title && <Text className="text-base font-bold text-slate-800">{title}</Text>}
            {subtitle && <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>}
          </View>
          {action && <View>{action}</View>}
        </View>
      )}
      {children}
    </View>
  );
};

export default Card;
