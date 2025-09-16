import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Colors } from '@/constants/colors';
import { Upload } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';

interface FormState {
  title: string;
  description: string;
  points: string;
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe' | '';
  category: 'mood' | 'mindfulness' | 'social' | 'education' | 'crisis' | 'goal' | '';
  duration?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export default function CounselorActivitiesScreen() {
  const { user } = useAuth();
  const isAllowed = user?.role === 'admin' || user?.role === 'counselor';

  const [form, setForm] = useState<FormState>({
    title: '', description: '', points: '', riskLevel: '', category: '', duration: '', mediaUrl: '', mediaType: undefined,
  });

  const { data, isLoading, refetch } = trpc.activities.getAll.useQuery({ riskLevel: 'all', limit: 100 });
  const createMutation = trpc.activities.create.useMutation({ onSuccess: async () => { await refetch(); } });

  const activities = data?.activities ?? [];

  const canSubmit = useMemo(() => (
    !!form.title.trim() && !!form.description.trim() && !!form.points.trim() && !isNaN(Number(form.points)) && !!form.riskLevel && !!form.category
  ), [form]);

  const handleSubmit = useCallback(async () => {
    if (!isAllowed || !canSubmit) return;
    await createMutation.mutateAsync({
      title: form.title.trim(), description: form.description.trim(), points: Number(form.points),
      riskLevel: form.riskLevel as any, category: form.category as any,
      duration: form.duration ? Number(form.duration) : undefined,
      mediaUrl: form.mediaUrl?.trim() || undefined,
      mediaType: form.mediaType,
    });
    setForm({ title: '', description: '', points: '', riskLevel: '', category: '', duration: '', mediaUrl: '', mediaType: undefined });
  }, [canSubmit, createMutation, form, isAllowed]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Activities', headerStyle: { backgroundColor: Colors.surface } }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Upload Wellness Activity</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm((f) => ({ ...f, title: t }))} placeholder="e.g., Mindful Walk" />
          <Text style={styles.label}>Description *</Text>
          <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={(t) => setForm((f) => ({ ...f, description: t }))} placeholder="Steps and benefits" multiline numberOfLines={4} />
          <Text style={styles.label}>Points *</Text>
          <TextInput style={styles.input} value={form.points} keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'} onChangeText={(t) => setForm((f) => ({ ...f, points: t }))} placeholder="e.g., 20" />
          <Text style={styles.label}>Risk Level *</Text>
          <View style={styles.pills}>
            {(['minimal','mild','moderate','severe'] as const).map((r) => (
              <TouchableOpacity key={r} style={[styles.pill, form.riskLevel === r && styles.pillActive]} onPress={() => setForm((f) => ({ ...f, riskLevel: r }))}>
                <Text style={[styles.pillText, form.riskLevel === r && styles.pillTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pills}>
            {(['mood','mindfulness','social','education','crisis','goal'] as const).map((c) => (
              <TouchableOpacity key={c} style={[styles.pill, form.category === c && styles.pillActive]} onPress={() => setForm((f) => ({ ...f, category: c }))}>
                <Text style={[styles.pillText, form.category === c && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Optional Media URL</Text>
          <TextInput style={styles.input} value={form.mediaUrl} onChangeText={(t) => setForm((f) => ({ ...f, mediaUrl: t }))} placeholder="https://..." />
          <View style={styles.pills}>
            {(['image','video'] as const).map((mt) => (
              <TouchableOpacity key={mt} style={[styles.pill, form.mediaType === mt && styles.pillActive]} onPress={() => setForm((f) => ({ ...f, mediaType: mt }))}>
                <Text style={[styles.pillText, form.mediaType === mt && styles.pillTextActive]}>{mt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.submitBtn, (!isAllowed || !canSubmit) && styles.btnDisabled]} disabled={!isAllowed || !canSubmit} onPress={handleSubmit}>
            <Upload size={20} color={Colors.surface} />
            <Text style={styles.submitText}>Add Activity</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginBottom: 8 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  label: { color: Colors.text.primary, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: Colors.background, borderRadius: 12, padding: 12, color: Colors.text.primary },
  textarea: { height: 100, textAlignVertical: 'top' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceLight },
  pillActive: { backgroundColor: Colors.primary + '20' },
  pillText: { color: Colors.text.secondary, fontWeight: '600' },
  pillTextActive: { color: Colors.primary },
  submitBtn: { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: Colors.surface, fontWeight: '700' },
});
