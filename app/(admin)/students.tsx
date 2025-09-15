import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Filter, Search, Users, ShieldAlert, ShieldCheck, ChevronDown, Plus, Check, MapPin } from 'lucide-react-native';

type Risk = 'all' | 'low' | 'medium' | 'high';
type AdminTab = 'students' | 'manageColleges';

export default function AdminStudents() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AdminTab>('students');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="admin-students">
      <TopTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'students' ? <StudentsPanel /> : <ManageCollegesPanel />}
    </View>
  );
}

const TopTabs = memo(function TopTabs({ activeTab, onChange }: { activeTab: AdminTab; onChange: (t: AdminTab) => void }) {
  const Tab = ({ id, label }: { id: AdminTab; label: string }) => {
    const active = activeTab === id;
    return (
      <TouchableOpacity
        onPress={() => onChange(id)}
        style={styles.tabItem}
        testID={`tab-${id}`}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        <View style={styles.tabTriangleWrap}>
          {active ? <View style={styles.triangle} /> : <View style={styles.trianglePlaceholder} />}
        </View>
        <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.tabsRow}>
      <Tab id="students" label="students" />
      <Tab id="manageColleges" label="manage-colleges" />
    </View>
  );
});

function StudentsPanel() {
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
        <View style={styles.flex1}>
          <Text style={styles.studentName}>{item.fullName}</Text>
          <Text style={styles.studentSub}>{item.email} • {item.course} • {item.year}</Text>
        </View>
        <View style={styles.riskBadge}>
          <Text style={[
            styles.riskBadgeText,
            item.riskLevel === 'high' ? styles.riskTextHigh : item.riskLevel === 'medium' ? styles.riskTextMed : styles.riskTextLow,
          ]}>{String(item.riskLevel).toUpperCase()} • {item.riskScore}</Text>
        </View>
      </View>
    );
  }, []);

  const Header = memo(function HeaderComp() {
    return (
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
            <Text style={styles.stat}>Low: {studentsQuery.data?.stats?.byRiskLevel?.low ?? 0}</Text>
            <Text style={styles.stat}>Med: {studentsQuery.data?.stats?.byRiskLevel?.medium ?? 0}</Text>
            <Text style={styles.stat}>High: {studentsQuery.data?.stats?.byRiskLevel?.high ?? 0}</Text>
          </View>
        )}
      </View>
    );
  });

  return (
    <View style={styles.sectionCard}>
      <Header />
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

function ManageCollegesPanel() {
  const [search, setSearch] = useState<string>('');
  const [newCollege, setNewCollege] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const collegesQuery = trpc.students.getAllColleges.useQuery({ search: search || undefined, onlyVerified: false, limit: 100, offset: 0 });
  const addCollege = trpc.students.addCollege.useMutation();
  const verifyCollege = trpc.students.verifyCollege.useMutation();

  const handleAdd = useCallback(async () => {
    const name = (newCollege || '').trim();
    if (!name) return;
    try {
      await addCollege.mutateAsync({ name, location: location || undefined, isVerified: false });
      setNewCollege('');
      setLocation('');
      await collegesQuery.refetch();
    } catch (e) {
      console.log('[ManageCollegesPanel] add error', e);
    }
  }, [newCollege, location]);

  const handleVerify = useCallback(async (collegeId: string) => {
    try {
      await verifyCollege.mutateAsync({ collegeId });
      await collegesQuery.refetch();
    } catch (e) {
      console.log('[ManageCollegesPanel] verify error', e);
    }
  }, []);

  return (
    <View style={styles.sectionCard} testID="admin-manage-colleges-panel">
      <Text style={styles.title}>Manage Colleges</Text>
      <Text style={styles.subtitle}>Add, search, and verify college names submitted by students</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Search colleges"
          placeholderTextColor={Colors.text.light}
          testID="college-search"
        />
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={newCollege}
          onChangeText={setNewCollege}
          placeholder="New college name"
          placeholderTextColor={Colors.text.light}
          testID="new-college"
        />
        <TextInput
          style={styles.inputNarrow}
          value={location}
          onChangeText={setLocation}
          placeholder="Location (optional)"
          placeholderTextColor={Colors.text.light}
          testID="new-college-location"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} testID="add-college">
          <Plus size={18} color={Colors.text.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {collegesQuery.isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <FlatList
          data={collegesQuery.data?.colleges ?? []}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.flex1}>
                <Text style={styles.itemName}>{item.name}</Text>
                {!!item.location && (
                  <View style={styles.locationRow}>
                    <MapPin size={12} color={Colors.text.secondary} />
                    <Text style={styles.itemLocation}>{item.location}</Text>
                  </View>
                )}
                <Text style={styles.itemMeta}>{item.studentCount} students • {item.isVerified ? 'Verified' : 'Unverified'}</Text>
              </View>
              {!item.isVerified && (
                <TouchableOpacity style={styles.verifyButton} onPress={() => handleVerify(item.id)} testID={`verify-${item.id}`}>
                  <Check size={16} color={Colors.text.white} />
                  <Text style={styles.verifyText}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  sectionCard: { flex: 1 },
  tabsRow: { flexDirection: 'row', gap: 18, alignItems: 'flex-end', paddingTop: 6, marginBottom: 6 },
  tabItem: { alignItems: 'center' },
  tabTriangleWrap: { height: 10, justifyContent: 'flex-end' },
  triangle: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 8, borderStyle: 'solid', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: Colors.primary, marginBottom: 4 },
  trianglePlaceholder: { width: 0, height: 8, marginBottom: 4 },
  tabText: { fontSize: 14, fontWeight: '700' as const },
  tabTextActive: { color: Colors.primary },
  tabTextInactive: { color: Colors.text.secondary },

  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginTop: 8 },
  subtitle: { fontSize: 13, color: Colors.text.secondary, marginTop: 4, marginBottom: 12 },
  filtersCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 12, gap: 10 },
  filterRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: Colors.surfaceLight },
  input: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  inputNarrow: { flex: 0.8, color: Colors.text.primary, fontSize: 14, backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: Colors.surfaceLight },
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

  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.surface, padding: 10, borderRadius: 12 },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.surface, padding: 10, borderRadius: 12, marginTop: 10 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: Colors.text.white, fontSize: 14, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  flex1: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  itemLocation: { fontSize: 12, color: Colors.text.secondary },
  itemMeta: { fontSize: 12, color: Colors.text.secondary, marginTop: 4 },
  verifyButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  verifyText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },
});
