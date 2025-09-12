import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface MoodOption {
  mood: 'great' | 'good' | 'okay' | 'low' | 'hard';
  emoji: string;
  label: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { mood: 'great', emoji: '😊', label: 'Great', color: Colors.mood.great },
  { mood: 'good', emoji: '🙂', label: 'Good', color: Colors.mood.good },
  { mood: 'okay', emoji: '😐', label: 'Okay', color: Colors.mood.okay },
  { mood: 'low', emoji: '😔', label: 'Low', color: Colors.mood.low },
  { mood: 'hard', emoji: '😰', label: 'Hard', color: Colors.mood.hard },
];

interface MoodSelectorProps {
  selectedMood?: string;
  onMoodSelect: (mood: 'great' | 'good' | 'okay' | 'low' | 'hard') => void;
}

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <View style={styles.moodGrid}>
        {moodOptions.map((option) => (
          <TouchableOpacity
            key={option.mood}
            style={[
              styles.moodOption,
              selectedMood === option.mood && styles.selectedMood,
            ]}
            onPress={() => onMoodSelect(option.mood)}
            testID={`mood-${option.mood}`}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={styles.moodLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  selectedMood: {
    backgroundColor: Colors.primaryLight + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
});