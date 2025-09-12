import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Play, BookOpen, Headphones, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categories = ['All', 'Videos', 'Audio', 'Articles', 'Exercises'];

const mockResources = [
  {
    id: '1',
    title: '5-Minute Breathing Exercise',
    description: 'Calm your mind with guided breathing',
    type: 'audio',
    duration: '5 min',
    category: 'Mindfulness',
  },
  {
    id: '2',
    title: 'Managing Exam Stress',
    description: 'Practical tips for handling academic pressure',
    type: 'video',
    duration: '12 min',
    category: 'Academic',
  },
  {
    id: '3',
    title: 'Sleep Hygiene Guide',
    description: 'Improve your sleep quality naturally',
    type: 'article',
    duration: '8 min read',
    category: 'Wellness',
  },
  {
    id: '4',
    title: 'Progressive Muscle Relaxation',
    description: 'Release tension from your body',
    type: 'exercise',
    duration: '15 min',
    category: 'Relaxation',
  },
];

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategorySelect = useCallback((category: string) => {
    if (!category || typeof category !== 'string') return;
    if (category.length > 50) return;
    const sanitized = category.trim();
    if (!sanitized) return;
    setSelectedCategory(sanitized);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={20} color={Colors.primary} />;
      case 'audio':
        return <Headphones size={20} color={Colors.primary} />;
      case 'article':
        return <FileText size={20} color={Colors.primary} />;
      case 'exercise':
        return <BookOpen size={20} color={Colors.primary} />;
      default:
        return <Play size={20} color={Colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.resourcesList}>
        {mockResources.map((resource) => (
          <TouchableOpacity key={resource.id} style={styles.resourceCard}>
            <View style={styles.resourceIcon}>
              {getIcon(resource.type)}
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
              <View style={styles.resourceMeta}>
                <Text style={styles.resourceCategory}>{resource.category}</Text>
                <Text style={styles.resourceDuration}>{resource.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  selectedCategoryText: {
    color: Colors.text.white,
  },
  resourcesList: {
    flex: 1,
  },
  resourceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceCategory: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  resourceDuration: {
    fontSize: 12,
    color: Colors.text.light,
  },
});