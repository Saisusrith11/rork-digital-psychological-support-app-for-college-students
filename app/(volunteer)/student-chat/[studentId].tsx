import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { trpc } from '@/lib/trpc';
import { Check, Image as ImageIcon, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

export default function VolunteerStudentChatThread() {
  const { studentId, conversationId } = useLocalSearchParams<{ studentId: string; conversationId?: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const convId = useMemo(() => {
    const cid = typeof conversationId === 'string' && conversationId.length > 0
      ? conversationId
      : [user?.id ?? '', String(studentId)].sort().join('_');
    return cid;
  }, [conversationId, studentId, user?.id]);

  const messagesQuery = trpc.chat.getMessages.useQuery({ conversationId: convId, limit: 50 }, {
    enabled: !!convId,
    refetchOnMount: true,
    refetchOnReconnect: true,
    onSuccess: (data) => {
      try {
        const list = (data?.messages ?? []).map(m => ({ id: m.id, content: m.content, senderId: m.senderId, timestamp: m.timestamp, isRead: m.isRead }));
        setMessages(list);
      } catch (e) {
        console.log('[VolunteerStudentChatThread] onSuccess parse error', e);
      }
    },
  });

  const sub = trpc.chat.subscribeToConversation.useSubscription({ conversationId: convId }, {
    enabled: !!convId,
    onData: (msg) => {
      setMessages(prev => [...prev, { id: msg.id, content: msg.content, senderId: msg.senderId, timestamp: msg.timestamp, isRead: msg.isRead }]);
    },
    onError: (err) => {
      console.log('[VolunteerStudentChatThread] subscription error', err);
    },
  });

  const startConversation = trpc.chat.startConversation.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();

  const handleSend = useCallback(async () => {
    try {
      const content = input.trim();
      if (!content) return;
      if (!user?.id || !studentId) return;

      if (!(messagesQuery.data && messagesQuery.data.conversation)) {
        await startConversation.mutateAsync({ recipientId: String(studentId), recipientName: 'Student', recipientRole: 'student' });
      }

      const result = await sendMessage.mutateAsync({ conversationId: convId, recipientId: String(studentId), content });
      if (result?.success) {
        setInput('');
      }
    } catch (e) {
      console.error('[VolunteerStudentChatThread] handleSend error', e);
    }
  }, [convId, input, messagesQuery.data, sendMessage, startConversation, studentId, user?.id]);

  const renderItem = useCallback(({ item }: { item: MessageItem }) => {
    const isMine = item.senderId === (user?.id ?? '');
    return (
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : undefined]}>{item.content}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          {isMine && <Check size={12} color={item.isRead ? Colors.accent : Colors.text.secondary} />}
        </View>
      </View>
    );
  }, [user?.id]);

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingBottom: insets.bottom }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.2}
        testID="chat-thread"
      />
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn} accessibilityLabel="Attach">
          <ImageIcon size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.text.light}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} testID="send-message">
          <Send size={18} color={Colors.text.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 16, gap: 8 },
  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, marginBottom: 8 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: Colors.primary },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceLight },
  bubbleText: { fontSize: 14, color: Colors.text.primary },
  bubbleTextMine: { color: Colors.text.white },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  time: { fontSize: 10, color: Colors.text.secondary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: Colors.surfaceLight, backgroundColor: Colors.surface },
  textInput: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.surfaceLight, color: Colors.text.primary },
  attachBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
});
