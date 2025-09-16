import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { PlusCircle, Upload, Trash2, Edit3, Eye, Video, FileAudio, FileText, Sparkles, Check, Youtube } from 'lucide-react-native';
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

type ResourceMode = 'file' | 'youtube';

export default function AdminResourcesScreen() {
  const insets = useSafeAreaInsets();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [type, setType] = useState<ResourceType>('video');
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mode, setMode] = useState<ResourceMode>('file');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');

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
    setMode('file');
    setYoutubeUrl('');
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
    
    if (mode === 'youtube') {
      if (!youtubeUrl) {
        Alert.alert('Missing YouTube URL', 'Please provide a YouTube URL');
        return;
      }
      if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        Alert.alert('Invalid URL', 'Please provide a valid YouTube URL');
        return;
      }
    }
    
    try {
      let fileUrl = '';
      let fileSize = 0;
      let mimeType = 'application/octet-stream';
      let finalYoutubeUrl = '';
      
      if (mode === 'youtube') {
        fileUrl = youtubeUrl;
        finalYoutubeUrl = youtubeUrl;
        mimeType = 'video/youtube';
      } else {
        fileUrl = upload?.fileUrl ?? '';
        fileSize = upload?.fileSize ?? 0;
        mimeType = upload?.mimeType ?? 'application/octet-stream';
        
        if (!editingId && !upload) {
          Alert.alert('Missing File', 'Please attach a file to upload');
          return;
        }
        
        if (upload && !upload.fileUrl) {
          const uploaded = await uploadMutation.mutateAsync({ fileName: upload.fileName, fileData: upload.base64, mimeType: upload.mimeType });
          fileUrl = uploaded.fileUrl;
          fileSize = uploaded.fileSize ?? fileSize;
          setUpload(prev => prev ? { ...prev, fileUrl } : prev);
        }
      }
      
      const resourceData = {
        title,
        description,
        category,
        type,
        fileUrl,
        youtubeUrl: finalYoutubeUrl || undefined,
        fileSize,
        mimeType,
        tags: []
      };
      
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: resourceData });
      } else {
        await createMutation.mutateAsync(resourceData);
      }
      
      await utils.resources.getAll.invalidate();
      resetForm();
      Alert.alert('Success', editingId ? 'Resource updated' : 'Resource created');
    } catch (e) {
      Alert.alert('Error', 'Failed to save resource');
      console.log('AdminResources onSubmit error', e);
    }
  }, [title, description, category, type, upload, editingId, mode, youtubeUrl, uploadMutation, createMutation, updateMutation, utils.resources.getAll, resetForm]);

  const onEdit = useCallback((r: any) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description);
    setCategory(r.category);
    setType(r.type as ResourceType);
    
    if (r.youtubeUrl) {
      setMode('youtube');
      setYoutubeUrl(r.youtubeUrl);
      setUpload(null);
    } else {
      setMode('file');
      setYoutubeUrl('');
      setUpload({ fileName: r.fileUrl.split('/').pop() ?? 'file', mimeType: r.mimeType, base64: '', fileSize: r.fileSize ?? 0, fileUrl: r.fileUrl });
    }
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
          <View style={styles.modeRow}>
            <TouchableOpacity testID="mode-file" style={[styles.modeChip, mode === 'file' && styles.modeChipActive]} onPress={() => setMode('file')}>
              <Upload size={16} color={mode === 'file' ? Colors.surface : Colors.text.secondary} />
              <Text style={[styles.modeText, mode === 'file' && styles.modeTextActive]}>Upload File</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="mode-youtube" style={[styles.modeChip, mode === 'youtube' && styles.modeChipActive]} onPress={() => setMode('youtube')}>
              <Youtube size={16} color={mode === 'youtube' ? Colors.surface : Colors.text.secondary} />
              <Text style={[styles.modeText, mode === 'youtube' && styles.modeTextActive]}>YouTube Link</Text>
            </TouchableOpacity>
          </View>
          
          {mode === 'file' ? (
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
          ) : (
            <TextInput
              testID="input-youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor={Colors.text.light}
              style={styles.input}
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
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
                        <View style={styles.itemMetaRow}>
                          <Text style={styles.itemMeta}>{r.category}</Text>
                          {r.youtubeUrl && (
                            <View style={styles.youtubeBadge}>
                              <Youtube size={12} color={Colors.surface} />
                              <Text style={styles.youtubeBadgeText}>YouTube</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.rowActions}>
                        {r.youtubeUrl ? (
                          <TouchableOpacity accessibilityRole="button" testID={`youtube-${r.id}`} style={[styles.iconBtn, styles.youtubeBtn]} onPress={() => {
                            if (Platform.OS === 'web') {
                              window.open(r.youtubeUrl, '_blank');
                            } else {
                              Linking.openURL(r.youtubeUrl);
                            }
                          }}>
                            <Youtube size={18} color={Colors.surface} />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity accessibilityRole="button" testID={`view-${r.id}`} style={styles.iconBtn} onPress={() => {
                            if (Platform.OS === 'web') {
                              window.open(r.fileUrl, '_blank');
                            } else {
                              WebBrowser.openBrowserAsync(r.fileUrl);
                            }
                          }}>
                            <Eye size={18} color={Colors.text.primary} />
                          </TouchableOpacity>
                        )}
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
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.surfaceLight, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.background, flex: 1, justifyContent: 'center' },
  modeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modeText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  modeTextActive: { color: Colors.surface },
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
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  itemMeta: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  youtubeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF0000', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  youtubeBadgeText: { fontSize: 10, color: Colors.surface, fontWeight: '600' },
  rowActions: { flexDirection: 'row', gap: 6, marginLeft: 8 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: Colors.background },
  youtubeBtn: { backgroundColor: '#FF0000' },
  flex1: { flex: 1 },
  bottomSpacer: { height: 48 },
});