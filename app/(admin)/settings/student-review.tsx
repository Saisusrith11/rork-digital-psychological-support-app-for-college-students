import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { BarChart3, RefreshCcw, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Bucket = 'minimal' | 'mild' | 'moderate' | 'severe';

type CollegeOption = { id: string; name: string };

export default function StudentReviewScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<CollegeOption[]>([]);
  const [cacheBump, setCacheBump] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | undefined>(undefined);

  const colleges = trpc.students.getAllColleges.useQuery({ search: query || undefined, onlyVerified: false, limit: 50, offset }, { staleTime: 60_000 });

  const ids = selected.map(s => s.id);
  const names = selected.map(s => s.name);

  const risk = trpc.students.getRiskByColleges.useQuery({ collegeIds: ids.length ? ids : undefined, collegeNames: names.length ? names : undefined, cacheKey: String(cacheBump) }, { enabled: selected.length > 0, staleTime: 5 * 60_000 });

  const total = risk.data?.total ?? 0;
  const counts = risk.data?.counts ?? { minimal: 0, mild: 0, moderate: 0, severe: 0 };

  const onToggleCollege = useCallback((opt: CollegeOption) => {
    setSelected(prev => {
      const exists = prev.some(p => p.id === opt.id);
      if (exists) {
        return prev.filter(p => p.id !== opt.id);
      }
      return [...prev, opt];
    });
  }, []);

  const onRefresh = useCallback(() => {
    setCacheBump(v => v + 1);
    risk.refetch();
  }, [risk]);

  const onBarPress = useCallback((bucket: Bucket) => {
    setSelectedBucket(bucket);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="admin-student-review">
      <Text style={styles.title}>College Filter</Text>
      <View style={styles.searchWrap}>
        <Search size={16} color={Colors.text.secondary} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search colleges"
          placeholderTextColor={Colors.text.light}
          testID="college-filter"
        />
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} testID="refresh-risk">
          <RefreshCcw size={16} color={Colors.text.white} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {colleges.isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <>
          <FlatList
            data={colleges.data?.colleges ?? []}
            keyExtractor={(c) => c.id}
            style={styles.collegeList}
            renderItem={({ item }) => {
              const active = selected.some(s => s.id === item.id);
              return (
                <TouchableOpacity style={[styles.collegeItem, active ? styles.collegeItemActive : undefined]} onPress={() => onToggleCollege({ id: item.id, name: item.name })} testID={`college-opt-${item.id}`}>
                  <Text style={styles.collegeText}>{item.name}</Text>
                  {active ? <Text style={styles.sel}>Selected</Text> : null}
                </TouchableOpacity>
              );
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          {(colleges.data?.hasMore ?? false) && (
            <TouchableOpacity style={styles.loadMore} onPress={() => setOffset(o => o + 50)} testID="colleges-load-more">
              <Text style={styles.loadMoreText}>Load more</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {selected.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Select one or more colleges to see risk distribution</Text>
        </View>
      ) : risk.isFetching ? (
        <ActivityIndicator color={Colors.primary} />
      ) : total === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No data available for selected college.</Text>
        </View>
      ) : (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <BarChart3 size={18} color={Colors.primary} />
            <Text style={styles.chartTitle}>Risk Distribution</Text>
            <Text style={styles.chartSub}>Total {total}</Text>
          </View>
          <BarChart counts={counts} onPress={onBarPress} />
          <View style={styles.legendRow}>
            <Legend color={Colors.success} label="Minimal" value={counts.minimal} />
            <Legend color={'#FFB74D'} label="Mild" value={counts.mild} />
            <Legend color={Colors.warning} label="Moderate" value={counts.moderate} />
            <Legend color={Colors.error} label="Severe" value={counts.severe} />
          </View>
        </View>
      )}

      {!!selectedBucket && (
        <StudentList bucket={selectedBucket} ids={ids} names={names} onClose={() => setSelectedBucket(undefined)} />)
      }
    </View>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}: {value}</Text>
    </View>
  );
}

function BarChart({ counts, onPress }: { counts: Record<Bucket, number>; onPress: (b: Bucket) => void }) {
  const data = useMemo(() => ([
    { key: 'minimal' as const, label: 'Minimal', color: Colors.success },
    { key: 'mild' as const, label: 'Mild', color: '#FFB74D' },
    { key: 'moderate' as const, label: 'Moderate', color: Colors.warning },
    { key: 'severe' as const, label: 'Severe', color: Colors.error },
  ]), []);

  const max = Math.max(1, ...data.map(d => counts[d.key] ?? 0));

  return (
    <View style={styles.barWrap}>
      {data.map(d => {
        const val = counts[d.key] ?? 0;
        const heightPct = (val / max) * 100;
        return (
          <TouchableOpacity key={d.key} style={styles.barItem} onPress={() => onPress(d.key)} accessibilityRole="button" accessibilityLabel={`${d.label} ${val} students`} testID={`bar-${d.key}`}>
            <View style={[styles.bar, { height: `${heightPct}%`, backgroundColor: d.color }]} />
            <Text style={styles.barLabel}>{d.label}</Text>
            <Text style={styles.barValue}>{val}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function StudentList({ bucket, ids, names, onClose }: { bucket: Bucket; ids: string[]; names: string[]; onClose: () => void }) {
  const list = trpc.students.getStudentsByCollegesAndRiskBucket.useQuery({ collegeIds: ids.length ? ids : undefined, collegeNames: names.length ? names : undefined, bucket, limit: 50, offset: 0 }, { staleTime: 60_000 });
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>Students in {bucket}</Text>
        <TouchableOpacity onPress={onClose} testID="close-detail">
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
      {list.isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <FlatList
          data={list.data?.students ?? []}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <View style={styles.studentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.fullName}</Text>
                <Text style={styles.studentSub}>{item.email} • {item.course}</Text>
              </View>
              <Text style={styles.score}>{item.riskScore}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          style={{ maxHeight: 260 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginTop: 8, marginBottom: 6 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, padding: 10, borderRadius: 12 },
  input: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  refreshText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },
  collegeList: { marginTop: 10, maxHeight: 64 },
  loadMore: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceLight },
  loadMoreText: { color: Colors.text.primary, fontSize: 12, fontWeight: '600' },
  collegeItem: { backgroundColor: Colors.surface, borderColor: Colors.surfaceLight, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginRight: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  collegeItemActive: { borderColor: Colors.primary },
  collegeText: { color: Colors.text.primary, fontSize: 14 },
  sel: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: Colors.text.secondary, fontSize: 14 },
  chartCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 12, marginTop: 16, borderWidth: 1, borderColor: Colors.surfaceLight },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  chartSub: { marginLeft: 'auto', fontSize: 12, color: Colors.text.secondary },
  barWrap: { height: 220, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 8 },
  barItem: { alignItems: 'center', width: '22%' },
  bar: { width: '100%', borderRadius: 8 },
  barLabel: { marginTop: 6, fontSize: 12, color: Colors.text.secondary },
  barValue: { marginTop: 2, fontSize: 12, fontWeight: '700', color: Colors.text.primary },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.text.secondary },
  detailCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 12, marginTop: 12, borderWidth: 1, borderColor: Colors.surfaceLight },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  closeText: { marginLeft: 'auto', color: Colors.primary, fontSize: 12, fontWeight: '700' },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  studentName: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  studentSub: { fontSize: 12, color: Colors.text.secondary },
  score: { fontSize: 12, fontWeight: '700', color: Colors.text.primary },
});
