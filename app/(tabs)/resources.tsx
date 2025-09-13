import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Target, Moon, Wind, Brain, BookOpen, Zap, Shield, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { resourcesData, resourceCategories, ResourceContent } from '@/constants/resources-data';
import { useLanguage } from '@/hooks/language-store';

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const { t, currentLanguage } = useLanguage();

  const getIcon = (iconName: string) => {
    const iconProps = { size: 24, color: Colors.primary };
    switch (iconName) {
      case 'target':
        return <Target {...iconProps} />;
      case 'moon':
        return <Moon {...iconProps} />;
      case 'wind':
        return <Wind {...iconProps} />;
      case 'brain':
        return <Brain {...iconProps} />;
      case 'book-open':
        return <BookOpen {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'trending-up':
        return <TrendingUp {...iconProps} />;
      default:
        return <Target {...iconProps} />;
    }
  };

  const filteredByLanguage: ResourceContent[] = useMemo(() => {
    const itemsForLang = resourcesData.filter(r => r.language === currentLanguage);
    if (itemsForLang.length > 0) return itemsForLang;
    return resourcesData.filter(r => r.language === 'en');
  }, [currentLanguage]);

  const handleResourcePress = (resourceId: string) => {
    router.push(`/resource-detail?id=${resourceId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('resources.title')}</Text>
        <Text style={styles.subtitle}>{t('resources.subtitle')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Category Sections */}
        {resourceCategories.map((category) => {
          const categoryResources = filteredByLanguage.filter(resource => 
            resource.category === category.name
          );
          
          if (categoryResources.length === 0) return null;
          
          return (
            <View key={category.id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              
              {categoryResources.map((resource) => (
                <TouchableOpacity 
                  key={resource.id} 
                  style={[styles.resourceCard, { backgroundColor: category.color }]}
                  onPress={() => handleResourcePress(resource.id)}
                >
                  <View style={styles.resourceIcon}>
                    {getIcon(resource.icon)}
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceDescription}>{resource.description}</Text>
                    <View style={styles.resourceMeta}>
                      <Text style={styles.resourceType}>{resource.type.toUpperCase()}</Text>
                      {resource.duration && (
                        <Text style={styles.resourceDuration}>{resource.duration}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  resourceCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 24,
  },
  resourceDescription: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 22,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceType: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  resourceDuration: {
    fontSize: 12,
    color: Colors.text.light,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});