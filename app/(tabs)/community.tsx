import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Plus, Shield, MessageCircle, Users, Globe } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categories = ['All Posts', 'Academic', 'Wellness', 'Social'];
const popularTags = ['#ExamStress', '#SleepHelp', '#Meditation', '#SocialAnxiety', '#StudyTips'];

const volunteers = [
  {
    id: '1',
    name: 'Ananya S.',
    year: '4th Year Psychology',
    languages: ['English', 'Hindi', 'Tamil'],
    specialties: ['Academic Stress', 'Peer Support'],
    isOnline: true,
  },
  {
    id: '2',
    name: 'Rohit K.',
    year: '3rd Year Social Work',
    languages: ['English', 'Hindi', 'Telugu'],
    specialties: ['Social Anxiety', 'Study Tips'],
    isOnline: false,
  },
  {
    id: '3',
    name: 'Priya M.',
    year: '4th Year Counseling',
    languages: ['English', 'Tamil'],
    specialties: ['Wellness', 'Mindfulness'],
    isOnline: true,
  },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All Posts');

  const handleCategorySelect = useCallback((category: string) => {
    if (!category || typeof category !== 'string') return;
    if (category.length > 50) return;
    const sanitized = category.trim();
    if (!sanitized) return;
    setSelectedCategory(sanitized);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Support</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color={Colors.text.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.guidelinesContainer}>
          <Shield size={20} color={Colors.secondary} />
          <View style={styles.guidelinesText}>
            <Text style={styles.guidelinesTitle}>Safe Space Guidelines</Text>
            <Text style={styles.guidelinesSubtitle}>
              This is a moderated, supportive community. Please be kind and respectful.
            </Text>
          </View>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Discussions</Text>
          
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to start a conversation in the community
            </Text>
            <TouchableOpacity style={styles.createPostButton}>
              <Text style={styles.createPostText}>Create First Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Topics</Text>
          <View style={styles.tagsContainer}>
            {popularTags.map((tag) => (
              <TouchableOpacity key={tag} style={styles.tagButton}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Student Volunteers</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Connect with trained peer volunteers for support and guidance
          </Text>
          
          {volunteers.map((volunteer) => (
            <TouchableOpacity key={volunteer.id} style={styles.volunteerCard}>
              <View style={styles.volunteerHeader}>
                <View style={styles.volunteerAvatar}>
                  <Text style={styles.volunteerInitials}>
                    {volunteer.name.split(' ')[0][0]}{volunteer.name.split(' ')[1]?.[0] || ''}
                  </Text>
                </View>
                <View style={styles.volunteerInfo}>
                  <View style={styles.volunteerNameRow}>
                    <Text style={styles.volunteerName}>{volunteer.name}</Text>
                    <View style={[styles.statusDot, volunteer.isOnline ? styles.onlineStatus : styles.offlineStatus]} />
                  </View>
                  <Text style={styles.volunteerYear}>{volunteer.year}</Text>
                  <View style={styles.languageContainer}>
                    <Globe size={12} color={Colors.primary} />
                    <Text style={styles.volunteerLanguages}>{volunteer.languages.join(', ')}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.specialtiesContainer}>
                {volunteer.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.volunteerActions}>
                <TouchableOpacity style={styles.chatButton}>
                  <MessageCircle size={16} color={Colors.text.white} />
                  <Text style={styles.chatButtonText}>
                    {volunteer.isOnline ? 'Chat Now' : 'Send Message'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelinesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '15',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  guidelinesText: {
    flex: 1,
    marginLeft: 12,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 4,
  },
  guidelinesSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    opacity: 0.8,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createPostButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createPostText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  tagText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  volunteerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  volunteerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volunteerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  volunteerInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineStatus: {
    backgroundColor: Colors.success,
  },
  offlineStatus: {
    backgroundColor: Colors.text.light,
  },
  volunteerYear: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  volunteerLanguages: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
  },
  volunteerActions: {
    alignItems: 'flex-end',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chatButtonText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
});