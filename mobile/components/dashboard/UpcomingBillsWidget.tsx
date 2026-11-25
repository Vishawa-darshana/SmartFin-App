import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { RefreshCw, CheckCircle2, ChevronRight, Clock } from 'lucide-react-native';
import Card from '../common/Card';

interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  category_name: string;
  next_payment_date: string;
  frequency: string;
  is_overdue?: boolean;
}

interface UpcomingBillsWidgetProps {
  bills: RecurringItem[];
  currency?: string;
  onMarkPaid?: (id: string) => void;
}

export const UpcomingBillsWidget: React.FC<UpcomingBillsWidgetProps> = ({
  bills,
  currency = 'Rs.',
  onMarkPaid,
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
      title="Upcoming Bills"
      subtitle="Scheduled recurring obligations"
      action={
        <TouchableOpacity
          onPress={() => router.push('/recurring-expenses')}
          className="flex-row items-center"
        >
          <Text className="text-xs font-semibold text-emerald-600 mr-0.5">View all</Text>
          <ChevronRight size={14} color="#059669" />
        </TouchableOpacity>
      }
    >
      {bills.length > 0 ? (
        <View className="divide-y divide-slate-100">
          {bills.slice(0, 3).map((bill) => (
            <View key={bill.id} className="flex-row items-center justify-between py-2.5">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3">
                  <RefreshCw size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-800" numberOfLines={1}>
                    {bill.name}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Clock size={11} color="#94a3b8" />
                    <Text className="text-[11px] text-slate-400 ml-1">
                      Due: {bill.next_payment_date} ({bill.frequency.toLowerCase()})
                    </Text>
                  </View>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-sm font-bold text-slate-900">
                  {currency} {formatAmount(Number(bill.amount))}
                </Text>
                {onMarkPaid && (
                  <TouchableOpacity
                    onPress={() => onMarkPaid(bill.id)}
                    className="flex-row items-center mt-1 bg-emerald-50 px-2 py-0.5 rounded-md"
                  >
                    <CheckCircle2 size={11} color="#059669" className="mr-1" />
                    <Text className="text-[10px] font-semibold text-emerald-700 ml-0.5">
                      Pay
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="py-4 items-center justify-center">
          <Text className="text-xs text-slate-400 mb-2">No upcoming recurring bills</Text>
          <TouchableOpacity
            onPress={() => router.push('/recurring-expenses')}
            className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
          >
            <Text className="text-xs font-semibold text-emerald-700">+ Add Recurring Bill</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

export default UpcomingBillsWidget;
