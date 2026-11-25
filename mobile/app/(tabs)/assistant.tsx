import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

import apiClient from '../../services/api';
import GlassBackground from '../../components/common/GlassBackground';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposedTransaction?: {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    date: string;
  };
  confirmed?: boolean;
  cancelled?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content:
      "Hello! I'm SmartFin AI, your multi-agent personal finance assistant. Ask me about your spending, budgets, upcoming bills, or tell me in plain language to record an expense (e.g. 'I spent Rs. 2,500 on groceries yesterday').",
  },
];

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What is my highest spending category?',
  'Am I exceeding my food budget?',
  'I spent Rs. 2,500 on groceries yesterday',
];

export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    // Load existing conversation history from MongoDB Atlas
    const loadHistory = async () => {
      try {
        const res = await apiClient.get('/assistant/conversations', {
          params: { session_id: 'default_session', limit: 30 },
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          const loaded: ChatMessage[] = res.data.map((m: any, idx: number) => ({
            id: `hist-${idx}-${m.created_at || idx}`,
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            proposedTransaction: m.metadata?.proposed_transaction,
          }));
          setMessages([...INITIAL_MESSAGES, ...loaded]);
        }
      } catch {
        // Keep welcome message if offline or empty
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await apiClient.post('/assistant/chat', {
        message: text,
        session_id: 'default_session',
      });

      const replyData = res.data;
      const asstMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: replyData.reply || 'Request processed successfully.',
        proposedTransaction: replyData.proposed_transaction || undefined,
      };

      setMessages((prev) => [...prev, asstMsg]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Sorry, I couldn't reach the backend server (${err.message || 'Network Error'}). Please check that your FastAPI server is running.`,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransaction = async (msgId: string, tx: any) => {
    try {
      await apiClient.post('/transactions', {
        amount: tx.amount,
        type: tx.type,
        category_name: tx.category,
        description: tx.description,
        date: tx.date,
        payment_method: 'Cash',
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, confirmed: true } : m))
      );
      Alert.alert('Saved', 'Transaction recorded into MongoDB Atlas successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save transaction.');
    }
  };

  const handleCancelTransaction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, cancelled: true } : m))
    );
  };

  return (
    <GlassBackground>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Frosted Glass Top Header */}
        <View
          className="px-5 pt-3 pb-3 flex-row items-center justify-between"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-2xl bg-purple-600 items-center justify-center mr-3 shadow-sm">
            <Bot size={20} color="#ffffff" />
          </View>
          <View>
            <Text className="text-base font-extrabold text-slate-900">SmartFin AI</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              <Text className="text-xs font-semibold text-slate-400">7 Multi-Agents Ready</Text>
            </View>
          </View>
        </View>

        <View className="bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
          <Text className="text-[11px] font-bold text-purple-700">LangGraph Powered</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 25}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <View
                key={m.id}
                className={`mb-4 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2 self-end mb-1 border border-purple-200">
                    <Sparkles size={14} color="#7c3aed" />
                  </View>
                )}

                <View className="max-w-[82%]">
                  <View
                    className={`p-4 rounded-3xl ${
                      isUser
                        ? 'bg-emerald-600 rounded-br-none shadow-sm'
                        : 'bg-white rounded-bl-none border border-slate-200 shadow-sm'
                    }`}
                  >
                    <Text
                      className={`text-sm leading-relaxed ${
                        isUser ? 'text-white font-medium' : 'text-slate-800'
                      }`}
                    >
                      {m.content}
                    </Text>

                    {/* Transaction Confirmation Card */}
                    {m.proposedTransaction && (
                      <View className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-xs font-bold text-slate-800">
                            Proposed Transaction
                          </Text>
                          <View
                            className={`px-2 py-0.5 rounded-full ${
                              m.proposedTransaction.type === 'INCOME'
                                ? 'bg-emerald-50'
                                : 'bg-rose-50'
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-bold ${
                                m.proposedTransaction.type === 'INCOME'
                                  ? 'text-emerald-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {m.proposedTransaction.type}
                            </Text>
                          </View>
                        </View>

                        <Text className="text-sm font-extrabold text-slate-900 mb-0.5">
                          Rs. {Number(m.proposedTransaction.amount).toLocaleString()}
                        </Text>
                        <Text className="text-xs text-slate-600 mb-0.5">
                          {m.proposedTransaction.description}
                        </Text>
                        <Text className="text-[11px] text-slate-400">
                          {m.proposedTransaction.category} • {m.proposedTransaction.date}
                        </Text>

                        {/* Confirmation Buttons */}
                        <View className="mt-3 pt-2 border-t border-slate-200 flex-row">
                          {m.confirmed ? (
                            <View className="flex-row items-center justify-center w-full py-1.5 bg-emerald-100 rounded-xl">
                              <CheckCircle2 size={14} color="#059669" />
                              <Text className="text-xs font-bold text-emerald-800 ml-1.5">
                                Confirmed & Saved
                              </Text>
                            </View>
                          ) : m.cancelled ? (
                            <View className="flex-row items-center justify-center w-full py-1.5 bg-slate-200 rounded-xl">
                              <XCircle size={14} color="#64748b" />
                              <Text className="text-xs font-bold text-slate-600 ml-1.5">
                                Cancelled
                              </Text>
                            </View>
                          ) : (
                            <>
                              <TouchableOpacity
                                onPress={() => handleCancelTransaction(m.id)}
                                className="flex-1 bg-slate-200 py-2 rounded-xl items-center mr-2"
                              >
                                <Text className="text-xs font-bold text-slate-700">Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  handleConfirmTransaction(m.id, m.proposedTransaction)
                                }
                                className="flex-1 bg-emerald-600 py-2 rounded-xl items-center"
                              >
                                <Text className="text-xs font-bold text-white">
                                  Confirm & Save
                                </Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {loading && (
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2 border border-purple-200">
                <Sparkles size={14} color="#7c3aed" />
              </View>
              <View className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex-row items-center">
                <ActivityIndicator size="small" color="#7c3aed" />
                <Text className="text-xs text-slate-400 font-medium ml-2">
                  SmartFin Agents analyzing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips (hidden while typing to keep chat spacious) */}
        {!isKeyboardVisible && (
          <View className="px-4 py-2 bg-white border-t border-slate-100">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {SUGGESTIONS.map((sug) => (
                <TouchableOpacity
                  key={sug}
                  onPress={() => handleSend(sug)}
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full mr-2"
                >
                  <Text className="text-xs text-slate-600 font-medium">{sug}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar (stays cleanly above floating glass dock when idle, and above keyboard when typing) */}
        <View
          className="flex-row items-center px-4 py-3"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.95)',
            marginBottom: isKeyboardVisible ? 0 : 88,
          }}
        >
          <TextInput
            placeholder="Ask about finances or record expense..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline={false}
            className="flex-1 bg-white/90 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 mr-2"
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
            className={`w-11 h-11 rounded-2xl items-center justify-center shadow-sm ${
              inputText.trim() ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </GlassBackground>
  );
}
