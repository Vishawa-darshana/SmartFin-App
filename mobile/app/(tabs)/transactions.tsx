import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  Search,
  Plus,
  Utensils,
  Car,
  ShoppingBag,
  Briefcase,
  Zap,
  Home,
  Laptop,
  MoreHorizontal,
  X,
  Pencil,
  Trash2,
} from 'lucide-react-native';

import { transactionService } from '../../services/transaction.service';
import { categoryService } from '../../services/category.service';
import GlassBackground from '../../components/common/GlassBackground';

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category_name: string;
  description: string;
  date: string;
  payment_method?: string;
  notes?: string;
}

const FALLBACK_CATEGORY_NAMES = [
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Healthcare',
  'Entertainment',
  'Housing',
  'Utilities',
  'Salary',
  'Freelance Income',
  'Other',
];

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Online'];

const getCategoryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('grocer') || cat.includes('dine')) return Utensils;
  if (cat.includes('transport') || cat.includes('fuel') || cat.includes('car')) return Car;
  if (cat.includes('shop')) return ShoppingBag;
  if (cat.includes('salary')) return Briefcase;
  if (cat.includes('freelance')) return Laptop;
  if (cat.includes('util') || cat.includes('elect') || cat.includes('water')) return Zap;
  if (cat.includes('rent') || cat.includes('house') || cat.includes('housing')) return Home;
  return MoreHorizontal;
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORY_NAMES);
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal & Form State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [category, setCategory] = useState('Food');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [txRes, catRes] = await Promise.allSettled([
        transactionService.getAll(),
        categoryService.getAll(),
      ]);

      if (txRes.status === 'fulfilled' && Array.isArray(txRes.value.data)) {
        setTransactions(txRes.value.data);
      } else if (txRes.status === 'rejected') {
        setErrorMsg(txRes.reason?.message || 'Failed to load transactions');
      }

      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data) && catRes.value.data.length > 0) {
        setCategories(catRes.value.data.map((c) => c.name));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const openCreateModal = () => {
    setEditingTx(null);
    setAmount('');
    setType('EXPENSE');
    setCategory(categories[0] || 'Food');
    setDescription('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Cash');
    setNotes('');
    setShowCustomCategory(false);
    setCustomCategoryInput('');
    setIsModalVisible(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setAmount(String(tx.amount));
    setType(tx.type);
    setCategory(tx.category_name);
    setDescription(tx.description);
    setTxDate(tx.date);
    setPaymentMethod(tx.payment_method || 'Cash');
    setNotes(tx.notes || '');
    setShowCustomCategory(false);
    setCustomCategoryInput('');
    setIsModalVisible(true);
  };

  const handleAddCustomCategory = async () => {
    const clean = customCategoryInput.trim();
    if (!clean) return;
    try {
      await categoryService.create({ name: clean, type });
      setCategories((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      setCategory(clean);
      setCustomCategoryInput('');
      setShowCustomCategory(false);
    } catch (err: any) {
      Alert.alert('Category Error', err.message || 'Could not add custom category');
    }
  };

  const handleSaveTransaction = async () => {
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive monetary amount.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please provide a brief description.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(txDate.trim())) {
      Alert.alert('Invalid Date', 'Date must be in YYYY-MM-DD format.');
      return;
    }

    const payload = {
      amount: parsedAmount,
      type,
      category_name: category,
      description: description.trim(),
      date: txDate.trim(),
      payment_method: paymentMethod,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (editingTx) {
        await transactionService.update(editingTx.id, payload);
      } else {
        await transactionService.create(payload);
      }
      setIsModalVisible(false);
      await fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Delete "${tx.description}" (Rs. ${Number(tx.amount).toLocaleString()})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.delete(tx.id);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete transaction.');
            }
          },
        },
      ]
    );
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalFilteredExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

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
            <Text className="text-xl font-extrabold text-slate-900">Transactions</Text>
            <Text className="text-xs text-slate-500">Live MongoDB ledger records</Text>
          </View>

          <TouchableOpacity
            onPress={openCreateModal}
            className="flex-row items-center bg-emerald-600 px-3.5 py-2 rounded-xl shadow-sm"
          >
            <Plus size={16} color="#ffffff" />
            <Text className="text-xs font-bold text-white ml-1">Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            colors={['#059669']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {errorMsg && (
          <View className="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-3">
            <Text className="text-xs font-semibold text-rose-700">{errorMsg}</Text>
          </View>
        )}

        {/* Search Bar */}
        <View className="flex-row items-center bg-white px-3 py-2.5 rounded-2xl border border-slate-200 shadow-sm mb-3">
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search transactions or categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-sm text-slate-800"
            placeholderTextColor="#94a3b8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Type Pills */}
        <View className="flex-row items-center mb-4">
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map((t) => {
            const active = filterType === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setFilterType(t)}
                className={`px-4 py-2 rounded-full border mr-2 ${
                  active ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-600'}`}>
                  {t === 'ALL' ? 'All' : t === 'EXPENSE' ? 'Expenses' : 'Income'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary Card */}
        <View className="flex-row justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
          <View>
            <Text className="text-[11px] font-semibold text-slate-400 uppercase">Outflow</Text>
            <Text className="text-base font-extrabold text-rose-600">
              -Rs. {totalFilteredExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[11px] font-semibold text-slate-400 uppercase">Inflow</Text>
            <Text className="text-base font-extrabold text-emerald-600">
              +Rs. {totalFilteredIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Transaction List */}
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm divide-y divide-slate-100">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const Icon = getCategoryIcon(tx.category_name);
                const isIncome = tx.type === 'INCOME';

                return (
                  <View key={tx.id} className="py-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 border ${
                            isIncome
                              ? 'bg-emerald-50 border-emerald-100'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <Icon size={18} color={isIncome ? '#059669' : '#475569'} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
                            {tx.description}
                          </Text>
                          <Text className="text-xs text-slate-400 mt-0.5">
                            {tx.category_name} • {tx.date}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end">
                        <Text
                          className={`text-sm font-extrabold ${
                            isIncome ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'}Rs.{' '}
                          {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <TouchableOpacity
                            onPress={() => openEditModal(tx)}
                            className="p-1 mr-2"
                          >
                            <Pencil size={13} color="#64748b" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteTransaction(tx)}
                            className="p-1"
                          >
                            <Trash2 size={13} color="#e11d48" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="py-10 items-center justify-center">
                <Text className="text-sm text-slate-500 font-semibold">No transactions yet</Text>
                <Text className="text-xs text-slate-400 mt-1 mb-4 text-center">
                  Tap "+ Add" to record your first income or expense into MongoDB Atlas.
                </Text>
                <TouchableOpacity
                  onPress={openCreateModal}
                  className="bg-emerald-600 px-4 py-2 rounded-xl"
                >
                  <Text className="text-xs font-bold text-white">+ Add Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Transaction Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="bg-white rounded-t-3xl p-6 shadow-xl border-t border-slate-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-slate-900">
                  {editingTx ? 'Edit Transaction' : 'Record Transaction'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Type selector */}
              <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-4">
                <TouchableOpacity
                  onPress={() => setType('EXPENSE')}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    type === 'EXPENSE' ? 'bg-rose-500 shadow-sm' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      type === 'EXPENSE' ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setType('INCOME')}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    type === 'INCOME' ? 'bg-emerald-600 shadow-sm' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      type === 'INCOME' ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount & Date */}
              <View className="flex-row mb-3">
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-semibold text-slate-500 mb-1">Amount (Rs.)</Text>
                  <TextInput
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base font-bold text-slate-800"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-xs font-semibold text-slate-500 mb-1">Date (YYYY-MM-DD)</Text>
                  <TextInput
                    placeholder="2026-11-25"
                    value={txDate}
                    onChangeText={setTxDate}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-3">
                <Text className="text-xs font-semibold text-slate-500 mb-1">Description</Text>
                <TextInput
                  placeholder="e.g. Supermarket grocery shopping"
                  value={description}
                  onChangeText={setDescription}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                />
              </View>

              {/* Category selection + Custom Category */}
              <View className="mb-3">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-xs font-semibold text-slate-500">Category</Text>
                  <TouchableOpacity onPress={() => setShowCustomCategory((v) => !v)}>
                    <Text className="text-xs font-bold text-emerald-600">
                      {showCustomCategory ? 'Close' : '+ Custom'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showCustomCategory && (
                  <View className="flex-row items-center mb-2">
                    <TextInput
                      placeholder="New category name..."
                      value={customCategoryInput}
                      onChangeText={setCustomCategoryInput}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 mr-2"
                    />
                    <TouchableOpacity
                      onPress={handleAddCustomCategory}
                      className="bg-slate-900 px-3 py-2 rounded-xl"
                    >
                      <Text className="text-xs font-bold text-white">Add</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
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

              {/* Payment Method */}
              <View className="mb-4">
                <Text className="text-xs font-semibold text-slate-500 mb-1.5">Payment Method</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PAYMENT_METHODS.map((pm) => (
                    <TouchableOpacity
                      key={pm}
                      onPress={() => setPaymentMethod(pm)}
                      className={`px-3 py-1.5 rounded-full border mr-2 ${
                        paymentMethod === pm
                          ? 'bg-slate-900 border-slate-900'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          paymentMethod === pm ? 'text-white' : 'text-slate-600'
                        }`}
                      >
                        {pm}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSaveTransaction}
                disabled={submitting}
                className="bg-emerald-600 py-3.5 rounded-2xl items-center shadow-md"
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white">
                    {editingTx ? 'Update Transaction' : 'Save Transaction'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      </SafeAreaView>
    </GlassBackground>
  );
}
