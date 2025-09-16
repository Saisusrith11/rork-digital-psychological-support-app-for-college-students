import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { Search, Circle, CircleDot } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
}

const MOCK_ASSIGNED_STUDENTS: StudentItem[] = [
  { id: 'stu_1', name: 'John Doe', email: 'john.doe@email.com', isOnline: true },
  { id: 'stu_2', name: 'Jane Smith', email: 'jane.smith@email.com', isOnline: false },
  { id: 'stu_3', name: 'Alex Johnson', email: 'alex.j@email.com', isOnline: true },
];

export default function VolunteerStudentChatList() {
  const { user } = useAuth();
  const [query, setQuery] = useState<string>('');
  const insets = useSafeAreaInsets();

  const students = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = MOCK_ASSIGNED_STUDENTS;
    if (!q) return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list
      .filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  const openChat = useCallback((student: StudentItem) => {
    try {
      const conversationId = [user?.id ?? '', student.id].sort().join('_');
      router.push({ pathname: '/(volunteer)/student-chat/[studentId]', params: { studentId: student.id, conversationId } });
    } catch (e) {
      console.error('[VolunteerStudentChatList] openChat error', e);
    }
  }, [user?.id]);

  const renderItem = useCallback(({ item }: { item: StudentItem }) => {
    return (
      <TouchableOpacity style={styles.row} onPress={() => openChat(item)} testID={`student-${item.id}`}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '22' }]} />
        <View style={styles.col}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <View style={styles.statusWrap}>
          {item.isOnline ? <CircleDot size={14} color={'#2fbf71'} /> : <Circle size={14} color={Colors.text.secondary} />}
          <Text style={styles.statusText}>{item.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [openChat]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]} testID="volunteer-student-chat-list">
      <View style={styles.searchBar}>
        <Search size={16} color={Colors.text.secondary} />
        <TextInput
          style={styles.input}
          placeholder="Search by name, email, or ID"
          placeholderTextColor={Colors.text.light}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceLight,
    paddingHorizontal: 12, paddingVertical: 8, margin: 16,
  },
  input: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceLight,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  col: { flex: 1 },
  name: { color: Colors.text.primary, fontSize: 14, fontWeight: '700' },
  email: { color: Colors.text.secondary, fontSize: 12 },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { color: Colors.text.secondary, fontSize: 12 },
});
