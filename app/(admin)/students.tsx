import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Filter, Search, Users, ShieldAlert, ShieldCheck, ChevronDown } from 'lucide-react-native';

 type Risk = 'all' | 'low' | 'medium' | 'high';

 export default function AdminStudents() {
  const insets = useSafeAreaInsets();
  const [collegeQuery, setCollegeQuery] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | undefined>(undefined);
  const [selectedCollegeName, setSelectedCollegeName] = useState<string | undefined>(undefined);
  const [risk, setRisk] = useState<Risk>('all');
  const [search, setSearch] = useState<string>('');

  const collegesQuery = trpc.students.getAllColleges.useQuery({ search: collegeQuery || undefined, onlyVerified: false, limit: 50, offset: 0 });

  const studentsQuery = trpc.students.getByCollege.useQuery({
    collegeId: selectedCollegeId,
    collegeName: selectedCollegeName,
    riskLevel: risk,
    search: search || undefined,
    sortBy: 'riskScore',
    sortOrder: 'desc',
    limit: 50,
    offset: 0,
  }, { enabled: Boolean(selectedCollegeId || selectedCollegeName) });

  const statsQuery = trpc.students.getCollegeStats.useQuery(undefined, { staleTime: 30_000 });

  const onSelectCollege = useCallback((id: string, name: string) => {
    console.log('[AdminStudents] Select college', id, name);
    setSelectedCollegeId(id);
    setSelectedCollegeName(name);
  }, []);

  const riskPill = useCallback((level: Risk) => {
    const isActive = risk === level;
    const map: Record<Risk, { label: string; color: string; bg: string }> = {
      all: { label: 'All', color: Colors.text.primary, bg: Colors.surfaceLight },
      low: { label: 'Low', color: Colors.success, bg: Colors.success + '20' },
      medium: { label: 'Medium', color: Colors.warning, bg: Colors.warning + '20' },
      high: { label: 'High', color: Colors.error, bg: Colors.error + '20' },
    };
    const cfg = map[level];
    return (
      <TouchableOpacity
        key={level}
        testID={`risk-${level}`}
        onPress={() => setRisk(level)}
        style={[styles.pill, { backgroundColor: isActive ? cfg.color : cfg.bg }]}
      >
        <Text style={[styles.pillText, { color: isActive ? Colors.text.white : cfg.color }]}>{cfg.label}</Text>
      </TouchableOpacity>
    );
  }, [risk]);

  const renderStudent = useCallback(({ item }: { item: any }) => {

    return (
      <View style={styles.studentRow} testID={`student-${item.id}`}>
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{item.fullName}</Text>
          <Text style={styles.studentSub}>{item.email} • {item.course} • {item.year}</Text>
        </View>
        <View style={styles.riskBadge}>
          <Text style={[styles.riskBadgeText, item.riskLevel === 'high' ? styles.riskTextHigh : item.riskLevel === 'medium' ? styles.riskTextMed : styles.riskTextLow]}>{item.riskLevel.toUpperCase()} • {item.riskScore}</Text>
        </View>
      </View>
    );
  }, []);

  const header = useMemo(() => (
    <View>
      <Text style={styles.title}>Student Management</Text>
      <Text style={styles.subtitle}>Filter by college and risk level</Text>

      <View style={styles.filtersCard}>
        <View style={styles.filterRow}>
          <View style={styles.searchWrap}>
            <Search size={16} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, email, course"
              placeholderTextColor={Colors.text.light}
              testID="student-search"
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.searchWrap}>
            <Filter size={16} color={Colors.text.secondary} />
            <TextInput
              style={styles.input}
              value={collegeQuery}
              onChangeText={setCollegeQuery}
              placeholder="College"
              placeholderTextColor={Colors.text.light}
              testID="college-search"
            />
            <ChevronDown size={16} color={Colors.text.secondary} />
          </View>
        </View>

        {collegesQuery.isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <FlatList
            data={collegesQuery.data?.colleges ?? []}
            keyExtractor={(c) => c.id}
            style={styles.collegeList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.collegeItem, selectedCollegeId === item.id ? styles.collegeItemActive : undefined]}
                onPress={() => onSelectCollege(item.id, item.name)}
                testID={`college-${item.id}`}
              >
                <Users size={16} color={Colors.text.secondary} />
                <Text style={styles.collegeText}>{item.name}</Text>
                {item.isVerified ? <ShieldCheck size={16} color={Colors.success} /> : <ShieldAlert size={16} color={Colors.warning} />}
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.pillsRow}>
          {(['all','low','medium','high'] as Risk[]).map((r) => riskPill(r))}
        </View>
      </View>

      {statsQuery.data && (
        <View style={styles.statsRow}>
          <Text style={styles.stat}>Total: {studentsQuery.data?.total ?? 0}</Text>
          <Text style={styles.stat}>Low: {studentsQuery.data?.stats.byRiskLevel.low ?? 0}</Text>
          <Text style={styles.stat}>Med: {studentsQuery.data?.stats.byRiskLevel.medium ?? 0}</Text>
          <Text style={styles.stat}>High: {studentsQuery.data?.stats.byRiskLevel.high ?? 0}</Text>
        </View>
      )}
    </View>
  ), [collegeQuery, collegesQuery.data, collegesQuery.isLoading, onSelectCollege, risk, riskPill, search, selectedCollegeId, statsQuery.data, studentsQuery.data?.stats, studentsQuery.data?.total]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="admin-students">
      <View>{header}</View>
      <View style={styles.listCard}>
        {studentsQuery.isFetching && (
          <ActivityIndicator color={Colors.primary} />
        )}
        {!studentsQuery.isFetching && (studentsQuery.data?.students?.length ?? 0) === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Select a college to view students</Text>
          </View>
        )}
        <FlatList
          data={studentsQuery.data?.students ?? []}
          keyExtractor={(s) => s.id}
          renderItem={renderStudent}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
 }

 const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginTop: 8 },
  subtitle: { fontSize: 13, color: Colors.text.secondary, marginTop: 4, marginBottom: 12 },
  filtersCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 12, gap: 10 },
  filterRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: Colors.surfaceLight },
  input: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  collegeList: { maxHeight: 160, marginTop: 6 },
  collegeItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8 },
  collegeItemActive: { backgroundColor: Colors.primary + '10' },
  collegeText: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  pillsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  stat: { fontSize: 12, color: Colors.text.secondary },
  listCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12, marginTop: 12 },
  sep: { height: 1, backgroundColor: Colors.surfaceLight },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  studentName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  studentSub: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.surfaceLight },
  riskBadgeText: { fontSize: 12, fontWeight: '700' },
  riskTextHigh: { color: Colors.error },
  riskTextMed: { color: Colors.warning },
  riskTextLow: { color: Colors.success },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: Colors.text.secondary, fontSize: 14 },
});
