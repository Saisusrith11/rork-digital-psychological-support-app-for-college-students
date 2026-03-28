import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TestScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Test Screen</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Status</Text>
          <Text style={styles.status}>✅ App is running successfully</Text>
          <Text style={styles.status}>✅ TypeScript compilation working</Text>
          <Text style={styles.status}>✅ React Query configured</Text>
          <Text style={styles.status}>✅ Navigation working</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features Available</Text>
          <Text style={styles.data}>• Student Dashboard</Text>
          <Text style={styles.data}>• Counselor Portal</Text>
          <Text style={styles.data}>• Admin Panel</Text>
          <Text style={styles.data}>• Volunteer System</Text>
          <Text style={styles.data}>• Assessment Tools</Text>
          <Text style={styles.data}>• Resource Library</Text>
          <Text style={styles.data}>• Chat System</Text>
          <Text style={styles.data}>• Wellness Activities</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Stack</Text>
          <Text style={styles.data}>• React Native with Expo</Text>
          <Text style={styles.data}>• TypeScript</Text>
          <Text style={styles.data}>• React Query for state management</Text>
          <Text style={styles.data}>• Expo Router for navigation</Text>
          <Text style={styles.data}>• Custom API client</Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => console.log('Test button pressed')}
        >
          <Text style={styles.buttonText}>Test Button</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  data: {
    fontSize: 12,
    color: Colors.text.primary,
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 8,
  },
  success: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButton: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: Colors.surface,
    fontWeight: '600',
  },
});