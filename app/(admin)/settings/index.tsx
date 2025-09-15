import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function AdminSettingsHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Settings</Text>
      <Link href={'/(admin)/settings/helplines'} asChild>
        <TouchableOpacity style={styles.card} testID="helplines-manage-button">
          <Phone size={20} color={Colors.primary} />
          <Text style={styles.cardText}>Helpline Management</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginBottom: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.surfaceLight, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { fontSize: 16, color: Colors.text.primary, fontWeight: '600' },
});
