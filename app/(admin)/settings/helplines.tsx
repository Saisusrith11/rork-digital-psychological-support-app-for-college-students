import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { useOffline } from '@/hooks/offline-store';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react-native';
import { trpcClient } from '@/lib/trpc';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface FormState {
  id: string;
  name: string;
  phone: string;
  region?: string;
}

export default function HelplineManagementScreen() {
  const { helplines, addHelpline, removeHelpline, syncing } = useOffline();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<FormState | null>(null);

  const getAll = useQuery({
    queryKey: ['helplines.getAll'],
    queryFn: () => trpcClient.helplines.getAll.query(),
    staleTime: 30_000,
  });

  const data = useMemo(() => helplines, [helplines]);

  const onSave = async () => {
    if (!editing) return;
    const trimmed: FormState = { ...editing, name: editing.name.trim(), phone: editing.phone.trim() };
    if (!trimmed.name || !trimmed.phone) {
      Alert.alert('Validation', 'Name and phone are required.');
      return;
    }
    const payload = { id: trimmed.id || `${Date.now()}`, name: trimmed.name, phone: trimmed.phone, region: trimmed.region, updatedAt: new Date().toISOString() };
    await addHelpline(payload as any);
    try {
      await trpcClient.helplines.upsertMany.mutate({ helplines: [payload as any] });
      await queryClient.invalidateQueries({ queryKey: ['helplines.getAll'] });
    } catch (e) {
      console.log('[helplines] upsertMany failed, will sync later', e);
    }
    setEditing(null);
  };

  const onDelete = async (id: string) => {
    await removeHelpline(id);
    try {
      await trpcClient.helplines.upsertMany.mutate({ helplines: [{ id, name: '', phone: '', updatedAt: new Date().toISOString(), deleted: true }] as any });
      await queryClient.invalidateQueries({ queryKey: ['helplines.getAll'] });
    } catch (e) {
      console.log('[helplines] delete sync failed, will retry', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Helpline Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setEditing({ id: '', name: '', phone: '', region: '' })} testID="add-helpline-button">
          <Plus size={18} color={Colors.text.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {editing && (
        <View style={styles.form} testID="helpline-form">
          <TextInput placeholder="Name" value={editing.name} onChangeText={(t) => setEditing({ ...editing, name: t })} style={styles.input} autoCapitalize="words" />
          <TextInput placeholder="Phone (e.g., +91...)" value={editing.phone} onChangeText={(t) => setEditing({ ...editing, phone: t })} style={styles.input} keyboardType={Platform.OS === 'web' ? 'default' : 'phone-pad'} />
          <TextInput placeholder="Region (optional)" value={editing.region ?? ''} onChangeText={(t) => setEditing({ ...editing, region: t })} style={styles.input} />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveBtn} onPress={onSave} testID="save-helpline">
              <Save size={18} color={Colors.text.white} />
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(null)} testID="cancel-helpline">
              <X size={18} color={Colors.text.white} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub}>{item.phone}{item.region ? ` · ${item.region}` : ''}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setEditing({ id: item.id, name: item.name, phone: item.phone, region: item.region })} accessibilityLabel={`edit-${item.id}`}>
              <Edit3 size={18} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(item.id)} accessibilityLabel={`delete-${item.id}`}>
              <Trash2 size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No helplines yet. Add one to get started.</Text>}
        contentContainerStyle={styles.listContent}
        testID="helplines-list"
      />

      <Text style={styles.syncHint}>{syncing ? 'Syncing…' : 'Synced'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, color: Colors.text.primary, fontWeight: '700' },
  addBtn: { backgroundColor: Colors.primary, flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  addBtnText: { color: Colors.text.white, fontWeight: '700' },
  form: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.surfaceLight, marginBottom: 12 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.surfaceLight, padding: 10, borderRadius: 8, marginBottom: 8, color: Colors.text.primary },
  formActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  saveBtn: { backgroundColor: Colors.success, flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  saveBtnText: { color: Colors.text.white, fontWeight: '700' },
  cancelBtn: { backgroundColor: Colors.text.secondary, flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  cancelBtnText: { color: Colors.text.white, fontWeight: '700' },
  item: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.surfaceLight, flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemLeft: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  itemSub: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  iconBtn: { padding: 8 },
  empty: { textAlign: 'center', color: Colors.text.secondary, marginTop: 24 },
  listContent: { gap: 8, paddingBottom: 40 },
  syncHint: { textAlign: 'center', color: Colors.text.secondary, marginTop: 8 },
});
