import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Card from '../common/Card';

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

interface SpendingChartWidgetProps {
  data: MonthlyTrend[];
  currency?: string;
}

const screenWidth = Dimensions.get('window').width;

export const SpendingChartWidget: React.FC<SpendingChartWidgetProps> = ({
  data,
  currency = 'Rs.',
}) => {
  // Format data for paired BarChart (Income in green, Expenses in rose)
  const chartData = data.flatMap((item) => {
    const monthLabel = item.month.split('-')[1] || item.month;
    return [
      {
        value: Number(item.income) || 0,
        label: monthLabel,
        spacing: 2,
        labelWidth: 30,
        labelTextStyle: { color: '#64748b', fontSize: 10 },
        frontColor: '#10b981',
      },
      {
        value: Number(item.expenses) || 0,
        frontColor: '#f43f5e',
      },
    ];
  });

  const maxValue = Math.max(
    ...data.map((d) => Math.max(Number(d.income) || 0, Number(d.expenses) || 0)),
    1000
  );

  return (
    <Card
      title="Monthly Cashflow"
      subtitle="Income vs Expenses comparison"
      action={
        <View className="flex-row items-center space-x-2">
          <View className="flex-row items-center mr-3">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" />
            <Text className="text-[11px] text-slate-500 font-medium">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1" />
            <Text className="text-[11px] text-slate-500 font-medium">Expenses</Text>
          </View>
        </View>
      }
    >
      <View className="pt-2 items-center">
        {data.length > 0 ? (
          <BarChart
            data={chartData}
            barWidth={12}
            spacing={16}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={1}
            yAxisThickness={0}
            xAxisColor="#e2e8f0"
            yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
            noOfSections={3}
            maxValue={maxValue * 1.15}
            width={screenWidth - 80}
            height={160}
          />
        ) : (
          <View className="py-8 items-center justify-center">
            <Text className="text-xs text-slate-400">No transaction data recorded for this period</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

export default SpendingChartWidget;
