import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, ActivityIndicator, Platform, Linking } from 'react-native';
import { Video, FileAudio, FileText, Sparkles, X, Search, Youtube, ExternalLink } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { trpc } from '@/lib/trpc';

const TYPES = ['all','video','audio','pdf','meditation'] as const;

type FilterType = typeof TYPES[number];

type TrpcResource = {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'pdf' | 'meditation';
  category: string;
  fileUrl: string;
  youtubeUrl?: string;
  duration?: string;
  mimeType: string;
};

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<FilterType>('all');
  const [category, setCategory] = useState<string>('');

  const categoriesQuery = trpc.resources.getCategories.useQuery();
  const listQuery = trpc.resources.getAll.useQuery({ type, category: category || undefined, search: search || undefined, limit: 100, offset: 0 });

  const categories: string[] = useMemo(() => categoriesQuery.data?.categories ?? [], [categoriesQuery.data?.categories]);
  const data: TrpcResource[] = useMemo(() => listQuery.data?.resources ?? [], [listQuery.data?.resources]);

  const grouped = useMemo(() => {
    return {
      video: data.filter(r => r.type === 'video'),
      audio: data.filter(r => r.type === 'audio'),
      pdf: data.filter(r => r.type === 'pdf'),
      meditation: data.filter(r => r.type === 'meditation'),
    } as Record<'video'|'audio'|'pdf'|'meditation', TrpcResource[]>;
  }, [data]);

  const onOpen = useCallback(async (resource: TrpcResource) => {
    console.log('ResourcesScreen onOpen', { resource });
    const url = resource.youtubeUrl || resource.fileUrl;
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
      return;
    }
    
    if (resource.youtubeUrl) {
      await Linking.openURL(resource.youtubeUrl);
    } else {
      await WebBrowser.openBrowserAsync(resource.fileUrl);
    }
  }, []);

  const getIcon = (k: string) => {
    const iconProps = { size: 16, color: Colors.surface } as const;
    switch (k) {
      case 'video':
        return <Video {...iconProps} />;
      case 'audio':
        return <FileAudio {...iconProps} />;
      case 'pdf':
        return <FileText {...iconProps} />;
      case 'meditation':
        return <Sparkles {...iconProps} />;
      default:
        return <Sparkles {...iconProps} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header} testID="resources-header">Resources</Text>
        <View style={styles.searchRow}>
          <Search size={18} color={Colors.text.secondary} />
          <TextInput
            testID="resources-search"
            placeholder="Search resources"
            placeholderTextColor={Colors.text.light}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity accessibilityRole="button" onPress={() => setSearch('')} style={styles.clearBtn} testID="resources-clear-search">
              <X size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {TYPES.map(t => (
            <TouchableOpacity key={t} testID={`filter-type-${t}`} onPress={() => setType(t)} style={[styles.typeChip, type === t && styles.typeChipActive]}>
              {t !== 'all' && getIcon(t)}
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          <TouchableOpacity key="all" testID="filter-cat-all" onPress={() => setCategory('')} style={[styles.catChip, !category && styles.catChipActive]}>
            <Text style={[styles.catText, !category && styles.catTextActive]}>All Categories</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity key={c} testID={`filter-cat-${c}`} onPress={() => setCategory(c)} style={[styles.catChip, category === c && styles.catChipActive]}>
              <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {listQuery.isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        )}
        {listQuery.error && (
          <Text style={styles.errorText}>Failed to load resources</Text>
        )}

        {!listQuery.isLoading && !listQuery.error && (
          <>
            {(type === 'all' ? (['video','audio','pdf','meditation'] as const) : [type as Exclude<FilterType,'all'>]).map((t) => (
              <View key={t} style={styles.section}>
                <Text style={styles.sectionTitle}>{t.toUpperCase()}</Text>
                {grouped[t].length === 0 && <Text style={styles.empty}>No items</Text>}
                {grouped[t].map((r) => (
                  <TouchableOpacity key={r.id} style={styles.itemCard} onPress={() => onOpen(r)} testID={`open-${r.id}`}>
                    <View style={styles.itemIcon}>
                      {r.youtubeUrl ? (
                        <Youtube size={16} color={Colors.surface} />
                      ) : (
                        getIcon(r.type)
                      )}
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.itemTitle}>{r.title}</Text>
                      <Text style={styles.itemDesc} numberOfLines={2}>{r.description}</Text>
                      <View style={styles.itemMetaRow}>
                        <Text style={styles.itemMeta}>{r.category}</Text>
                        {r.youtubeUrl && (
                          <View style={styles.youtubeBadge}>
                            <Youtube size={10} color={Colors.surface} />
                            <Text style={styles.youtubeBadgeText}>YouTube</Text>
                          </View>
                        )}
                        <ExternalLink size={12} color={Colors.text.light} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, color: Colors.text.primary },
  clearBtn: { padding: 4, borderRadius: 8, backgroundColor: Colors.background },
  typeRow: { gap: 8, paddingVertical: 12 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.surfaceLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.background, marginRight: 8 },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600', letterSpacing: 0.5 },
  typeTextActive: { color: Colors.surface },
  catRow: { gap: 8, paddingVertical: 6 },
  catChip: { borderWidth: 1, borderColor: Colors.surfaceLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.background, marginRight: 8 },
  catChipActive: { backgroundColor: Colors.surface, borderColor: Colors.primary },
  catText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  catTextActive: { color: Colors.primary },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.secondary, marginBottom: 8 },
  empty: { color: Colors.text.light, fontSize: 13 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  itemIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  itemTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  itemDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  itemMeta: { fontSize: 11, color: Colors.primary, fontWeight: '700', flex: 1 },
  youtubeBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FF0000', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1, marginRight: 6 },
  youtubeBadgeText: { fontSize: 8, color: Colors.surface, fontWeight: '600' },
  flex1: { flex: 1 },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: 16 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  bottomSpacer: { height: 48 },
});