import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { PlusCircle, Upload, Trash2, Edit3, Eye, Video, FileAudio, FileText, Sparkles, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { trpc } from '@/lib/trpc';

const TYPES = ['video', 'audio', 'pdf', 'meditation'] as const;

type ResourceType = typeof TYPES[number];

type UploadState = {
  fileName: string;
  mimeType: string;
  base64: string;
  fileSize: number;
  fileUrl?: string;
};

export default function AdminResourcesScreen() {
  const insets = useSafeAreaInsets();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [type, setType] = useState<ResourceType>('video');
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const listQuery = trpc.resources.getAll.useQuery({ type: 'all', limit: 100, offset: 0 });
  const uploadMutation = trpc.resources.uploadFile.useMutation();
  const createMutation = trpc.resources.create.useMutation();
  const updateMutation = trpc.resources.update.useMutation();
  const deleteMutation = trpc.resources.delete.useMutation();

  useFocusEffect(
    useCallback(() => {
      listQuery.refetch();
    }, [listQuery])
  );

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory('');
    setType('video');
    setUpload(null);
    setEditingId(null);
  }, []);

  const onPickFile = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
      const anyRes = res as any;
      if (anyRes?.canceled) return;
      const asset = anyRes.assets?.[0];
      if (!asset) return;
      const uri: string = asset.uri as string;
      const name: string = (asset.name as string) ?? 'file';
      const mimeType: string = (asset.mimeType as string) ?? 'application/octet-stream';
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const info = await FileSystem.getInfoAsync(uri);
      const fileSize = (info as FileSystem.FileInfo).exists && 'size' in (info as any) && typeof (info as any).size === 'number' ? (info as any).size as number : Math.floor(base64.length * 0.75);

      const MAX = 5 * 1024 * 1024;
      if (fileSize > MAX) {
        Alert.alert('Too Large', 'Max file size is 5MB');
        return;
      }
      const allowedByType: Record<ResourceType, string[]> = {
        video: ['video/mp4', 'video/quicktime', 'video/webm'],
        audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/m4a', 'audio/webm'],
        pdf: ['application/pdf'],
        meditation: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/m4a', 'audio/webm'],
      } as const;
      const allowed = allowedByType[type];
      if (allowed && !allowed.includes(mimeType)) {
        Alert.alert('Invalid File', `Selected file type is not allowed for ${type.toUpperCase()}`);
        return;
      }

      setUpload({ fileName: name, mimeType, base64, fileSize });
    } catch (e) {
      Alert.alert('File Error', 'Failed to read selected file');
      console.log('AdminResources onPickFile error', e);
    }
  }, [type]);

  const onSubmit = useCallback(async () => {
    if (!title || !description || !category) {
      Alert.alert('Missing Fields', 'Please fill in title, description and category');
      return;
    }
    try {
      let fileUrl = upload?.fileUrl ?? '';
      let fileSize = upload?.fileSize ?? 0;
      if (!editingId) {
        if (!upload) {
          Alert.alert('Missing File', 'Please attach a file to upload');
          return;
        }
      }
      if (upload && !upload.fileUrl) {
        const uploaded = await uploadMutation.mutateAsync({ fileName: upload.fileName, fileData: upload.base64, mimeType: upload.mimeType });
        fileUrl = uploaded.fileUrl;
        fileSize = uploaded.fileSize ?? fileSize;
        setUpload(prev => prev ? { ...prev, fileUrl } : prev);
      }
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: { title, description, category, type, fileUrl, fileSize, mimeType: upload?.mimeType ?? 'application/octet-stream' } });
      } else {
        await createMutation.mutateAsync({ title, description, category, type, fileUrl, fileSize, mimeType: upload?.mimeType ?? 'application/octet-stream', tags: [] });
      }
      await utils.resources.getAll.invalidate();
      resetForm();
      Alert.alert('Success', editingId ? 'Resource updated' : 'Resource created');
    } catch (e) {
      Alert.alert('Error', 'Failed to save resource');
      console.log('AdminResources onSubmit error', e);
    }
  }, [title, description, category, type, upload, editingId, uploadMutation, createMutation, updateMutation, utils.resources.getAll, resetForm]);

  const onEdit = useCallback((r: any) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description);
    setCategory(r.category);
    setType(r.type as ResourceType);
    setUpload({ fileName: r.fileUrl.split('/').pop() ?? 'file', mimeType: r.mimeType, base64: '', fileSize: r.fileSize ?? 0, fileUrl: r.fileUrl });
  }, []);

  const onDelete = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await utils.resources.getAll.invalidate();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete resource');
      console.log('AdminResources onDelete error', e);
    }
  }, [deleteMutation, utils.resources.getAll]);

  const grouped = useMemo(() => {
    const data = listQuery.data?.resources ?? [];
    return {
      video: data.filter(r => r.type === 'video'),
      audio: data.filter(r => r.type === 'audio'),
      pdf: data.filter(r => r.type === 'pdf'),
      meditation: data.filter(r => r.type === 'meditation'),
    } as Record<ResourceType, any[]>;
  }, [listQuery.data]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header} testID="admin-res-header">Manage Resources</Text>
        <View style={styles.formCard} testID="admin-res-form">
          <Text style={styles.formTitle}>{editingId ? 'Edit Resource' : 'Create Resource'}</Text>
          <TextInput testID="input-title" placeholder="Title" placeholderTextColor={Colors.text.light} style={styles.input} value={title} onChangeText={setTitle} />
          <TextInput testID="input-description" placeholder="Description" placeholderTextColor={Colors.text.light} style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} multiline />
          <TextInput testID="input-category" placeholder="Category" placeholderTextColor={Colors.text.light} style={styles.input} value={category} onChangeText={setCategory} />
          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity testID={`type-${t}`} key={t} style={[styles.typeChip, type === t && styles.typeChipActive]} onPress={() => setType(t)}>
                {t === 'video' && <Video size={16} color={type === t ? Colors.surface : Colors.text.secondary} />}
                {t === 'audio' && <FileAudio size={16} color={type === t ? Colors.surface : Colors.text.secondary} />} 
                {t === 'pdf' && <FileText size={16} color={type === t ? Colors.surface : Colors.text.secondary} />} 
                {t === 'meditation' && <Sparkles size={16} color={type === t ? Colors.surface : Colors.text.secondary} />} 
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.uploadRow}>
            <TouchableOpacity testID="btn-pick" style={styles.uploadBtn} onPress={onPickFile}>
              <Upload size={16} color={Colors.surface} />
              <Text style={styles.uploadText}>{upload ? 'Change File' : 'Pick File'}</Text>
            </TouchableOpacity>
            {upload && (
              <View style={styles.fileInfo}>
                <Check size={16} color={Colors.success} />
                <Text style={styles.fileInfoText} numberOfLines={1}>{upload.fileName}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity testID="btn-submit" style={styles.primaryBtn} onPress={onSubmit} disabled={uploadMutation.isPending || createMutation.isPending || updateMutation.isPending}>
            {(uploadMutation.isPending || createMutation.isPending || updateMutation.isPending) ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <>
                <PlusCircle size={18} color={Colors.surface} />
                <Text style={styles.primaryBtnText}>{editingId ? 'Save Changes' : 'Create Resource'}</Text>
              </>
            )}
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity testID="btn-cancel-edit" style={styles.secondaryBtn} onPress={resetForm}>
              <Text style={styles.secondaryBtnText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Library</Text>
          {listQuery.isLoading && <ActivityIndicator color={Colors.primary} />}
          {listQuery.error && <Text style={styles.empty}>Failed to load</Text>}
          {!listQuery.isLoading && !listQuery.error && (
            <>
              {(['video','audio','pdf','meditation'] as ResourceType[]).map(t => (
                <View key={t} style={styles.typeSection}>
                  <Text style={styles.typeHeader}>{t.toUpperCase()}</Text>
                  {grouped[t].length === 0 && <Text style={styles.empty}>No items</Text>}
                  {grouped[t].map((r) => (
                    <View key={r.id} style={styles.itemCard} testID={`res-${r.id}`}>
                      <View style={styles.flex1}>
                        <Text style={styles.itemTitle}>{r.title}</Text>
                        <Text style={styles.itemDesc} numberOfLines={2}>{r.description}</Text>
                        <Text style={styles.itemMeta}>{r.category}</Text>
                      </View>
                      <View style={styles.rowActions}>
                        <TouchableOpacity accessibilityRole="button" testID={`view-${r.id}`} style={styles.iconBtn} onPress={() => WebBrowser.openBrowserAsync(r.fileUrl)}>
                          <Eye size={18} color={Colors.text.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityRole="button" testID={`edit-${r.id}`} style={styles.iconBtn} onPress={() => onEdit(r)}>
                          <Edit3 size={18} color={Colors.text.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityRole="button" testID={`delete-${r.id}`} style={styles.iconBtn} onPress={() => onDelete(r.id)}>
                          <Trash2 size={18} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  header: { fontSize: 24, fontWeight: '700', color: Colors.text.primary, marginBottom: 12 },
  formCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, shadowColor: Colors.shadow.light, shadowOpacity: 0.08, shadowRadius: 8, marginBottom: 16 },
  formTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: Colors.surfaceLight, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text.primary, marginBottom: 10, backgroundColor: Colors.background },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.surfaceLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.background },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600', letterSpacing: 0.5 },
  typeTextActive: { color: Colors.surface },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  uploadBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  uploadText: { color: Colors.surface, fontWeight: '600' },
  fileInfo: { flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 },
  fileInfoText: { color: Colors.text.primary, flex: 1 },
  primaryBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12 },
  primaryBtnText: { color: Colors.surface, fontWeight: '700' },
  secondaryBtn: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceLight, borderRadius: 12, paddingVertical: 10, marginTop: 8 },
  secondaryBtnText: { color: Colors.text.primary, fontWeight: '600' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginBottom: 8 },
  typeSection: { marginBottom: 12 },
  typeHeader: { fontSize: 14, fontWeight: '700', color: Colors.text.secondary, marginBottom: 6 },
  empty: { color: Colors.text.light, fontSize: 13 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  itemDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  itemMeta: { fontSize: 11, color: Colors.primary, marginTop: 6, fontWeight: '700' },
  rowActions: { flexDirection: 'row', gap: 6, marginLeft: 8 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  bottomSpacer: { height: 48 },
});