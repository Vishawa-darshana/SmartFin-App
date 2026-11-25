import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Sparkles, Bell } from 'lucide-react-native';

import apiClient from '../../services/api';
import GlassBackground from '../../components/common/GlassBackground';
import BalanceHeader from '../../components/dashboard/BalanceHeader';
import QuickActions from '../../components/dashboard/QuickActions';
import DateFilterBar from '../../components/dashboard/DateFilterBar';
import SpendingChartWidget from '../../components/dashboard/SpendingChartWidget';
import CategoryBreakdownWidget from '../../components/dashboard/CategoryBreakdownWidget';
import BudgetAlertWidget from '../../components/dashboard/BudgetAlertWidget';
import UpcomingBillsWidget from '../../components/dashboard/UpcomingBillsWidget';
import SavingsGoalCard from '../../components/dashboard/SavingsGoalCard';
import AiInsightWidget from '../../components/dashboard/AiInsightWidget';
import RecentTransactionsWidget from '../../components/dashboard/RecentTransactionsWidget';

const EMPTY_SUMMARY = {
  total_income: 0,
  total_expenses: 0,
  remaining_balance: 0,
  total_savings: 0,
  currency: 'Rs.',
};

export default function DashboardScreen() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live MongoDB Atlas Dashboard States (No hardcoded sample data)
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<any>(undefined);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [sumRes, chartsRes, recRes, goalsRes, txRes] = await Promise.allSettled([
        apiClient.get('/dashboard/summary', { params: { month, year } }),
        apiClient.get('/dashboard/charts', { params: { month, year } }),
        apiClient.get('/recurring-expenses', { params: { active_only: true } }),
        apiClient.get('/savings-goals'),
        apiClient.get('/transactions', { params: { limit: 5 } }),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value.data) {
        const d = sumRes.value.data;
        setSummary({
          total_income: Number(d.total_income) || 0,
          total_expenses: Number(d.total_expenses) || 0,
          remaining_balance: Number(d.remaining_balance) || 0,
          total_savings: Number(d.total_savings) || 0,
          currency: d.currency || 'Rs.',
        });
      } else if (sumRes.status === 'rejected') {
        setErrorMsg('Cannot reach backend API. Check Wi-Fi & server.');
      }

      if (chartsRes.status === 'fulfilled' && chartsRes.value.data) {
        const c = chartsRes.value.data;
        setTrends(Array.isArray(c.monthly_trends) ? c.monthly_trends : []);
        setCategories(Array.isArray(c.category_distribution) ? c.category_distribution : []);
        setBudgets(Array.isArray(c.budget_vs_actual) ? c.budget_vs_actual : []);
      }

      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value.data)) {
        setUpcomingBills(recRes.value.data);
      }

      if (goalsRes.status === 'fulfilled' && Array.isArray(goalsRes.value.data)) {
        setSavingsGoal(goalsRes.value.data[0]);
      }

      if (txRes.status === 'fulfilled' && Array.isArray(txRes.value.data)) {
        setRecentTx(txRes.value.data);
      }
    } catch {
      setErrorMsg('Cannot reach backend API. Check Wi-Fi & server.');
    } finally {
      setRefreshing(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleMarkBillPaid = (id: string) => {
    Alert.alert(
      'Confirm Payment',
      'Mark this recurring bill as paid and record an expense transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Paid',
          onPress: async () => {
            try {
              await apiClient.post(`/recurring-expenses/${id}/mark-paid`);
              fetchDashboardData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not mark bill as paid.');
            }
          },
        },
      ]
    );
  };

  return (
    <GlassBackground>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Frosted Glass Top App Header */}
        <View
          className="flex-row items-center justify-between px-5 py-3.5"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center mr-2.5 shadow-sm">
              <Sparkles size={16} color="#ffffff" />
            </View>
            <View>
              <Text className="text-lg font-extrabold text-slate-900 tracking-tight">SmartFin AI</Text>
              <Text className="text-[11px] font-semibold text-emerald-600">Personal Finance</Text>
            </View>
          </View>

          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderWidth: 1,
              borderColor: 'rgba(226, 232, 240, 0.9)',
            }}
          >
            <Bell size={16} color="#475569" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
      >
        {errorMsg && (
          <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4">
            <Text className="text-xs font-semibold text-rose-700">{errorMsg}</Text>
          </View>
        )}

        {/* Date Filter Bar */}
        <DateFilterBar
          currentMonth={month}
          currentYear={year}
          onMonthChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />

        {/* Hero Net Balance Header */}
        <BalanceHeader
          balance={summary.remaining_balance}
          income={summary.total_income}
          expenses={summary.total_expenses}
          currency={summary.currency}
        />

        {/* Quick Action Navigation Buttons */}
        <QuickActions />

        {/* SmartFin AI Proactive Insights Widget */}
        <AiInsightWidget />

        {/* Cashflow Bar Chart Widget */}
        <SpendingChartWidget data={trends} currency={summary.currency} />

        {/* Category Breakdown Donut Widget */}
        <CategoryBreakdownWidget
          categories={categories}
          totalExpenses={summary.total_expenses}
          currency={summary.currency}
        />

        {/* Budget Health and Alerts Widget */}
        <BudgetAlertWidget budgets={budgets} currency={summary.currency} />

        {/* Upcoming Recurring Bills Widget */}
        <UpcomingBillsWidget
          bills={upcomingBills}
          currency={summary.currency}
          onMarkPaid={handleMarkBillPaid}
        />

        {/* Savings Goal Tracker Widget */}
        <SavingsGoalCard goal={savingsGoal} currency={summary.currency} />

        {/* Recent Transactions Ledger Widget */}
        <RecentTransactionsWidget transactions={recentTx} currency={summary.currency} />
      </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
}
