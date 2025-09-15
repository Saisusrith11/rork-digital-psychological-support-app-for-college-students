import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { Video, FileAudio, FileText, Sparkles } from 'lucide-react-native';

export default function ResourcesDynamicScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, error } = trpc.resources.getAll.useQuery({ type: 'all', limit: 100, offset: 0 });

  const grouped = useMemo(() => {
    const list = data?.resources ?? [];
    return {
      video: list.filter(r => r.type === 'video'),
      audio: list.filter(r => r.type === 'audio'),
      pdf: list.filter(r => r.type === 'pdf'),
      meditation: list.filter(r => r.type === 'meditation'),
    } as Record<'video'|'audio'|'pdf'|'meditation', any[]>;
  }, [data]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header} testID="resources-dynamic-header">Resources</Text>
        {isLoading && <Text style={styles.loading}>Loading...</Text>}
        {error && <Text style={styles.error}>Failed to load resources</Text>}
        {!isLoading && !error && (
          <>
            {(['video','audio','pdf','meditation'] as const).map((t) => (
              <View key={t} style={styles.section}>
                <View style={styles.sectionHeader}>
                  {t==='video' && <Video size={16} color={Colors.primary} />}
                  {t==='audio' && <FileAudio size={16} color={Colors.primary} />}
                  {t==='pdf' && <FileText size={16} color={Colors.primary} />}
                  {t==='meditation' && <Sparkles size={16} color={Colors.primary} />}
                  <Text style={styles.sectionTitle}>{t.toUpperCase()}</Text>
                </View>
                {grouped[t].length === 0 && <Text style={styles.empty}>No items</Text>}
                {grouped[t].map((r) => (
                  <TouchableOpacity key={r.id} style={styles.card} onPress={() => {}} testID={`res-item-${r.id}`}>
                    <Text style={styles.cardTitle}>{r.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text>
                    <Text style={styles.cardMeta}>{r.category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}
        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, marginBottom: 12 },
  loading: { color: Colors.text.secondary },
  error: { color: Colors.error },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  empty: { color: Colors.text.light, fontSize: 12 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  cardDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  cardMeta: { fontSize: 11, color: Colors.primary, marginTop: 6, fontWeight: '700' },
});