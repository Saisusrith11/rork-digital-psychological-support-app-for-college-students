import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { trpc } from '@/lib/trpc';
import { Check, Image as ImageIcon, Lock, Send, Shield } from 'lucide-react-native';
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
  const flatListRef = useRef<FlatList>(null);

  const convId = useMemo(() => {
    const cid = typeof conversationId === 'string' && conversationId.length > 0
      ? conversationId
      : [user?.id ?? '', String(studentId)].sort().join('_');
    return cid;
  }, [conversationId, studentId, user?.id]);

  const messagesQuery = trpc.chat.getMessages.useQuery({ conversationId: convId, limit: 50 }, {
    enabled: !!convId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
    refetchOnMount: true,
    refetchOnReconnect: true,
    onSuccess: (data) => {
      try {
        const list = (data?.messages ?? []).map(m => ({ 
          id: m.id, 
          content: m.content, 
          senderId: m.senderId, 
          timestamp: m.timestamp, 
          isRead: m.isRead 
        }));
        
        // Only update if there are new messages
        if (list.length !== messages.length || 
            (list.length > 0 && messages.length > 0 && list[list.length - 1].id !== messages[messages.length - 1].id)) {
          setMessages(list);
          // Auto-scroll to bottom on new messages
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      } catch (e) {
        console.log('[VolunteerStudentChatThread] onSuccess parse error', e);
      }
    },
  });

  const startConversation = trpc.chat.startConversation.useMutation({
    onError: () => {
      if (Platform.OS === 'web') {
        console.error('[Chat] Failed to start conversation');
      } else {
        Alert.alert('Error', 'Failed to start conversation. Please try again.');
      }
    },
  });
  
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      // Immediately refetch messages after sending
      messagesQuery.refetch();
    },
    onError: () => {
      if (Platform.OS === 'web') {
        console.error('[Chat] Failed to send message');
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    },
  });
  
  const markAsRead = trpc.chat.markAsRead.useMutation();

  const handleSend = useCallback(async () => {
    try {
      const content = input.trim();
      if (!content) return;
      if (!user?.id || !studentId) return;
      
      // Optimistically add message to UI
      const tempMessage: MessageItem = {
        id: `temp_${Date.now()}`,
        content,
        senderId: user.id,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setInput('');
      
      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      if (!(messagesQuery.data && messagesQuery.data.conversation)) {
        await startConversation.mutateAsync({ 
          recipientId: String(studentId), 
          recipientName: 'Student', 
          recipientRole: 'student' 
        });
      }

      const result = await sendMessage.mutateAsync({ 
        conversationId: convId, 
        recipientId: String(studentId), 
        content 
      });
      
      if (!result?.success) {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        setInput(content); // Restore input
      }
    } catch (e) {
      console.error('[VolunteerStudentChatThread] handleSend error', e);
      // Restore input on error
      setInput(input);
    }
  }, [convId, input, messagesQuery.data, sendMessage, startConversation, studentId, user?.id]);
  
  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (convId && messages.length > 0) {
      const unreadMessages = messages.filter(m => m.senderId !== user?.id && !m.isRead);
      if (unreadMessages.length > 0) {
        markAsRead.mutate({ conversationId: convId });
      }
    }
  }, [convId, messages, user?.id, markAsRead]);

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
      {/* Encryption Notice */}
      <View style={styles.encryptionNotice}>
        <Shield size={14} color={Colors.success} />
        <Text style={styles.encryptionText}>End-to-end encrypted • Messages are not stored</Text>
      </View>
      
      {messagesQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.2}
          testID="chat-thread"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Lock size={48} color={Colors.text.light} />
              <Text style={styles.emptyTitle}>Start a secure conversation</Text>
              <Text style={styles.emptyText}>Messages are encrypted and not stored on servers</Text>
            </View>
          }
        />
      )}
      

      
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
          editable={!sendMessage.isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, sendMessage.isLoading && styles.sendBtnDisabled]} 
          onPress={handleSend} 
          disabled={sendMessage.isLoading || !input.trim()}
          testID="send-message"
        >
          {sendMessage.isLoading ? (
            <ActivityIndicator size="small" color={Colors.text.white} />
          ) : (
            <Send size={18} color={Colors.text.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  encryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.success + '30',
  },
  encryptionText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: { padding: 16, gap: 8 },
  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, marginBottom: 8 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: Colors.primary },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceLight },
  bubbleText: { fontSize: 14, color: Colors.text.primary },
  bubbleTextMine: { color: Colors.text.white },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  time: { fontSize: 10, color: Colors.text.secondary },

  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: 8, 
    padding: 10, 
    borderTopWidth: 1, 
    borderTopColor: Colors.surfaceLight, 
    backgroundColor: Colors.surface 
  },
  textInput: { 
    flex: 1, 
    minHeight: 40, 
    maxHeight: 120, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: Colors.surfaceLight, 
    color: Colors.text.primary 
  },
  attachBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  sendBtnDisabled: { opacity: 0.6 },
});
