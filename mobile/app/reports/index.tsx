import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function ReportsScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-4">
        <Text className="text-xl font-bold text-slate-800">Financial Reports</Text>
        <Text className="text-sm text-slate-500">Monthly breakdowns and exportable PDF summaries</Text>
      </View>
    </ScrollView>
  );
}
