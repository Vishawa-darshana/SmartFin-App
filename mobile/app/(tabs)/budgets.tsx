import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  TrendingDown,
  Pencil,
  Trash2,
} from 'lucide-react-native';

import { budgetService } from '../../services/budget.service';
import DateFilterBar from '../../components/dashboard/DateFilterBar';
import GlassBackground from '../../components/common/GlassBackground';

interface Budget {
  id: string;
  category_name: string;
  monthly_limit: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
}

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Housing',
  'Healthcare',
  'Education',
  'Other',
];

export default function BudgetsScreen() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const fetchBudgets = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await budgetService.getAll({ month, year });
      setBudgets(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load budgets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      fetchBudgets();
    }, [fetchBudgets])
  );

  const openCreateModal = () => {
    setEditingBudget(null);
    setSelectedCategory(CATEGORIES[0]);
    setMonthlyLimit('');
    setIsModalVisible(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setSelectedCategory(b.category_name);
    setMonthlyLimit(String(b.monthly_limit));
    setIsModalVisible(true);
  };

  const handleSaveBudget = async () => {
    const parsedLimit = Number(monthlyLimit);
    if (!monthlyLimit || isNaN(parsedLimit) || parsedLimit <= 0) {
      Alert.alert('Invalid Limit', 'Please specify a valid monthly spending limit.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBudget) {
        await budgetService.update(editingBudget.id, {
          monthly_limit: parsedLimit,
          category_name: selectedCategory,
        });
      } else {
        await budgetService.create({
          category_name: selectedCategory,
          monthly_limit: parsedLimit,
          month,
          year,
        });
      }
      setIsModalVisible(false);
      await fetchBudgets();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = (b: Budget) => {
    Alert.alert('Delete Budget', `Remove the monthly budget for "${b.category_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await budgetService.delete(b.id);
            fetchBudgets();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not delete budget.');
          }
        },
      },
    ]);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent_amount), 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const isOverallExceeded = totalSpent > totalBudget && totalBudget > 0;

  const formatAmount = (num: number) =>
    num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <GlassBackground>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Frosted Glass Top Header */}
        <View
          className="px-5 pt-3 pb-2.5 flex-row items-center justify-between"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <View>
            <Text className="text-xl font-extrabold text-slate-900">Budgets</Text>
            <Text className="text-xs text-slate-500">Monthly category spending limits</Text>
          </View>

          <TouchableOpacity
            onPress={openCreateModal}
            className="flex-row items-center bg-emerald-600 px-3.5 py-2 rounded-xl shadow-sm"
          >
            <Plus size={16} color="#ffffff" />
            <Text className="text-xs font-bold text-white ml-1">New Budget</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchBudgets();
            }}
            colors={['#059669']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <DateFilterBar
          currentMonth={month}
          currentYear={year}
          onMonthChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />

        {errorMsg && (
          <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4">
            <Text className="text-xs font-semibold text-rose-700">{errorMsg}</Text>
          </View>
        )}

        {/* Overall Budget Overview Card */}
        <View className="bg-slate-900 rounded-3xl p-5 mb-5 shadow-lg border border-slate-800">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total Monthly Budget
            </Text>
            <View
              className={`px-2.5 py-0.5 rounded-full ${
                isOverallExceeded ? 'bg-rose-500/20' : 'bg-emerald-500/20'
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  isOverallExceeded ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {overallPercentage}% Utilized
              </Text>
            </View>
          </View>

          <Text className="text-3xl font-extrabold text-white my-1">
            Rs. {formatAmount(totalSpent)}{' '}
            <Text className="text-lg font-normal text-slate-400">
              / Rs. {formatAmount(totalBudget)}
            </Text>
          </Text>

          <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
            <View
              className={`h-full rounded-full ${
                isOverallExceeded
                  ? 'bg-rose-500'
                  : overallPercentage > 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </View>

          <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-800/80">
            <View className="flex-row items-center">
              <TrendingDown size={14} color="#34d399" />
              <Text className="text-xs text-slate-300 ml-1">
                Remaining: Rs. {formatAmount(Math.max(0, totalBudget - totalSpent))}
              </Text>
            </View>
            <Text className="text-xs text-slate-400">{budgets.length} Categories</Text>
          </View>
        </View>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : budgets.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm">
            <Text className="text-base font-bold text-slate-700">No Budgets Set for This Month</Text>
            <Text className="text-xs text-slate-400 text-center mt-1 mb-4">
              Create category limits (like Food or Transport) to track spending automatically.
            </Text>
            <TouchableOpacity
              onPress={openCreateModal}
              className="bg-emerald-600 px-5 py-2.5 rounded-xl"
            >
              <Text className="text-xs font-bold text-white">+ Set First Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgets.map((item) => {
            const limit = Number(item.monthly_limit) || 1;
            const spent = Number(item.spent_amount) || 0;
            const pct = Math.round((spent / limit) * 100);
            const isExceeded = spent > limit;
            const isNear = pct >= 80 && !isExceeded;

            let badgeBg = 'bg-emerald-50 text-emerald-700';
            let barColor = '#10b981';

            if (isExceeded) {
              badgeBg = 'bg-rose-50 text-rose-700';
              barColor = '#ef4444';
            } else if (isNear) {
              badgeBg = 'bg-amber-50 text-amber-700';
              barColor = '#f59e0b';
            }

            return (
              <View
                key={item.id}
                className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    {isExceeded ? (
                      <AlertCircle size={16} color="#ef4444" />
                    ) : isNear ? (
                      <AlertCircle size={16} color="#f59e0b" />
                    ) : (
                      <CheckCircle2 size={16} color="#10b981" />
                    )}
                    <Text className="text-sm font-bold text-slate-800 ml-1.5">
                      {item.category_name}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View className={`px-2 py-0.5 rounded-full mr-2 ${badgeBg.split(' ')[0]}`}>
                      <Text className={`text-[10px] font-bold ${badgeBg.split(' ')[1]}`}>
                        {pct}%
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditModal(item)} className="p-1 mr-1">
                      <Pencil size={13} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteBudget(item)} className="p-1">
                      <Trash2 size={13} color="#e11d48" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden my-1">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-xs text-slate-500 font-medium">
                    Spent: Rs. {formatAmount(spent)}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Limit: Rs. {formatAmount(limit)}
                  </Text>
                </View>

                {isExceeded && (
                  <Text className="text-[11px] font-semibold text-rose-600 mt-1">
                    Over budget by Rs. {formatAmount(spent - limit)}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add / Edit Budget Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 shadow-xl border-t border-slate-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">
                {editingBudget ? 'Edit Category Budget' : 'Set Category Budget'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-xs font-semibold text-slate-500 mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full border mr-2 ${
                      selectedCategory === cat
                        ? 'bg-emerald-50 border-emerald-600'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedCategory === cat ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-5">
              <Text className="text-xs font-semibold text-slate-500 mb-1">
                Monthly Spending Limit (Rs.)
              </Text>
              <TextInput
                placeholder="e.g. 25000"
                keyboardType="numeric"
                value={monthlyLimit}
                onChangeText={setMonthlyLimit}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800"
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveBudget}
              disabled={submitting}
              className="bg-emerald-600 py-3.5 rounded-2xl items-center shadow-md"
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-sm font-bold text-white">
                  {editingBudget ? 'Update Budget' : 'Save Budget'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </GlassBackground>
  );
}
