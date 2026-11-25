import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react-native';

interface AiInsightWidgetProps {
  insights?: string[];
}

export const AiInsightWidget: React.FC<AiInsightWidgetProps> = ({ insights = [] }) => {
  const router = useRouter();

  const tipText =
    insights.length > 0
      ? insights[0]
      : 'Ask SmartFin AI to analyze your monthly spending, check budget alerts, or record expenses in plain language.';

  return (
    <View
      style={{
        borderRadius: 26,
        marginBottom: 18,
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: 'rgba(139, 92, 246, 0.25)',
        shadowColor: '#6d28d9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={['rgba(245, 243, 255, 0.90)', 'rgba(238, 242, 255, 0.82)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 18 }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-7 h-7 rounded-full bg-purple-600 items-center justify-center mr-2">
              <Sparkles size={13} color="#ffffff" />
            </View>
            <Text className="text-xs uppercase tracking-wider font-bold text-purple-800">
              SmartFin AI Insights
            </Text>
          </View>

          <View
            className="px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)' }}
          >
            <Text className="text-[10px] font-bold text-purple-700">Live AI</Text>
          </View>
        </View>

        <Text className="text-sm font-medium text-slate-700 leading-relaxed mb-3.5">
          {tipText}
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/assistant')}
          activeOpacity={0.8}
          className="flex-row items-center justify-between py-2.5 px-4 rounded-2xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.25)',
          }}
        >
          <View className="flex-row items-center">
            <Lightbulb size={14} color="#7c3aed" />
            <Text className="text-xs font-bold text-purple-800 ml-2">
              Ask AI for a personalized savings plan
            </Text>
          </View>
          <ArrowRight size={14} color="#7c3aed" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default AiInsightWidget;
