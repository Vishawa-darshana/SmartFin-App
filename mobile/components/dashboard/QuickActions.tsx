import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { PlusCircle, MinusCircle, PieChart, Sparkles } from 'lucide-react-native';

interface QuickActionsProps {
  onAddTransaction?: (type: 'EXPENSE' | 'INCOME') => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAddTransaction }) => {
  const router = useRouter();

  const actions = [
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: MinusCircle,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      iconColor: '#e11d48',
      onPress: () => {
        if (onAddTransaction) onAddTransaction('EXPENSE');
        else router.push('/transactions');
      },
    },
    {
      id: 'add-income',
      label: 'Add Income',
      icon: PlusCircle,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      iconColor: '#059669',
      onPress: () => {
        if (onAddTransaction) onAddTransaction('INCOME');
        else router.push('/transactions');
      },
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: PieChart,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: '#2563eb',
      onPress: () => router.push('/budgets'),
    },
    {
      id: 'assistant',
      label: 'SmartFin AI',
      icon: Sparkles,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: '#7c3aed',
      onPress: () => router.push('/assistant'),
    },
  ];

  return (
    <View className="flex-row items-center justify-between mb-5">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <TouchableOpacity
            key={act.id}
            onPress={act.onPress}
            activeOpacity={0.7}
            className="items-center flex-1 mx-1"
          >
            <View
              className={`w-12 h-12 rounded-2xl ${act.bgColor} items-center justify-center mb-1.5 shadow-sm border border-slate-100`}
            >
              <Icon size={22} color={act.iconColor} />
            </View>
            <Text className={`text-[11px] font-semibold text-center ${act.textColor}`}>
              {act.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default QuickActions;
