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
  Target,
  Plus,
  Award,
  Calendar,
  Pencil,
  Trash2,
  PiggyBank,
  X,
} from 'lucide-react-native';

import { savingsService } from '../../services/savings.service';

interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  notes?: string;
}

interface SavingsGoalItem {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  required_monthly_savings?: number | null;
  target_date?: string | null;
  is_completed: boolean;
  notes?: string | null;
  contributions?: Contribution[];
}

export default function SavingsGoalsScreen() {
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create/Edit Goal Modal
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoalItem | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');

  // Contribution Modal
  const [contribGoal, setContribGoal] = useState<SavingsGoalItem | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribNotes, setContribNotes] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await savingsService.getAll();
      setGoals(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load savings goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setInitialAmount('0');
    setTargetDate('');
    setGoalModalVisible(true);
  };

  const openEditModal = (goal: SavingsGoalItem) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(String(goal.target_amount));
    setInitialAmount(String(goal.current_amount));
    setTargetDate(goal.target_date || '');
    setGoalModalVisible(true);
  };

  const handleSaveGoal = async () => {
    const parsedTarget = Number(targetAmount);
    const parsedCurrent = Number(initialAmount || 0);
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a goal title.');
      return;
    }
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target amount.');
      return;
    }
    if (targetDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())) {
      Alert.alert('Validation Error', 'Target date must be in YYYY-MM-DD format.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingGoal) {
        await savingsService.update(editingGoal.id, {
          title: title.trim(),
          target_amount: parsedTarget,
          target_date: targetDate.trim() || undefined,
        });
      } else {
        await savingsService.create({
          title: title.trim(),
          target_amount: parsedTarget,
          current_amount: isNaN(parsedCurrent) ? 0 : parsedCurrent,
          target_date: targetDate.trim() || undefined,
        });
      }
      setGoalModalVisible(false);
      await fetchGoals();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save savings goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddContribution = async () => {
    if (!contribGoal) return;
    const amt = Number(contribAmount);
    if (!contribAmount || isNaN(amt) || amt <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid contribution amount.');
      return;
    }

    setSubmitting(true);
    try {
      await savingsService.addContribution(contribGoal.id, amt, contribNotes.trim() || undefined);
      setContribGoal(null);
      setContribAmount('');
      setContribNotes('');
      await fetchGoals();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = (goal: SavingsGoalItem) => {
    Alert.alert('Delete Goal', `Delete "${goal.title}" and all its contribution records?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await savingsService.delete(goal.id);
            fetchGoals();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete savings goal.');
          }
        },
      },
    ]);
  };

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchGoals();
            }}
            colors={['#059669']}
          />
        }
      >
        {/* Summary Hero Card */}
        <View className="bg-slate-900 rounded-3xl p-5 mb-5 shadow-lg border border-slate-800">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total Goal Savings
            </Text>
            <View className="bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
              <Text className="text-[11px] font-bold text-indigo-300">{overallPct}% Overall</Text>
            </View>
          </View>
          <Text className="text-3xl font-extrabold text-white my-1">
            Rs. {totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text className="text-xs text-slate-400">
            Target Total: Rs. {totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>

          <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
            <View className="h-full bg-indigo-400 rounded-full" style={{ width: `${overallPct}%` }} />
          </View>

          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-800">
            <Text className="text-xs text-slate-400">{goals.length} Active Goals</Text>
            <TouchableOpacity
              onPress={openCreateModal}
              className="flex-row items-center bg-emerald-600 px-3.5 py-1.5 rounded-xl"
            >
              <Plus size={14} color="#ffffff" />
              <Text className="text-xs font-bold text-white ml-1">New Goal</Text>
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
        ) : goals.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-slate-100 shadow-sm">
            <Target size={32} color="#94a3b8" />
            <Text className="text-base font-bold text-slate-700 mt-3">No Savings Goals Yet</Text>
            <Text className="text-xs text-slate-400 text-center mt-1 mb-4">
              Create goals like Emergency Fund or Buy a Laptop and log actual contributions.
            </Text>
            <TouchableOpacity
              onPress={openCreateModal}
              className="bg-emerald-600 px-5 py-2.5 rounded-xl"
            >
              <Text className="text-xs font-bold text-white">+ Create First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => {
            const pct = Math.min(100, Math.round(goal.progress_percentage || 0));
            return (
              <View
                key={goal.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mr-3">
                      <Target size={18} color="#6366f1" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-slate-900">{goal.title}</Text>
                      {goal.target_date && (
                        <View className="flex-row items-center mt-0.5">
                          <Calendar size={11} color="#94a3b8" />
                          <Text className="text-xs text-slate-400 ml-1">
                            Target: {goal.target_date}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center bg-indigo-50 px-2.5 py-1 rounded-full">
                    <Award size={12} color="#6366f1" />
                    <Text className="text-xs font-bold text-indigo-700 ml-1">{pct}%</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden my-2">
                  <View
                    className={`h-full rounded-full ${
                      goal.is_completed ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </View>

                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-xs font-semibold text-slate-700">
                    Saved: Rs. {Number(goal.current_amount).toLocaleString()}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Target: Rs. {Number(goal.target_amount).toLocaleString()}
                  </Text>
                </View>

                {goal.required_monthly_savings != null && !goal.is_completed && (
                  <Text className="text-[11px] font-medium text-indigo-600 mt-1.5">
                    Required monthly savings: Rs. {Number(goal.required_monthly_savings).toLocaleString()}/month
                  </Text>
                )}

                {/* Actions */}
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => openEditModal(goal)}
                      className="p-2 rounded-lg bg-slate-50 mr-2"
                    >
                      <Pencil size={14} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteGoal(goal)}
                      className="p-2 rounded-lg bg-rose-50"
                    >
                      <Trash2 size={14} color="#e11d48" />
                    </TouchableOpacity>
                  </View>

                  {!goal.is_completed ? (
                    <TouchableOpacity
                      onPress={() => {
                        setContribGoal(goal);
                        setContribAmount('');
                        setContribNotes('');
                      }}
                      className="flex-row items-center bg-indigo-600 px-3.5 py-2 rounded-xl"
                    >
                      <PiggyBank size={14} color="#ffffff" />
                      <Text className="text-xs font-bold text-white ml-1.5">+ Contribute</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="bg-emerald-50 px-3 py-1.5 rounded-xl">
                      <Text className="text-xs font-bold text-emerald-700">Goal Reached!</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create / Edit Goal Modal */}
      <Modal visible={goalModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">
                {editingGoal ? 'Edit Savings Goal' : 'New Savings Goal'}
              </Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <Text className="text-xs font-semibold text-slate-500 mb-1">Goal Title</Text>
              <TextInput
                placeholder="e.g. Buy a Laptop, Emergency Fund"
                value={title}
                onChangeText={setTitle}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
              />
            </View>

            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-xs font-semibold text-slate-500 mb-1">Target Amount (Rs.)</Text>
                <TextInput
                  placeholder="150000"
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800"
                />
              </View>
              {!editingGoal && (
                <View className="flex-1 ml-2">
                  <Text className="text-xs font-semibold text-slate-500 mb-1">Starting Saved (Rs.)</Text>
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={initialAmount}
                    onChangeText={setInitialAmount}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                  />
                </View>
              )}
            </View>

            <View className="mb-5">
              <Text className="text-xs font-semibold text-slate-500 mb-1">
                Target Date (Optional, YYYY-MM-DD)
              </Text>
              <TextInput
                placeholder="2027-06-30"
                value={targetDate}
                onChangeText={setTargetDate}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveGoal}
              disabled={submitting}
              className="bg-emerald-600 py-3.5 rounded-2xl items-center shadow-md"
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-sm font-bold text-white">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Contribution Modal */}
      <Modal visible={!!contribGoal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-900">
                Contribute to {contribGoal?.title}
              </Text>
              <TouchableOpacity onPress={() => setContribGoal(null)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <Text className="text-xs font-semibold text-slate-500 mb-1">Contribution Amount (Rs.)</Text>
              <TextInput
                placeholder="10000"
                keyboardType="numeric"
                value={contribAmount}
                onChangeText={setContribAmount}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800"
              />
            </View>

            <View className="mb-5">
              <Text className="text-xs font-semibold text-slate-500 mb-1">Notes (Optional)</Text>
              <TextInput
                placeholder="e.g. November salary savings"
                value={contribNotes}
                onChangeText={setContribNotes}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
              />
            </View>

            <TouchableOpacity
              onPress={handleAddContribution}
              disabled={submitting}
              className="bg-indigo-600 py-3.5 rounded-2xl items-center shadow-md"
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-sm font-bold text-white">Record Contribution</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
