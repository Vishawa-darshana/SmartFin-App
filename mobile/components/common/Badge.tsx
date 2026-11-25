import React from 'react';
import { View, Text } from 'react-native';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  danger: { bg: 'bg-rose-50', text: 'text-rose-700' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
  neutral: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  const style = variantStyles[variant];
  return (
    <View className={`flex-row items-center px-2.5 py-1 rounded-full ${style.bg} ${className}`}>
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={`text-xs font-semibold ${style.text}`}>{label}</Text>
    </View>
  );
};

export default Badge;
