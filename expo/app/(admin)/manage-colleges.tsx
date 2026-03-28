import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';
import { api } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Check, MapPin } from 'lucide-react-native';

export default function ManageColleges() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState<string>('');
  const [newCollege, setNewCollege] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const collegesQuery = api.students.getAllColleges.useQuery({ search: search || undefined, onlyVerified: false, limit: 100, offset: 0 });
  const addCollege = api.students.addCollege.useMutation();
  const verifyCollege = api.students.verifyCollege.useMutation();

  const handleAdd = useCallback(async () => {
    const name = (newCollege || '').trim();
    if (!name) return;
    try {
      await addCollege.mutateAsync({ name, location: location || undefined, isVerified: false });
      setNewCollege('');
      setLocation('');
      collegesQuery.refetch();
    } catch (e) {
      console.log('[ManageColleges] add error', e);
    }
  }, [newCollege, location, addCollege, collegesQuery]);

  const handleVerify = useCallback(async (collegeId: string) => {
    try {
      await verifyCollege.mutateAsync({ collegeId });
      collegesQuery.refetch();
    } catch (e) {
      console.log('[ManageColleges] verify error', e);
    }
  }, [verifyCollege, collegesQuery]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="admin-manage-colleges">
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
          style={[styles.input, { flex: 0.8 }]}
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
              <View style={styles.itemContent}>
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
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginTop: 8 },
  subtitle: { fontSize: 13, color: Colors.text.secondary, marginTop: 4, marginBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.surface, padding: 10, borderRadius: 12 },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.surface, padding: 10, borderRadius: 12, marginTop: 10 },
  input: { flex: 1, color: Colors.text.primary, fontSize: 14, backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: Colors.surfaceLight },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: Colors.text.white, fontSize: 14, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  itemContent: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  itemLocation: { fontSize: 12, color: Colors.text.secondary },
  itemMeta: { fontSize: 12, color: Colors.text.secondary, marginTop: 4 },
  verifyButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  verifyText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },
  sep: { height: 1, backgroundColor: Colors.surfaceLight },
});
