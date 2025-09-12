import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeft, Mic, Send, Bot } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "I'm here to listen and support you. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for sharing that with me. It sounds like you're going through a challenging time. Remember that it's completely normal to feel this way, and you're taking a positive step by reaching out. Would you like to talk about what's been on your mind lately?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Bot size={24} color={Colors.text.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Support Companion</Text>
            <Text style={styles.headerStatus}>• Online</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIcon}>
            <Bot size={32} color={Colors.text.secondary} />
          </View>
          <Text style={styles.welcomeTitle}>Start a conversation</Text>
        </View>

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.aiMessageText,
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          placeholderTextColor={Colors.text.light}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.micButton}>
          <Mic size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Send size={20} color={inputText.trim() ? Colors.text.white : Colors.text.light} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 12,
    borderRadius: 16,
  },
  userMessageText: {
    backgroundColor: Colors.primary,
    color: Colors.text.white,
  },
  aiMessageText: {
    backgroundColor: Colors.surface,
    color: Colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
    marginRight: 8,
  },
  micButton: {
    padding: 12,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
});