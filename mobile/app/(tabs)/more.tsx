import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, Target, FileText, ChevronRight } from 'lucide-react-native';
import GlassBackground from '../../components/common/GlassBackground';

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Recurring Expenses',
      subtitle: 'Manage subscriptions & regular bills',
      icon: RefreshCw,
      route: '/recurring-expenses',
    },
    {
      title: 'Savings Goals',
      subtitle: 'Track your personal financial targets',
      icon: Target,
      route: '/savings-goals',
    },
    {
      title: 'Financial Reports',
      subtitle: 'Monthly summaries & PDF export',
      icon: FileText,
      route: '/reports',
    },
  ];

  return (
    <GlassBackground>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
          <View className="mb-6">
            <Text className="text-2xl font-extrabold text-slate-900">More</Text>
            <Text className="text-sm text-slate-500">Additional financial tools and options</Text>
          </View>

          <View
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.78)',
              borderWidth: 1.2,
              borderColor: 'rgba(255, 255, 255, 0.95)',
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.05,
              shadowRadius: 14,
              elevation: 3,
            }}
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.title}
                  onPress={() => router.push(item.route as any)}
                  className={`flex-row items-center p-4 ${
                    index !== menuItems.length - 1 ? 'border-b border-slate-100/80' : ''
                  }`}
                >
                  <View className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 items-center justify-center mr-4">
                    <Icon size={20} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-800">{item.title}</Text>
                    <Text className="text-xs text-slate-500">{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
}
