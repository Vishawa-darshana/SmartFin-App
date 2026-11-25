import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import Card from '../common/Card';

interface BudgetItem {
  id?: number;
  category: string;
  budget: number;
  actual: number;
}

interface BudgetAlertWidgetProps {
  budgets: BudgetItem[];
  currency?: string;
}

export const BudgetAlertWidget: React.FC<BudgetAlertWidgetProps> = ({
  budgets,
  currency = 'Rs.',
}) => {
  const router = useRouter();

  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <Card
      title="Budget Health"
      subtitle="Monthly category thresholds"
      action={
        <TouchableOpacity
          onPress={() => router.push('/budgets')}
          className="flex-row items-center"
        >
          <Text className="text-xs font-semibold text-emerald-600 mr-0.5">Manage</Text>
          <ChevronRight size={14} color="#059669" />
        </TouchableOpacity>
      }
    >
      {budgets.length > 0 ? (
        <View className="space-y-3">
          {budgets.slice(0, 3).map((item) => {
            const budgetNum = Number(item.budget) || 1;
            const actualNum = Number(item.actual) || 0;
            const ratio = Math.min(actualNum / budgetNum, 1);
            const pct = Math.round((actualNum / budgetNum) * 100);

            const isOver = actualNum > budgetNum;
            const isNear = pct >= 80 && !isOver;

            let progressColor = '#10b981'; // emerald
            let statusText = `${pct}% spent`;
            let statusBadgeColor = 'text-emerald-700 bg-emerald-50';

            if (isOver) {
              progressColor = '#ef4444'; // rose/red
              statusText = `Over by ${currency} ${formatAmount(actualNum - budgetNum)}`;
              statusBadgeColor = 'text-rose-700 bg-rose-50';
            } else if (isNear) {
              progressColor = '#f59e0b'; // amber
              statusText = `${pct}% near limit`;
              statusBadgeColor = 'text-amber-700 bg-amber-50';
            }

            return (
              <View key={item.category} className="mb-3">
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center">
                    {isOver ? (
                      <AlertCircle size={14} color="#ef4444" className="mr-1" />
                    ) : isNear ? (
                      <AlertCircle size={14} color="#f59e0b" className="mr-1" />
                    ) : (
                      <CheckCircle2 size={14} color="#10b981" className="mr-1" />
                    )}
                    <Text className="text-sm font-semibold text-slate-800 ml-1">
                      {item.category}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-full ${statusBadgeColor}`}>
                    <Text className="text-[10px] font-bold">{statusText}</Text>
                  </View>
                </View>

                {/* Progress bar container */}
                <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${ratio * 100}%`,
                      backgroundColor: progressColor,
                    }}
                  />
                </View>

                {/* Amount details */}
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-[11px] text-slate-400">
                    Spent: {currency} {formatAmount(actualNum)}
                  </Text>
                  <Text className="text-[11px] font-medium text-slate-500">
                    Limit: {currency} {formatAmount(budgetNum)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="py-4 items-center justify-center">
          <Text className="text-xs text-slate-400 mb-2">No category budgets defined yet</Text>
          <TouchableOpacity
            onPress={() => router.push('/budgets')}
            className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
          >
            <Text className="text-xs font-semibold text-emerald-700">+ Create First Budget</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

export default BudgetAlertWidget;
