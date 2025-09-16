import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, Calendar, Bot } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

export default function QuickActions() {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.actionCard, styles.aiSupportCard]}
        onPress={() => router.push('/ai-chat')}
        testID="ai-support-button"
      >
        <Bot size={32} color={Colors.text.white} />
        <View style={styles.textContainer}>
          <Text style={styles.aiSupportTitle}>AI Mental Health</Text>
          <Text style={styles.aiSupportSubtitle}>Get personalized support</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, styles.chatCard]}
        onPress={() => router.push('/(tabs)/chat')}
        testID="chat-button"
      >
        <MessageCircle size={32} color={Colors.text.white} />
        <View style={styles.textContainer}>
          <Text style={styles.chatTitle}>Live Chat</Text>
          <Text style={styles.chatSubtitle}>Talk to counselor</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, styles.bookingCard]}
        onPress={() => router.push('/booking')}
        testID="book-session-button"
      >
        <Calendar size={32} color={Colors.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.bookingTitle}>Book Session</Text>
          <Text style={styles.bookingSubtitle}>Schedule appointment</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiSupportCard: {
    backgroundColor: Colors.primary,
  },
  chatCard: {
    backgroundColor: Colors.secondary,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  aiSupportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  aiSupportSubtitle: {
    fontSize: 12,
    color: Colors.text.white,
    opacity: 0.9,
    marginTop: 2,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  chatSubtitle: {
    fontSize: 12,
    color: Colors.text.white,
    opacity: 0.9,
    marginTop: 2,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  bookingSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});