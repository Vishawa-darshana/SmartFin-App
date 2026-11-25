import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Sparkles,
  Menu,
} from 'lucide-react-native';

interface CircleIconProps {
  focused: boolean;
  children: React.ReactNode;
}

const CircleTabIcon: React.FC<CircleIconProps> = ({ focused, children }) => (
  <View
    style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? '#059669' : 'rgba(255, 255, 255, 0.72)',
      borderWidth: 1,
      borderColor: focused ? 'rgba(255, 255, 255, 0.5)' : 'rgba(226, 232, 240, 0.9)',
      shadowColor: focused ? '#059669' : '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: focused ? 0.3 : 0.05,
      shadowRadius: 6,
      elevation: focused ? 5 : 1,
    }}
  >
    {children}
  </View>
);

const CenterAiCircleIcon: React.FC<{ focused: boolean }> = ({ focused }) => (
  <View
    style={{
      width: 54,
      height: 54,
      borderRadius: 27,
      marginBottom: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? '#7c3aed' : '#0f172a',
      borderWidth: 3.5,
      borderColor: 'rgba(255, 255, 255, 0.95)',
      shadowColor: focused ? '#7c3aed' : '#0f172a',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 10,
      elevation: 8,
    }}
  >
    <Sparkles size={22} color="#ffffff" />
  </View>
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#475569',
        tabBarBackground: () => (
          <View style={styles.glassBarContainer}>
            <BlurView
              intensity={75}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.glassTintOverlay} />
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: bottomOffset,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 6,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderRadius: 32,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon focused={focused}>
              <LayoutDashboard size={19} color={focused ? '#ffffff' : '#475569'} />
            </CircleTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon focused={focused}>
              <ArrowLeftRight size={19} color={focused ? '#ffffff' : '#475569'} />
            </CircleTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'SmartFin AI',
          tabBarActiveTintColor: '#7c3aed',
          tabBarIcon: ({ focused }) => <CenterAiCircleIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon focused={focused}>
              <PieChart size={19} color={focused ? '#ffffff' : '#475569'} />
            </CircleTabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <CircleTabIcon focused={focused}>
              <Menu size={19} color={focused ? '#ffffff' : '#475569'} />
            </CircleTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glassBarContainer: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  glassTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
  },
});
