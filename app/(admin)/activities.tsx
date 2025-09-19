import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { api } from '@/lib/api';
import { Colors } from '@/constants/colors';
import { Image as ExpoImage } from 'expo-image';
import { Upload, PlayCircle, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface FormState {
  title: string;
  description: string;
  points: string;
  riskLevel: 'low' | 'medium' | 'high' | 'all' | '';
  category: 'mood' | 'mindfulness' | 'social' | 'education' | 'crisis' | 'goal' | '';
  duration?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export default function AdminActivitiesScreen() {
  const { user } = useAuth();
  const isAllowed = user?.role === 'admin' || user?.role === 'counselor';

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    points: '',
    riskLevel: '',
    category: '',
    duration: '',
    mediaUrl: '',
    mediaType: undefined,
  });

  const { data, isLoading } = api.activities.getAll.useQuery({ riskLevel: 'all', limit: 100 });
  
  const createMutation = api.activities.create.useMutation({
    onSuccess: () => {
      console.log('Activity created successfully');
      setForm({ title: '', description: '', points: '', riskLevel: '', category: '', duration: '', mediaUrl: '', mediaType: undefined });
    },
    onError: (error: any) => {
      console.error('Error creating activity:', error);
    }
  });
  
  const deleteMutation = api.activities.delete.useMutation({
    onSuccess: () => {
      console.log('Activity deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting activity:', error);
    }
  });

  const activities = data?.activities ?? [];

  const canSubmit = useMemo(() => {
    return (
      !!form.title.trim() &&
      !!form.description.trim() &&
      !!form.points.trim() && !isNaN(Number(form.points)) &&
      !!form.riskLevel &&
      !!form.category
    );
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!isAllowed) {
      console.log('Access denied: You do not have permission to add activities.');
      return;
    }
    if (!canSubmit) {
      console.log('Missing fields: Please fill all required fields.');
      return;
    }

    if (!form.category || !form.riskLevel) {
      console.log('Missing required fields: category and risk level are required.');
      return;
    }

    try {
      const activityData = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: 'wellness' as const,
        category: form.category as string,
        points: Number(form.points),
        riskLevel: form.riskLevel as 'low' | 'medium' | 'high' | 'all',
        duration: form.duration ? Number(form.duration) : 0,
        mediaUrl: form.mediaUrl?.trim() || undefined,
        mediaType: form.mediaType,
      };
      
      (createMutation as any).mutate(activityData);
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  }, [canSubmit, createMutation, form, isAllowed]);

  const handleDelete = useCallback(async (id: string) => {
    if (!isAllowed) return;
    try {
      (deleteMutation as any).mutate({ id });
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  }, [deleteMutation, isAllowed]);

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Activities', headerStyle: { backgroundColor: Colors.surface } }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Upload Wellness Activity</Text>
        {!isAllowed && (
          <Text style={styles.note}>Login as admin or counselor to create activities.</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
            placeholder="e.g., Gratitude Journaling"
            testID="activity-title"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.description}
            onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
            placeholder="Detailed instructions and benefits"
            multiline
            numberOfLines={4}
            testID="activity-description"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Points *</Text>
              <TextInput
                style={styles.input}
                value={form.points}
                keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
                onChangeText={(t) => setForm((f) => ({ ...f, points: t }))}
                placeholder="e.g., 15"
                testID="activity-points"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Duration (min)</Text>
              <TextInput
                style={styles.input}
                value={form.duration}
                keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
                onChangeText={(t) => setForm((f) => ({ ...f, duration: t }))}
                placeholder="e.g., 10"
                testID="activity-duration"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Risk Level *</Text>
              <View style={styles.pills}>
                {(['low','medium','high','all'] as const).map((r) => (
                  <TouchableOpacity key={r} style={[styles.pill, form.riskLevel === r && styles.pillActive]} onPress={() => setForm((f) => ({ ...f, riskLevel: r }))}>
                    <Text style={[styles.pillText, form.riskLevel === r && styles.pillTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.pills}>
                {(['mood','mindfulness','social','education','crisis','goal'] as const).map((c) => (
                  <TouchableOpacity key={c} style={[styles.pill, form.category === c && styles.pillActive]} onPress={() => setForm((f) => ({ ...f, category: c }))}>
                    <Text style={[styles.pillText, form.category === c && styles.pillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Optional Media URL</Text>
          <TextInput
            style={styles.input}
            value={form.mediaUrl}
            onChangeText={(t) => setForm((f) => ({ ...f, mediaUrl: t }))}
            placeholder="https://... (image or video)"
            testID="activity-media-url"
          />
          <View style={styles.pills}>
            {(['image','video'] as const).map((mt) => (
              <TouchableOpacity key={mt} style={[styles.pill, form.mediaType === mt && styles.pillActive]} onPress={() => setForm((f) => ({ ...f, mediaType: mt }))}>
                <Text style={[styles.pillText, form.mediaType === mt && styles.pillTextActive]}>{mt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.submitBtn, !canSubmit && styles.btnDisabled]} onPress={handleSubmit} disabled={!canSubmit} testID="submit-activity">
            <Upload size={20} color={Colors.surface} />
            <Text style={styles.submitText}>Add Activity</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subheading}>Existing Activities</Text>
        {isLoading && <Text style={styles.note}>Loading...</Text>}
        {activities.map((a) => (
          <View key={a.id} style={styles.activityItem} testID={`admin-activity-${a.id}`}>
            <View style={styles.activityHeader}>
              <View style={styles.activityMeta}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activitySubtitle}>{a.category} • {a.riskLevel} • {a.points} WP {a.duration ? `• ${a.duration} min` : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(a.id)}>
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={styles.desc}>{a.description}</Text>
            {!!a.mediaUrl && a.mediaUrl.trim() && (
              <View style={styles.mediaPreview}>
                {a.mediaType === 'image' ? (
                  <ExpoImage source={{ uri: a.mediaUrl }} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={styles.videoPreview}>
                    <PlayCircle size={24} color={Colors.text.secondary} />
                    <Text style={styles.note}>Video: tap to open</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginBottom: 8 },
  subheading: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginVertical: 12 },
  note: { color: Colors.text.secondary, fontSize: 13 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  label: { color: Colors.text.primary, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: Colors.background, borderRadius: 12, padding: 12, color: Colors.text.primary },
  textarea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceLight },
  pillActive: { backgroundColor: Colors.primary + '20' },
  pillText: { color: Colors.text.secondary, fontWeight: '600' },
  pillTextActive: { color: Colors.primary },
  submitBtn: { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: Colors.surface, fontWeight: '700' },
  activityItem: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityMeta: { flex: 1, paddingRight: 12 },
  activityTitle: { color: Colors.text.primary, fontWeight: '700', fontSize: 16 },
  activitySubtitle: { color: Colors.text.secondary, marginTop: 4 },
  desc: { color: Colors.text.primary, marginTop: 8, lineHeight: 20 },
  mediaPreview: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: 160, borderRadius: 12 },
  videoPreview: { height: 160, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
});
