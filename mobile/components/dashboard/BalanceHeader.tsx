import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck } from 'lucide-react-native';

interface BalanceHeaderProps {
  balance: number;
  income: number;
  expenses: number;
  currency?: string;
}

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  balance,
  income,
  expenses,
  currency = 'Rs.',
}) => {
  const formatAmount = (num: number) =>
    num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;

  return (
    <View
      style={{
        borderRadius: 28,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 255, 255, 0.35)',
        shadowColor: '#065f46',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={['#0f172a', '#134e4a', '#065f46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        {/* Top bar */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Wallet size={16} color="#a7f3d0" />
            <Text className="text-xs uppercase tracking-wider font-semibold text-emerald-100/80 ml-1.5">
              Total Net Balance
            </Text>
          </View>
          <View
            className="flex-row items-center px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.22)',
            }}
          >
            <ShieldCheck size={12} color="#6ee7b7" />
            <Text className="text-[11px] font-semibold text-emerald-200 ml-1">
              Savings Rate {savingsRate}%
            </Text>
          </View>
        </View>

        {/* Main Balance */}
        <Text className="text-3xl font-extrabold text-white tracking-tight my-1">
          {currency} {formatAmount(balance)}
        </Text>

        {/* Translucent Glass Income / Expense Pills */}
        <View
          className="flex-row items-center justify-between mt-4 pt-4"
          style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.14)' }}
        >
          <View
            className="flex-1 flex-row items-center mr-2 p-3 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.18)',
            }}
          >
            <View className="w-8 h-8 rounded-full bg-emerald-400/20 items-center justify-center mr-2.5">
              <ArrowUpRight size={18} color="#6ee7b7" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-emerald-100/75">Total Income</Text>
              <Text className="text-sm font-bold text-emerald-300" numberOfLines={1}>
                +{currency} {formatAmount(income)}
              </Text>
            </View>
          </View>

          <View
            className="flex-1 flex-row items-center ml-2 p-3 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.18)',
            }}
          >
            <View className="w-8 h-8 rounded-full bg-rose-400/20 items-center justify-center mr-2.5">
              <ArrowDownLeft size={18} color="#fda4af" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-emerald-100/75">Total Expenses</Text>
              <Text className="text-sm font-bold text-rose-300" numberOfLines={1}>
                -{currency} {formatAmount(expenses)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default BalanceHeader;
