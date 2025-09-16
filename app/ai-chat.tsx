import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { ChatMessage, ChatSession, ChatStep, ChatCondition } from '@/types/ai-chat';
import { chatResponses } from '@/constants/ai-chat-responses';
import { ArrowLeft, Bot, User } from 'lucide-react-native';

export default function AIChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<ChatSession>({
    id: Date.now().toString(),
    currentStep: 'welcome',
    messages: [],
    activityCompleted: false,
    advancedActivityCompleted: false,
    startedAt: new Date()
  });

  useEffect(() => {
    // Start with welcome message
    setTimeout(() => {
      addBotMessage(chatResponses.welcome.message, []);
      setTimeout(() => {
        setSession(prev => ({ ...prev, currentStep: 'initial-assessment' }));
        addBotMessage(chatResponses.initialAssessment.message, chatResponses.initialAssessment.options);
      }, 2000);
    }, 500);
  }, []);

  const addBotMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        text,
        options,
        timestamp: new Date()
      };
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000);
  };

  const addUserMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date()
    };
    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleOptionSelect = (option: string) => {
    addUserMessage(option);
    
    switch (session.currentStep) {
      case 'initial-assessment':
        handleInitialAssessment(option);
        break;
      case 'emergency-response':
        handleEmergencyAction(option);
        break;
      case 'first-check':
        handleFirstCheck(option);
        break;
      case 'second-check':
        handleSecondCheck(option);
        break;
      case 'success':
      case 'professional-help':
        if (option === 'Start New Conversation') {
          resetChat();
        } else {
          handleResourceAction(option);
        }
        break;
    }
  };

  const handleInitialAssessment = (option: string) => {
    const conditionMap: Record<string, ChatCondition> = {
      'Stress': 'stress',
      'Anxiety': 'anxiety',
      'Depression': 'depression',
      'Sleep Issues': 'sleep',
      'Emergency': 'emergency'
    };
    
    const condition = conditionMap[option];
    setSession(prev => ({ ...prev, condition }));
    
    if (condition === 'emergency') {
      setSession(prev => ({ ...prev, currentStep: 'emergency-response' }));
      addBotMessage(chatResponses.emergency.message, chatResponses.emergency.options);
    } else {
      setSession(prev => ({ ...prev, currentStep: 'first-activity' }));
      const activity = chatResponses.firstActivities[condition];
      addBotMessage(activity.message, []);
      
      setTimeout(() => {
        setSession(prev => ({ ...prev, currentStep: 'first-check' }));
        addBotMessage(chatResponses.statusCheck.message, chatResponses.statusCheck.options);
      }, 3000);
    }
  };

  const handleFirstCheck = (option: string) => {
    if (option === 'Yes, I feel better') {
      setSession(prev => ({ ...prev, currentStep: 'success', activityCompleted: true }));
      addBotMessage(chatResponses.success.message, chatResponses.success.options);
    } else {
      setSession(prev => ({ ...prev, currentStep: 'advanced-activity' }));
      const activity = chatResponses.advancedActivities[session.condition!];
      addBotMessage(activity.message, []);
      
      setTimeout(() => {
        setSession(prev => ({ ...prev, currentStep: 'second-check' }));
        addBotMessage(chatResponses.secondStatusCheck.message, chatResponses.secondStatusCheck.options);
      }, 3000);
    }
  };

  const handleSecondCheck = (option: string) => {
    if (option === 'Yes, I feel much better') {
      setSession(prev => ({ ...prev, currentStep: 'success', advancedActivityCompleted: true }));
      addBotMessage(chatResponses.success.message, chatResponses.success.options);
    } else {
      setSession(prev => ({ ...prev, currentStep: 'professional-help' }));
      addBotMessage(chatResponses.professionalHelp.message, chatResponses.professionalHelp.options);
    }
  };

  const handleEmergencyAction = (option: string) => {
    if (option === 'Contact Counselor') {
      router.push('/booking');
    } else {
      router.push('/resources');
    }
  };

  const handleResourceAction = (option: string) => {
    if (option === 'Find Counselor' || option === 'Contact Counselor') {
      router.push('/booking');
    } else if (option === 'Get Resources' || option === 'Get Help Resources') {
      router.push('/resources');
    }
  };

  const resetChat = () => {
    setSession({
      id: Date.now().toString(),
      currentStep: 'welcome',
      messages: [],
      activityCompleted: false,
      advancedActivityCompleted: false,
      startedAt: new Date()
    });
    
    setTimeout(() => {
      addBotMessage(chatResponses.welcome.message, []);
      setTimeout(() => {
        setSession(prev => ({ ...prev, currentStep: 'initial-assessment' }));
        addBotMessage(chatResponses.initialAssessment.message, chatResponses.initialAssessment.options);
      }, 2000);
    }, 500);
  };

  const getProgressStep = (): string => {
    const stepMap: Record<ChatStep, number> = {
      'welcome': 1,
      'initial-assessment': 1,
      'emergency-response': 2,
      'first-activity': 2,
      'first-check': 3,
      'advanced-activity': 3,
      'second-check': 3,
      'success': 4,
      'professional-help': 4
    };
    
    return `Step ${stepMap[session.currentStep]} of 4`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'AI Mental Health Support',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>{getProgressStep()}</Text>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${
                    session.currentStep === 'welcome' || session.currentStep === 'initial-assessment' ? 25 :
                    session.currentStep === 'emergency-response' || session.currentStep === 'first-activity' || session.currentStep === 'first-check' ? 50 :
                    session.currentStep === 'advanced-activity' || session.currentStep === 'second-check' ? 75 : 100
                  }%` 
                }
              ]}
            />
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {session.messages.map((message) => (
            <View 
              key={message.id}
              style={[
                styles.messageWrapper,
                message.type === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper
              ]}
            >
              {message.type === 'bot' && (
                <View style={styles.avatarContainer}>
                  <View style={styles.botAvatar}>
                    <Bot size={20} color={Colors.primary} />
                  </View>
                </View>
              )}
              
              <View style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.botBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userText : styles.botText
                ]}>
                  {message.text}
                </Text>
              </View>
              
              {message.type === 'user' && (
                <View style={styles.avatarContainer}>
                  <View style={styles.userAvatar}>
                    <User size={20} color={Colors.text.white} />
                  </View>
                </View>
              )}
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
              <View style={styles.avatarContainer}>
                <View style={styles.botAvatar}>
                  <Bot size={20} color={Colors.primary} />
                </View>
              </View>
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.text.secondary} />
              </View>
            </View>
          )}
        </ScrollView>

        {session.messages.length > 0 && 
         session.messages[session.messages.length - 1].options && 
         session.messages[session.messages.length - 1].options!.length > 0 && (
          <View style={styles.optionsContainer}>
            {session.messages[session.messages.length - 1].options!.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  option === 'Emergency' && styles.emergencyButton
                ]}
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={[
                  styles.optionText,
                  option === 'Emergency' && styles.emergencyText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={resetChat}
          >
            <Text style={styles.actionButtonText}>Restart Conversation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/resources')}
          >
            <Text style={styles.actionButtonText}>Get Help Resources</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  progressBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: Colors.text.primary,
  },
  userText: {
    color: Colors.text.white,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  optionButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.primary,
  },
  emergencyText: {
    color: Colors.text.white,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
});