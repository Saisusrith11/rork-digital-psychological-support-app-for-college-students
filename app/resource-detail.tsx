import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, Tag } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resourcesData } from '@/constants/resources-data';

export default function ResourceDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  
  const resource = resourcesData.find(r => r.id === id);
  
  if (!resource) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Resource not found</Text>
      </View>
    );
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{resource.category}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{resource.title}</Text>
          <Text style={styles.description}>{resource.description}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Clock size={16} color={Colors.text.secondary} />
              <Text style={styles.metaText}>{resource.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Tag size={16} color={Colors.text.secondary} />
              <Text style={styles.metaText}>{resource.type.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{resource.content}</Text>
        </View>

        {resource.techniques && resource.techniques.length > 0 && (
          <View style={styles.techniquesSection}>
            <Text style={styles.sectionTitle}>Key Techniques</Text>
            {resource.techniques.map((technique) => (
              <View key={technique} style={styles.techniqueItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.techniqueText}>{technique}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Related Topics</Text>
          <View style={styles.tagsContainer}>
            {resource.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  contentSection: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 26,
  },
  techniquesSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  techniqueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  techniqueText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  tagsSection: {
    padding: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
});