import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Utensils,
  Car,
  ShoppingBag,
  Briefcase,
  Laptop,
  Zap,
  Home,
  HeartPulse,
  Film,
  MoreHorizontal,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react-native';
import Card from '../common/Card';

export interface TransactionItem {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category_name: string;
  description: string;
  date: string;
}

interface RecentTransactionsWidgetProps {
  transactions: TransactionItem[];
  currency?: string;
}

const getCategoryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('grocer') || cat.includes('dine')) return Utensils;
  if (cat.includes('transport') || cat.includes('fuel') || cat.includes('car')) return Car;
  if (cat.includes('shop')) return ShoppingBag;
  if (cat.includes('salary')) return Briefcase;
  if (cat.includes('freelance')) return Laptop;
  if (cat.includes('util') || cat.includes('elect') || cat.includes('water')) return Zap;
  if (cat.includes('rent') || cat.includes('house')) return Home;
  if (cat.includes('health') || cat.includes('med')) return HeartPulse;
  if (cat.includes('ent') || cat.includes('movie')) return Film;
  return MoreHorizontal;
};

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  currency = 'Rs.',
}) => {
  const router = useRouter();

  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card
      title="Recent Transactions"
      subtitle="Latest spending and earnings"
      action={
        <TouchableOpacity
          onPress={() => router.push('/transactions')}
          className="flex-row items-center"
        >
          <Text className="text-xs font-semibold text-emerald-600 mr-0.5">View all</Text>
          <ChevronRight size={14} color="#059669" />
        </TouchableOpacity>
      }
    >
      {transactions.length > 0 ? (
        <View className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map((tx) => {
            const Icon = getCategoryIcon(tx.category_name);
            const isIncome = tx.type === 'INCOME';

            return (
              <View key={tx.id} className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 border ${
                      isIncome
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <Icon size={18} color={isIncome ? '#059669' : '#475569'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                      {tx.category_name} • {tx.date}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text
                    className={`text-sm font-extrabold ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {currency} {formatAmount(Number(tx.amount))}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="py-6 items-center justify-center">
          <Text className="text-xs text-slate-400 mb-2">No transactions recorded yet</Text>
          <TouchableOpacity
            onPress={() => router.push('/transactions')}
            className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
          >
            <Text className="text-xs font-semibold text-emerald-700">+ Add First Transaction</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

export default RecentTransactionsWidget;
