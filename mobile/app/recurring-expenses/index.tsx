import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
  Trash2,
  Power,
  X,
} from 'lucide-react-native';

import { recurringExpenseService } from '../../services/recurring-expense.service';

type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

interface RecurringExpenseItem {
  id: string;
  name: string;
  amount: number;
  category_name: string;
  frequency: FrequencyType;
  start_date: string;
  next_payment_date: string;
  end_date?: string | null;
  payment_status: string;
  is_active: boolean;
  is_overdue?: boolean;
  notes?: string | null;
}

const FREQUENCIES: FrequencyType[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const RECURRING_CATEGORIES = [
  'Housing',
  'Utilities',
  'Food',
  'Transport',
  'Healthcare',
  'Education',
  'Entertainment',
  'Shopping',
  'Other',
];

const monthlyEquivalent = (amount: number, frequency: FrequencyType): number => {
  switch (frequency) {
    case 'DAILY':
      return amount * 30;
    case 'WEEKLY':
      return amount * 4.33;
    case 'MONTHLY':
      return amount;
    case 'QUARTERLY':
      return amount / 3;
    case 'YEARLY':
      return amount / 12;
    default:
      return amount;
  }
};

export default function RecurringExpensesScreen() {
  const [items, setItems] = useState<RecurringExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal & Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringExpenseItem | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [frequency, setFrequency] = useState<FrequencyType>('MONTHLY');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await recurringExpenseService.getAll();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load recurring expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setAmount('');
    setCategory('Utilities');
    setFrequency('MONTHLY');
    setNextDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (item: RecurringExpenseItem) => {
    setEditingItem(item);
    setName(item.name);
    setAmount(String(item.amount));
    setCategory(item.category_name);
    setFrequency(item.frequency);
    setNextDate(item.next_payment_date);
    setNotes(item.notes || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a bill or subscription name.');
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate.trim())) {
      Alert.alert('Validation Error', 'Date must be in YYYY-MM-DD format.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await recurringExpenseService.update(editingItem.id, {
          name: name.trim(),
          amount: parsedAmount,
          category_name: category,
          frequency,
          next_payment_date: nextDate.trim(),
        });
      } else {
        await recurringExpenseService.create({
          name: name.trim(),
          amount: parsedAmount,
          category_name: category,
          frequency,
          start_date: nextDate.trim(),
          next_payment_date: nextDate.trim(),
          is_active: true,
        });
      }
      setModalVisible(false);
      await fetchItems();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save recurring expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = (item: RecurringExpenseItem) => {
    Alert.alert(
      'Confirm Payment',
      `Mark "${item.name}" (Rs. ${Number(item.amount).toLocaleString()}) as paid?\n\nThis will record an actual expense transaction and advance the next due date.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Paid',
          onPress: async () => {
            try {
              await recurringExpenseService.markPaid(item.id);
              Alert.alert('Payment Recorded', `"${item.name}" marked as paid and added to Transactions.`);
              fetchItems();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to mark payment as paid.');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (item: RecurringExpenseItem) => {
    try {
      await recurringExpenseService.update(item.id, { is_active: !item.is_active });
      fetchItems();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    }
  };

  const handleDelete = (item: RecurringExpenseItem) => {
    Alert.alert(
      'Delete Recurring Expense',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recurringExpenseService.delete(item.id);
              fetchItems();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete recurring expense.');
            }
          },
        },
      ]
    );
  };

  const activeItems = items.filter((i) => i.is_active);
  const expectedMonthlyTotal = activeItems.reduce(
    (sum, i) => sum + monthlyEquivalent(Number(i.amount), i.frequency),
    0
  );
  const overdueCount = activeItems.filter((i) => i.is_overdue).length;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchItems();
            }}
            colors={['#059669']}
          />
        }
      >
        {/* Summary Hero Card */}
        <View className="bg-slate-900 rounded-3xl p-5 mb-5 shadow-lg border border-slate-800">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Expected Monthly Recurring
            </Text>
            {overdueCount > 0 && (
              <View className="bg-rose-500/20 px-2.5 py-0.5 rounded-full">
                <Text className="text-[11px] font-bold text-rose-400">
                  {overdueCount} Overdue
                </Text>
              </View>
            )}
          </View>
          <Text className="text-3xl font-extrabold text-white my-1">
            Rs. {expectedMonthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-800">
            <Text className="text-xs text-slate-400">
              {activeItems.length} Active • {items.length - activeItems.length} Inactive
            </Text>
            <TouchableOpacity
              onPress={openCreateModal}
              className="flex-row items-center bg-emerald-600 px-3.5 py-1.5 rounded-xl"
            >
              <Plus size={14} color="#ffffff" />
              <Text className="text-xs font-bold text-white ml-1">Add Bill</Text>
            </TouchableOpacity>
          </View>
        </View>

        {errorMsg && (
          <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4">
            <Text className="text-xs font-semibold text-rose-700">{errorMsg}</Text>
          </View>
        )}

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : items.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm">
            <RefreshCw size={32} color="#94a3b8" />
            <Text className="text-base font-bold text-slate-700 mt-3">No Recurring Bills Yet</Text>
            <Text className="text-xs text-slate-400 text-center mt-1 mb-4">
              Add rent, electricity, internet, or subscriptions to track upcoming due dates.
            </Text>
            <TouchableOpacity
              onPress={openCreateModal}
              className="bg-emerald-600 px-5 py-2.5 rounded-xl"
            >
              <Text className="text-xs font-bold text-white">+ Add First Recurring Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              className={`bg-white rounded-2xl p-4 mb-3 border shadow-sm ${
                !item.is_active
                  ? 'border-slate-200 opacity-60'
                  : item.is_overdue
                  ? 'border-rose-200'
                  : 'border-slate-100'
              }`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center">
                    <Text className="text-base font-bold text-slate-900">{item.name}</Text>
                    {!item.is_active ? (
                      <View className="ml-2 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-slate-500">Inactive</Text>
                      </View>
                    ) : item.is_overdue ? (
                      <View className="ml-2 bg-rose-50 px-2 py-0.5 rounded-full flex-row items-center">
                        <AlertCircle size={10} color="#e11d48" />
                        <Text className="text-[10px] font-bold text-rose-700 ml-1">Overdue</Text>
                      </View>
                    ) : (
                      <View className="ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-emerald-700">Upcoming</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    {item.category_name} • {item.frequency}
                  </Text>
                  <View className="flex-row items-center mt-1.5">
                    <Clock size={12} color="#64748b" />
                    <Text className="text-xs text-slate-500 ml-1">
                      Next due: <Text className="font-semibold text-slate-700">{item.next_payment_date}</Text>
                    </Text>
                  </View>
                </View>

                <Text className="text-base font-extrabold text-slate-900">
                  Rs. {Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Action Row */}
              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    className="p-2 rounded-lg bg-slate-50 mr-2"
                  >
                    <Pencil size={14} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleToggleActive(item)}
                    className="p-2 rounded-lg bg-slate-50 mr-2"
                  >
                    <Power size={14} color={item.is_active ? '#f59e0b' : '#10b981'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    className="p-2 rounded-lg bg-rose-50"
                  >
                    <Trash2 size={14} color="#e11d48" />
                  </TouchableOpacity>
                </View>

                {item.is_active && (
                  <TouchableOpacity
                    onPress={() => handleMarkPaid(item)}
                    className="flex-row items-center bg-emerald-600 px-3.5 py-2 rounded-xl"
                  >
                    <CheckCircle2 size={14} color="#ffffff" />
                    <Text className="text-xs font-bold text-white ml-1.5">Mark as Paid</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Recurring Expense' : 'New Recurring Expense'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <Text className="text-xs font-semibold text-slate-500 mb-1">Bill / Subscription Name</Text>
              <TextInput
                placeholder="e.g. Apartment Rent, Electricity, Fiber Internet"
                value={name}
                onChangeText={setName}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
              />
            </View>

            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-semibold text-slate-500 mb-1">Amount (Rs.)</Text>
                <TextInput
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-xs font-semibold text-slate-500 mb-1">Next Due (YYYY-MM-DD)</Text>
                <TextInput
                  placeholder="2026-12-01"
                  value={nextDate}
                  onChangeText={setNextDate}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                />
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-xs font-semibold text-slate-500 mb-1.5">Frequency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    onPress={() => setFrequency(freq)}
                    className={`px-3 py-1.5 rounded-full border mr-2 ${
                      frequency === freq
                        ? 'bg-slate-900 border-slate-900'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        frequency === freq ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-5">
              <Text className="text-xs font-semibold text-slate-500 mb-1.5">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {RECURRING_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full border mr-2 ${
                      category === cat
                        ? 'bg-emerald-50 border-emerald-600'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        category === cat ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={submitting}
              className="bg-emerald-600 py-3.5 rounded-2xl items-center shadow-md"
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-sm font-bold text-white">
                  {editingItem ? 'Update Recurring Expense' : 'Save Recurring Expense'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
