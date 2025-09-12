import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';

export default function QuickActions() {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.actionCard, styles.aiSupportCard]}
        onPress={() => router.push('/(tabs)/chat')}
        testID="ai-support-button"
      >
        <MessageCircle size={32} color={Colors.text.white} />
        <Text style={styles.aiSupportTitle}>AI Support</Text>
        <Text style={styles.aiSupportSubtitle}>Chat with our AI companion</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, styles.bookingCard]}
        onPress={() => router.push('/booking')}
        testID="book-session-button"
      >
        <Calendar size={32} color={Colors.primary} />
        <Text style={styles.bookingTitle}>Book Session</Text>
        <Text style={styles.bookingSubtitle}>Schedule with counselor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 8,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiSupportCard: {
    backgroundColor: Colors.primary,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  aiSupportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
    marginTop: 8,
    marginBottom: 4,
  },
  aiSupportSubtitle: {
    fontSize: 12,
    color: Colors.text.white,
    opacity: 0.9,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  bookingSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});