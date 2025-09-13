import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft, Mic, Send, Bot, AlertTriangle, Phone, Heart, BookOpen, Users, Brain, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AIChatService, Message, CopingStrategy } from '@/services/ai-chat-service';
import { useLanguage } from '@/hooks/language-store';

interface QuickPrompt {
  id: string;
  text: string;
  icon: any;
  category: string;
}

const quickPrompts: QuickPrompt[] = [
  { id: '1', text: "I'm feeling anxious about exams", icon: BookOpen, category: 'academic' },
  { id: '2', text: "I'm having trouble sleeping", icon: Brain, category: 'sleep' },
  { id: '3', text: "I feel lonely and isolated", icon: Users, category: 'social' },
  { id: '4', text: "I need coping strategies", icon: Sparkles, category: 'coping' }
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { to } = useLocalSearchParams<{ to?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const aiService = useRef(AIChatService.getInstance());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here to support you. How are you feeling today? Remember, this is a safe space to share whatever is on your mind.",
      isUser: false,
      timestamp: new Date(),
      type: 'normal'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);


  useEffect(() => {
    // Hide quick prompts after first message
    if (messages.length > 1) {
      setShowQuickPrompts(false);
    }
  }, [messages]);

  useEffect(() => {
    if (to && typeof to === 'string') {
      setMessages(prev => [
        ...prev,
        {
          id: `vol_${Date.now()}`,
          text: `Connected to volunteer: ${to}. You can start messaging now.`,
          isUser: false,
          timestamp: new Date(),
          type: 'normal',
        },
      ]);
    }
  }, [to]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    setShowQuickPrompts(false);
    sendMessage(prompt);
  };

  const handleAction = (action: string) => {
    const [type, value] = action.split(':');
    
    switch (type) {
      case 'call':
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Crisis Support',
            `Would you like to call ${value}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', onPress: () => console.log(`Calling ${value}`) }
            ]
          );
        }
        break;
      case 'booking':
        router.push(value === 'emergency' ? '/booking?emergency=true' : '/booking');
        break;
      case 'resources':
        router.push(`/resources?category=${value}`);
        break;
      case 'coping':
        const strategies = aiService.current.getCopingStrategies(value);
        if (strategies.length > 0) {
          displayCopingStrategy(strategies[0]);
        }
        break;
      case 'community':
        router.push('/(tabs)/community');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const displayCopingStrategy = (strategy: CopingStrategy) => {
    const strategyMessage: Message = {
      id: `strategy_${Date.now()}`,
      text: `**${strategy.title}**\n\n${strategy.description}\n\n**Steps:**\n${strategy.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n⏱ Duration: ${strategy.duration || 'As needed'}\n✨ ${strategy.effectiveness || 'Helps reduce stress'}`,
      isUser: false,
      timestamp: new Date(),
      type: 'coping'
    };
    setMessages(prev => [...prev, strategyMessage]);
  };



  const sendMessage = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setShowQuickPrompts(false);

    try {
      // Get AI response
      const response = await aiService.current.processMessage(messageText);
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        type: response.type
      };

      // Add actions if provided
      if (response.suggestedActions && response.suggestedActions.length > 0) {
        responseMessage.actions = response.suggestedActions.map(action => ({
          label: action.label,
          action: () => handleAction(action.action)
        }));
      }

      // Add resources if provided
      if (response.resources && response.resources.length > 0) {
        responseMessage.resources = response.resources;
      }

      setMessages(prev => [...prev, responseMessage]);
      
      // If coping strategies are suggested, get and display them
      if (response.type === 'coping' && response.topics.length > 0) {
        const strategies = aiService.current.getCopingStrategies(response.topics[0]);
        if (strategies.length > 0) {
          setTimeout(() => {
            displayCopingStrategy(strategies[0]);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your message right now. Please try again, or if you need immediate support, please contact the crisis helpline at 988.",
        isUser: false,
        timestamp: new Date(),
        type: 'normal'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const showEmergencyContacts = () => {
    Alert.alert(
      'Emergency Contacts',
      'If you\'re in immediate danger, please call emergency services.\n\n• Emergency: 911\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• Campus Counseling Center: [Your campus number]',
      [{ text: 'OK' }]
    );
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('chat.title')}</Text>
            <Text style={styles.headerStatus}>{t('chat.subtitle')}</Text>
          </View>
          <TouchableOpacity onPress={showEmergencyContacts} style={styles.emergencyButton}>
            <Phone size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.length === 1 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <Bot size={32} color={Colors.text.secondary} />
            </View>
            <Text style={styles.welcomeTitle}>AI Mental Health Support</Text>
            <Text style={styles.welcomeSubtitle}>I&apos;m here to listen and help</Text>
          </View>
        )}

        {showQuickPrompts && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Quick conversation starters:</Text>
            {quickPrompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.quickPromptButton}
                onPress={() => handleQuickPrompt(prompt.text)}
              >
                <prompt.icon size={20} color={Colors.primary} />
                <Text style={styles.quickPromptText}>{prompt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage,
                message.type === 'urgent' && styles.urgentMessage,
                message.type === 'coping' && styles.copingMessage,
              ]}
            >
              {message.type === 'urgent' && (
                <View style={styles.urgentHeader}>
                  <AlertTriangle size={16} color={Colors.error} />
                  <Text style={styles.urgentLabel}>{t('chat.urgent.label')}</Text>
                </View>
              )}
              {message.type === 'coping' && (
                <View style={styles.copingHeader}>
                  <Heart size={16} color={Colors.primary} />
                  <Text style={styles.copingLabel}>{t('chat.coping.label')}</Text>
                </View>
              )}
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText,
                message.type === 'urgent' && styles.urgentMessageText,
              ]}>
                {message.text}
              </Text>
              {message.resources && message.resources.length > 0 && (
                <View style={styles.resourcesContainer}>
                  <Text style={styles.resourcesTitle}>📚 Helpful Resources:</Text>
                  {message.resources.map((resource, index) => (
                    <View key={index} style={styles.resourceItem}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceDescription}>{resource.description}</Text>
                    </View>
                  ))}
                </View>
              )}
              {message.actions && (
                <View style={styles.actionsContainer}>
                  {message.actions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.actionButton}
                      onPress={action.action}
                    >
                      <Text style={styles.actionButtonText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor={Colors.text.light}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isTyping}
          />
          <TouchableOpacity style={styles.micButton} disabled={isTyping}>
            <Mic size={20} color={isTyping ? Colors.text.light : Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendButton, (inputText.trim() && !isTyping) && styles.sendButtonActive]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color={Colors.text.white} />
            ) : (
              <Send size={20} color={inputText.trim() ? Colors.text.white : Colors.text.light} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTextContainer: {
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
  emergencyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
  },
  urgentMessage: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  copingMessage: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  copingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  copingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  urgentMessageText: {
    color: Colors.error,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  quickPromptsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  quickPromptsTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  quickPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  quickPromptText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  resourcesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
  },
  resourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  resourceItem: {
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
});