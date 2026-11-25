import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { requireOptionalNativeModule } from 'expo';

export default function RootLayout() {
  useEffect(() => {
    try {
      const DevMenuPreferences = requireOptionalNativeModule('DevMenuPreferences');
      DevMenuPreferences?.setPreferencesAsync?.({ showFloatingActionButton: false });
    } catch {
      // Ignored if native module is unavailable
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="recurring-expenses/index"
          options={{
            headerShown: true,
            title: 'Recurring Expenses',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="savings-goals/index"
          options={{
            headerShown: true,
            title: 'Savings Goals',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="reports/index"
          options={{
            headerShown: true,
            title: 'Financial Reports',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
