import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';

interface DateFilterBarProps {
  currentMonth: number; // 1-12
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
}) => {
  const handlePrev = () => {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    onMonthChange(m, y);
  };

  const handleNext = () => {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    onMonthChange(m, y);
  };

  const now = new Date();
  const isCurrentMonth =
    currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();

  const handleResetToCurrent = () => {
    onMonthChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <View
      className="flex-row items-center justify-between px-3 py-2 rounded-2xl mb-5"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        borderWidth: 1.2,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        onPress={handlePrev}
        className="w-8 h-8 rounded-full bg-white/90 items-center justify-center border border-slate-200/70"
      >
        <ChevronLeft size={18} color="#475569" />
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Calendar size={14} color="#059669" />
        <Text className="text-sm font-bold text-slate-800 ml-1.5">
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </Text>
      </View>

      <View className="flex-row items-center">
        {!isCurrentMonth && (
          <TouchableOpacity
            onPress={handleResetToCurrent}
            className="bg-emerald-50 px-2 py-0.5 rounded-full mr-2 border border-emerald-200"
          >
            <Text className="text-[10px] font-semibold text-emerald-700">Today</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleNext}
          className="w-8 h-8 rounded-full bg-white/90 items-center justify-center border border-slate-200/70"
        >
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DateFilterBar;
