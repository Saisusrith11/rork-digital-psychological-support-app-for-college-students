import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

export default function CommunicationSettings() {
  const [allowStudentInitiatedChat, setAllowStudentInitiatedChat] = useState<boolean>(true);
  const [allowVolunteerRouting, setAllowVolunteerRouting] = useState<boolean>(false);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);

  return (
    <ScrollView style={styles.container} testID="communications-settings-screen">
      <Text style={styles.title}>Communications</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Students can start chat</Text>
          <Switch value={allowStudentInitiatedChat} onValueChange={setAllowStudentInitiatedChat} testID="switch-student-chat" />
        </View>
        <Text style={styles.hint}>Let students DM you directly from bookings and profile.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Route to volunteers if busy</Text>
          <Switch value={allowVolunteerRouting} onValueChange={setAllowVolunteerRouting} testID="switch-volunteer-routing" />
        </View>
        <Text style={styles.hint}>Forward initial messages to trained volunteers when unavailable.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Auto-translate messages</Text>
          <Switch value={autoTranslate} onValueChange={setAutoTranslate} testID="switch-auto-translate" />
        </View>
        <Text style={styles.hint}>Translate between English, Hindi, Tamil, Telugu based on student preference.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, margin: 16 },
  card: { backgroundColor: Colors.surface, marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  hint: { marginTop: 6, fontSize: 12, color: Colors.text.secondary },
});
