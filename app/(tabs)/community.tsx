import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Plus, Shield, MessageCircle, Users, Globe, X, Send, Heart, MessageSquare } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/hooks/language-store';

const categories = ['All Posts', 'Academic', 'Wellness', 'Social'];
const popularTags = ['#ExamStress', '#SleepHelp', '#Meditation', '#SocialAnxiety', '#StudyTips'];

interface Post {
  id: string;
  author: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked: boolean;
}

const samplePosts: Post[] = [
  {
    id: '1',
    author: 'Anonymous Student',
    content: 'Feeling overwhelmed with midterm exams coming up. Anyone have tips for managing study stress? I&apos;ve been having trouble sleeping and concentrating.',
    category: 'Academic',
    timestamp: '2 hours ago',
    likes: 12,
    replies: 8,
    isLiked: false
  },
  {
    id: '2',
    author: 'Wellness Warrior',
    content: 'Started doing 10 minutes of meditation every morning and it&apos;s been a game changer! Highly recommend the Headspace app for beginners. What mindfulness practices work for you?',
    category: 'Wellness',
    timestamp: '5 hours ago',
    likes: 24,
    replies: 15,
    isLiked: true
  },
  {
    id: '3',
    author: 'Study Buddy',
    content: 'Anyone else struggling with social anxiety in group projects? I want to contribute but I get so nervous speaking up in meetings. Looking for advice or study partners who understand.',
    category: 'Social',
    timestamp: '1 day ago',
    likes: 18,
    replies: 22,
    isLiked: false
  }
];

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
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All Posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Academic');

  const handleCategorySelect = useCallback((category: string) => {
    if (!category || typeof category !== 'string') return;
    if (category.length > 50) return;
    const sanitized = category.trim();
    if (!sanitized) return;
    setSelectedCategory(sanitized);
  }, []);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post.');
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: 'You (Anonymous)',
      content: newPostContent.trim(),
      category: newPostCategory,
      timestamp: 'Just now',
      likes: 0,
      replies: 0,
      isLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);
    Alert.alert('Success', 'Your post has been submitted for moderation and will appear shortly.');
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const filteredPosts = selectedCategory === 'All Posts' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('community.title')}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Plus size={24} color={Colors.text.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.guidelinesContainer}>
          <Shield size={20} color={Colors.secondary} />
          <View style={styles.guidelinesTextContainer}>
            <Text style={styles.guidelinesTitle}>{t('community.guidelines')}</Text>
            <Text style={styles.guidelinesSubtitle}>
              {t('community.guidelinesText')}
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
          <Text style={styles.sectionTitle}>{t('community.discussions')}</Text>
          
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageCircle size={48} color={Colors.text.light} />
              <Text style={styles.emptyTitle}>No posts in this category</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to start a conversation
              </Text>
              <TouchableOpacity 
                style={styles.createPostButton}
                onPress={() => setShowCreatePost(true)}
              >
                <Text style={styles.createPostText}>Create First Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postAuthor}>
                    <View style={styles.authorAvatar}>
                      <Text style={styles.authorInitials}>
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.authorName}>{post.author}</Text>
                      <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                    </View>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{post.category}</Text>
                  </View>
                </View>
                
                <Text style={styles.postContent}>{post.content}</Text>
                
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLikePost(post.id)}
                  >
                    <Heart 
                      size={16} 
                      color={post.isLiked ? Colors.error : Colors.text.secondary}
                      fill={post.isLiked ? Colors.error : 'none'}
                    />
                    <Text style={[
                      styles.actionText,
                      post.isLiked && { color: Colors.error }
                    ]}>
                      {post.likes}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <MessageSquare size={16} color={Colors.text.secondary} />
                    <Text style={styles.actionText}>{post.replies}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
            <Text style={styles.sectionTitle}>{t('community.volunteers')}</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            {t('community.volunteersText')}
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

      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreatePost(false)}
      >
        <View style={styles.createPostModal}>
          <View style={styles.createPostHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <X size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.createPostTitle}>Create Post</Text>
            <TouchableOpacity 
              style={styles.postButton}
              onPress={handleCreatePost}
            >
              <Send size={20} color={Colors.text.white} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.createPostContent}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categorySelector}
            >
              {categories.slice(1).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categorySelectorButton,
                    newPostCategory === category && styles.selectedCategorySelectorButton
                  ]}
                  onPress={() => setNewPostCategory(category)}
                >
                  <Text style={[
                    styles.categorySelectorText,
                    newPostCategory === category && styles.selectedCategorySelectorText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.inputLabel}>What's on your mind?</Text>
            <TextInput
              style={styles.postInput}
              multiline
              numberOfLines={8}
              placeholder="Share your thoughts, ask for advice, or start a discussion..."
              placeholderTextColor={Colors.text.light}
              value={newPostContent}
              onChangeText={setNewPostContent}
              textAlignVertical="top"
            />
            
            <View style={styles.postGuidelines}>
              <Shield size={16} color={Colors.secondary} />
              <Text style={styles.guidelinesText}>
                Remember to be respectful and supportive. Your post will be reviewed before appearing in the community.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  guidelinesTextContainer: {
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
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorInitials: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  postTimestamp: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  postContent: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  createPostModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  createPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createPostContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  categorySelector: {
    marginBottom: 20,
  },
  categorySelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    marginRight: 8,
  },
  selectedCategorySelectorButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categorySelectorText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  selectedCategorySelectorText: {
    color: Colors.text.white,
  },
  postInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    marginBottom: 16,
    minHeight: 120,
  },
  postGuidelines: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.secondary + '15',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  guidelinesText: {
    flex: 1,
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 16,
  },
});