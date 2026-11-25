import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Target, ChevronRight, Award } from 'lucide-react-native';
import Card from '../common/Card';

interface SavingsGoalItem {
  id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  progress_percentage?: number;
  target_date?: string;
}

interface SavingsGoalCardProps {
  goal?: SavingsGoalItem;
  currency?: string;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  currency = 'Rs.',
}) => {
  const router = useRouter();

  if (!goal) {
    return (
      <Card
        title="Savings Goals"
        subtitle="Track personal financial milestones"
        action={
          <TouchableOpacity
            onPress={() => router.push('/savings-goals')}
            className="flex-row items-center"
          >
            <Text className="text-xs font-semibold text-emerald-600 mr-0.5">Explore</Text>
            <ChevronRight size={14} color="#059669" />
          </TouchableOpacity>
        }
      >
        <View className="py-4 items-center justify-center">
          <Text className="text-xs text-slate-400 mb-2">No active savings goals</Text>
          <TouchableOpacity
            onPress={() => router.push('/savings-goals')}
            className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
          >
            <Text className="text-xs font-semibold text-emerald-700">+ Set New Goal</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  const current = Number(goal.current_amount) || 0;
  const target = Number(goal.target_amount) || 1;
  const progress = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <Card
      title="Savings Goal"
      subtitle="Active target progress"
      action={
        <TouchableOpacity
          onPress={() => router.push('/savings-goals')}
          className="flex-row items-center"
        >
          <Text className="text-xs font-semibold text-emerald-600 mr-0.5">Details</Text>
          <ChevronRight size={14} color="#059669" />
        </TouchableOpacity>
      }
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mr-3 border border-indigo-100">
            <Target size={20} color="#6366f1" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
              {goal.title}
            </Text>
            <Text className="text-xs text-slate-400">
              {remaining > 0 ? `${currency} ${formatAmount(remaining)} left` : 'Goal achieved!'}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <View className="flex-row items-center bg-indigo-50 px-2 py-0.5 rounded-full">
            <Award size={12} color="#6366f1" />
            <Text className="text-[11px] font-bold text-indigo-700 ml-1">{progress}%</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
        <View
          className="h-full bg-indigo-600 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row justify-between text-xs text-slate-400">
        <Text className="text-[11px] text-slate-500 font-medium">
          Saved: {currency} {formatAmount(current)}
        </Text>
        <Text className="text-[11px] text-slate-500 font-medium">
          Target: {currency} {formatAmount(target)}
        </Text>
      </View>
    </Card>
  );
};

export default SavingsGoalCard;
