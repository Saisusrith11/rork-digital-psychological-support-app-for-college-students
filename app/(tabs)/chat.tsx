import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { ArrowLeft, Mic, Send, Bot, AlertTriangle, Phone, Heart } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'normal' | 'urgent' | 'coping' | 'assessment';
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'grounding' | 'sleep' | 'academic';
  steps: string[];
}

interface AIResponse {
  text: string;
  type: 'normal' | 'urgent' | 'coping' | 'assessment';
  copingStrategies?: CopingStrategy[];
  urgentReferral?: boolean;
}

const copingStrategies: CopingStrategy[] = [
  {
    id: '1',
    title: 'Deep Breathing Exercise',
    description: 'A simple breathing technique to reduce anxiety',
    category: 'breathing',
    steps: [
      'Sit comfortably and close your eyes',
      'Breathe in slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly through your mouth for 6 counts',
      'Repeat 5-10 times'
    ]
  },
  {
    id: '2',
    title: '5-4-3-2-1 Grounding Technique',
    description: 'Use your senses to ground yourself in the present',
    category: 'grounding',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste'
    ]
  },
  {
    id: '3',
    title: 'Progressive Muscle Relaxation',
    description: 'Release physical tension to calm your mind',
    category: 'mindfulness',
    steps: [
      'Start with your toes, tense for 5 seconds then relax',
      'Move to your calves, tense and relax',
      'Continue with thighs, abdomen, arms, and face',
      'Notice the difference between tension and relaxation',
      'Take deep breaths throughout'
    ]
  },
  {
    id: '4',
    title: 'Academic Stress Management',
    description: 'Break down overwhelming academic tasks',
    category: 'academic',
    steps: [
      'List all your tasks and deadlines',
      'Break large tasks into smaller, manageable steps',
      'Prioritize based on urgency and importance',
      'Set realistic daily goals',
      'Take regular breaks using the Pomodoro technique'
    ]
  },
  {
    id: '5',
    title: 'Sleep Hygiene Tips',
    description: 'Improve your sleep quality for better mental health',
    category: 'sleep',
    steps: [
      'Set a consistent sleep schedule',
      'Avoid screens 1 hour before bed',
      'Create a relaxing bedtime routine',
      'Keep your bedroom cool and dark',
      'Avoid caffeine after 2 PM'
    ]
  }
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI mental health companion. I'm here to provide support, coping strategies, and connect you with professional help when needed. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
      type: 'normal'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadConversationHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('conversationHistory');
      if (history) {
        setConversationHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const saveConversationHistory = async (newHistory: string[]) => {
    try {
      await AsyncStorage.setItem('conversationHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  };

  const analyzeUserInput = (input: string): AIResponse => {
    const lowerInput = input.toLowerCase();
    
    // Crisis detection keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'hurt myself', 'die', 'hopeless'];
    const severeKeywords = ['can\'t cope', 'overwhelming', 'panic', 'breakdown', 'crisis'];
    
    // Stress/anxiety keywords
    const stressKeywords = ['stress', 'anxious', 'worried', 'nervous', 'overwhelmed', 'pressure'];
    const academicKeywords = ['exam', 'study', 'assignment', 'deadline', 'grades', 'college', 'university'];
    const sleepKeywords = ['sleep', 'insomnia', 'tired', 'exhausted', 'can\'t sleep'];
    const socialKeywords = ['lonely', 'isolated', 'friends', 'social', 'alone'];
    
    // Check for crisis indicators
    if (crisisKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        text: "I'm very concerned about what you've shared. Your safety is the most important thing right now. Please reach out to a mental health professional immediately. You don't have to go through this alone.",
        type: 'urgent',
        urgentReferral: true
      };
    }
    
    // Check for severe distress
    if (severeKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        text: "It sounds like you're going through a really difficult time. These feelings can be overwhelming, but there are people who can help. I'd strongly recommend speaking with a counselor. In the meantime, would you like to try some immediate coping strategies?",
        type: 'coping',
        copingStrategies: [copingStrategies[0], copingStrategies[1]] // Breathing and grounding
      };
    }
    
    // Academic stress
    if (stressKeywords.some(keyword => lowerInput.includes(keyword)) && 
        academicKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        text: "Academic stress is very common among students. It's important to remember that your worth isn't defined by your grades. Let me share some strategies that can help you manage academic pressure more effectively.",
        type: 'coping',
        copingStrategies: [copingStrategies[3]] // Academic stress management
      };
    }
    
    // Sleep issues
    if (sleepKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        text: "Sleep problems can really affect your mental health and daily functioning. Good sleep hygiene can make a significant difference. Here are some evidence-based strategies to improve your sleep:",
        type: 'coping',
        copingStrategies: [copingStrategies[4]] // Sleep hygiene
      };
    }
    
    // General anxiety/stress
    if (stressKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        text: "I hear that you're feeling stressed. Stress is a normal response, but when it becomes overwhelming, it's important to have healthy coping strategies. Here are some techniques that many students find helpful:",
        type: 'coping',
        copingStrategies: [copingStrategies[0], copingStrategies[2]] // Breathing and muscle relaxation
      };
    }
    
    // Social isolation
    if (socialKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        text: "Feeling lonely or isolated can be really challenging, especially as a student. Remember that many people feel this way, and it's okay to reach out for support. Building connections takes time, but there are ways to start.",
        type: 'normal'
      };
    }
    
    // Default supportive response
    return {
      text: "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about what's been on your mind? Sometimes talking through our thoughts and feelings can help us process them better.",
      type: 'normal'
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    const newHistory = [...conversationHistory, inputText];
    setConversationHistory(newHistory);
    saveConversationHistory(newHistory);

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = analyzeUserInput(inputText);
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: aiResponse.type
      };

      // Add urgent referral actions if needed
      if (aiResponse.urgentReferral) {
        responseMessage.actions = [
          {
            label: 'Call Emergency Helpline',
            action: () => {
              if (Platform.OS !== 'web') {
                Alert.alert(
                  'Emergency Support',
                  'National Suicide Prevention Lifeline: 988\nCrisis Text Line: Text HOME to 741741',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call 988', onPress: () => console.log('Would call 988') }
                  ]
                );
              }
            }
          },
          {
            label: 'Book Counselor',
            action: () => router.push('/booking')
          }
        ];
      }

      setMessages(prev => [...prev, responseMessage]);
      
      // Add coping strategies if provided
      if (aiResponse.copingStrategies) {
        setTimeout(() => {
          aiResponse.copingStrategies?.forEach((strategy, index) => {
            setTimeout(() => {
              const strategyMessage: Message = {
                id: `strategy_${Date.now()}_${index}`,
                text: `**${strategy.title}**\n\n${strategy.description}\n\nSteps:\n${strategy.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
                isUser: false,
                timestamp: new Date(),
                type: 'coping'
              };
              setMessages(prev => [...prev, strategyMessage]);
            }, index * 1000);
          });
        }, 1000);
      }
      
      setIsTyping(false);
    }, 1500);
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
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>AI Mental Health Support</Text>
            <Text style={styles.headerStatus}>• Available 24/7 • Confidential</Text>
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
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIcon}>
            <Bot size={32} color={Colors.text.secondary} />
          </View>
          <Text style={styles.welcomeTitle}>Start a conversation</Text>
        </View>

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
                  <Text style={styles.urgentLabel}>Urgent Support Needed</Text>
                </View>
              )}
              {message.type === 'coping' && (
                <View style={styles.copingHeader}>
                  <Heart size={16} color={Colors.primary} />
                  <Text style={styles.copingLabel}>Coping Strategy</Text>
                </View>
              )}
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText,
                message.type === 'urgent' && styles.urgentMessageText,
              ]}>
                {message.text}
              </Text>
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
              <Text style={styles.typingText}>AI is typing...</Text>
            </View>
          </View>
        )}
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
  },
  typingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});