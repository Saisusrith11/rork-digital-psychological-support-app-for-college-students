import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface ResourceCardProps {
  title: string;
  description: string;
  duration?: string;
  onPress: () => void;
}

export default function ResourceCard({ title, description, duration, onPress }: ResourceCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Play size={24} color={Colors.text.secondary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {duration && <Text style={styles.duration}>{duration}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: Colors.text.light,
  },
});