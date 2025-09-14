import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { Colors } from '@/constants/colors';
import { ShieldCheck, MessageCircle, Send, CheckCircle2, X, BadgeCheck, Flag } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ForumPost {
  id: string;
  category: 'Academic' | 'Wellness' | 'Social';
  content: string;
  timestamp: string;
  replies: number;
}

interface PendingReply {
  id: string;
  postId: string;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const MOCK_POSTS: ForumPost[] = [
  {
    id: 'p1',
    category: 'Academic',
    content:
      "Anonymous: I'm overwhelmed by assignments and midterms. How do you plan studies without burning out?",
    timestamp: '1h ago',
    replies: 3,
  },
  {
    id: 'p2',
    category: 'Wellness',
    content:
      'Anonymous: Struggling to sleep before exams. Any non-clinical sleep hygiene tips that helped you?',
    timestamp: '3h ago',
    replies: 7,
  },
  {
    id: 'p3',
    category: 'Social',
    content:
      'Anonymous: I get anxious during group discussions. How can I contribute without panicking?',
    timestamp: '1d ago',
    replies: 10,
  },
];

export default function VolunteerDashboard() {
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [trained, setTrained] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<'All' | ForumPost['category']>('All');
  const [composeOpen, setComposeOpen] = useState<boolean>(false);
  const [activePost, setActivePost] = useState<ForumPost | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [pending, setPending] = useState<PendingReply[]>([]);

  const posts = useMemo(() => {
    if (selectedCategory === 'All') return MOCK_POSTS;
    return MOCK_POSTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const openCompose = useCallback((post: ForumPost) => {
    if (!post) return;
    setActivePost(post);
    setReplyText('');
    setComposeOpen(true);
  }, []);

  const submitReply = useCallback(() => {
    if (!activePost) return;
    const text = replyText.trim();
    if (!text) {
      return;
    }
    if (!trained) {
      return;
    }
    const newItem: PendingReply = {
      id: 'r_' + Date.now(),
      postId: activePost.id,
      text,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setPending(prev => [newItem, ...prev]);
    setComposeOpen(false);
    setReplyText('');
  }, [activePost, replyText, trained]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'volunteer')) {
      try {
        console.log('[VolunteerDashboard] Redirecting non-volunteer to /auth');
        router.replace('/auth');
      } catch (e) {
        console.error('[VolunteerDashboard] Navigation error', e);
      }
    }
  }, [isLoading, user?.role]);

  if (!user || user.role !== 'volunteer') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Colors.text.secondary }}>Redirecting…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} testID="volunteer-dashboard">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Peer Support — Volunteer</Text>
            <View style={[styles.badge, trained ? styles.badgeSuccess : styles.badgeWarning]}>
              <BadgeCheck size={14} color={Colors.text.white} />
              <Text style={styles.badgeText}>{trained ? 'Trained' : 'Training required'}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            You can reply to anonymous student posts. Keep it supportive, non-clinical, and avoid medical advice.
          </Text>
          {!trained && (
            <TouchableOpacity
              testID="start-training"
              style={styles.trainBtn}
              onPress={() => setTrained(true)}
            >
              <Text style={styles.trainBtnText}>Start 10‑min Training</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MessageCircle size={18} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Posts needing support</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
            {(['All', 'Academic', 'Wellness', 'Social'] as const).map(cat => (
              <TouchableOpacity
                key={cat}
                testID={`filter-${cat}`}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {posts.map(p => (
          <View key={p.id} style={styles.postCard} testID={`post-${p.id}`}>
            <View style={styles.postHeader}>
              <View style={styles.catPill}>
                <Text style={styles.catPillText}>{p.category}</Text>
              </View>
              <Text style={styles.timestamp}>{p.timestamp}</Text>
            </View>
            <Text style={styles.postText}>{p.content}</Text>
            <View style={styles.postFooter}>
              <View style={styles.metaRow}>
                <MessageCircle size={14} color={Colors.text.secondary} />
                <Text style={styles.metaText}>{p.replies} replies</Text>
              </View>
              <TouchableOpacity
                style={styles.replyBtn}
                onPress={() => openCompose(p)}
                disabled={!trained}
              >
                <Send size={16} color={Colors.text.white} />
                <Text style={styles.replyBtnText}>{trained ? 'Reply' : 'Locked'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Flag size={18} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Your moderation queue</Text>
          </View>
        </View>
        {pending.length === 0 ? (
          <View style={styles.emptyBox} testID="empty-queue">
            <Text style={styles.emptyTitle}>No pending replies</Text>
            <Text style={styles.emptySub}>Submit a reply and it will appear here until approved.</Text>
          </View>
        ) : (
          pending.map(item => (
            <View key={item.id} style={styles.queueCard}>
              <View style={styles.queueRow}>
                <Text style={styles.queueLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'pending' && styles.statusPending,
                    item.status === 'approved' && styles.statusApproved,
                    item.status === 'rejected' && styles.statusRejected,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.status === 'pending' ? 'Awaiting approval' : item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.queueMeta}>Post: {item.postId}</Text>
              <Text style={styles.queueText}>{item.text}</Text>
              <Text style={styles.queueTime}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          ))
        )}

        <View style={styles.footerNote}>
          <ShieldCheck size={16} color={Colors.secondary} />
          <Text style={styles.footerText}>
            All volunteer replies are moderated. Do not provide clinical or crisis advice. Use supportive, empathetic language.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={composeOpen}
        onRequestClose={() => setComposeOpen(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setComposeOpen(false)}>
              <X size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Write a supportive reply</Text>
            <TouchableOpacity style={styles.modalSend} onPress={submitReply}>
              <CheckCircle2 size={20} color={Colors.text.white} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Reply</Text>
            <TextInput
              testID="reply-input"
              style={styles.input}
              multiline
              numberOfLines={8}
              placeholder="Share practical tips, empathy, and encouragement. No medical advice."
              placeholderTextColor={Colors.text.light}
              value={replyText}
              onChangeText={setReplyText}
              textAlignVertical="top"
            />
            {activePost && (
              <View style={styles.contextBox}>
                <Text style={styles.contextLabel}>Replying to</Text>
                <Text style={styles.contextText}>{activePost.content}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  subtitle: { fontSize: 13, color: Colors.text.secondary, lineHeight: 18 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeSuccess: { backgroundColor: Colors.success },
  badgeWarning: { backgroundColor: Colors.error },
  badgeText: { color: Colors.text.white, fontSize: 12, fontWeight: '600' },
  trainBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  trainBtnText: { color: Colors.text.white, fontSize: 12, fontWeight: '600' },

  sectionHeader: { paddingHorizontal: 16, marginTop: 10, marginBottom: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  filtersRow: { gap: 8, paddingVertical: 8 },
  filterChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: Colors.text.white },

  postCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  catPill: { backgroundColor: Colors.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  catPillText: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  timestamp: { color: Colors.text.secondary, fontSize: 12 },
  postText: { color: Colors.text.primary, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  postFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  replyBtnText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },

  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySub: { color: Colors.text.secondary, fontSize: 13 },

  queueCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  queueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  queueLabel: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPending: { backgroundColor: Colors.secondary + '33' },
  statusApproved: { backgroundColor: '#2fbf71' + '66' },
  statusRejected: { backgroundColor: Colors.error + '55' },
  statusText: { color: Colors.text.primary, fontSize: 11, fontWeight: '700' },
  queueMeta: { color: Colors.text.secondary, fontSize: 12, marginBottom: 6 },
  queueText: { color: Colors.text.primary, fontSize: 14, lineHeight: 20, marginBottom: 6 },
  queueTime: { color: Colors.text.secondary, fontSize: 11 },

  footerNote: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 16, alignItems: 'flex-start' },
  footerText: { color: Colors.secondary, fontSize: 12, lineHeight: 16, flex: 1 },

  modalWrap: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surfaceLight },
  modalTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  modalSend: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  modalBody: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  inputLabel: { color: Colors.text.primary, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.text.primary, borderWidth: 1, borderColor: Colors.surfaceLight, minHeight: 120, marginBottom: 12 },
  contextBox: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceLight, padding: 12 },
  contextLabel: { color: Colors.text.secondary, fontSize: 12, marginBottom: 4 },
  contextText: { color: Colors.text.primary, fontSize: 13, lineHeight: 18 },
});
