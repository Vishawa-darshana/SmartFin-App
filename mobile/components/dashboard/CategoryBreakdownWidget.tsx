import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Card from '../common/Card';

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

interface CategoryBreakdownWidgetProps {
  categories: CategoryItem[];
  totalExpenses: number;
  currency?: string;
}

const DEFAULT_COLORS = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#eab308', // Amber
  '#6366f1', // Indigo
  '#64748b', // Slate
];

export const CategoryBreakdownWidget: React.FC<CategoryBreakdownWidgetProps> = ({
  categories,
  totalExpenses,
  currency = 'Rs.',
}) => {
  const pieData = categories.slice(0, 5).map((cat, idx) => ({
    value: Number(cat.amount) || 0,
    color: cat.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
    text: `${Math.round(cat.percentage)}%`,
  }));

  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <Card
      title="Expense by Category"
      subtitle="Where your money went this month"
    >
      {categories.length > 0 ? (
        <View>
          {/* Donut Chart with center label */}
          <View className="items-center justify-center my-2">
            <PieChart
              data={pieData}
              donut
              radius={70}
              innerRadius={50}
              centerLabelComponent={() => (
                <View className="items-center justify-center">
                  <Text className="text-[10px] text-slate-400 font-medium">Total Spent</Text>
                  <Text className="text-xs font-bold text-slate-800">
                    {currency} {formatAmount(totalExpenses)}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* Category List Rows */}
          <View className="mt-3 divide-y divide-slate-100">
            {categories.slice(0, 4).map((item, index) => {
              const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              return (
                <View key={item.category} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-3 h-3 rounded-full mr-2.5"
                      style={{ backgroundColor: color }}
                    />
                    <Text className="text-sm font-semibold text-slate-700 flex-1" numberOfLines={1}>
                      {item.category}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-slate-900">
                      {currency} {formatAmount(Number(item.amount))}
                    </Text>
                    <Text className="text-[10px] text-slate-400">{item.percentage}% of total</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View className="py-6 items-center justify-center">
          <Text className="text-xs text-slate-400">No expense breakdown available</Text>
        </View>
      )}
    </Card>
  );
};

export default CategoryBreakdownWidget;
