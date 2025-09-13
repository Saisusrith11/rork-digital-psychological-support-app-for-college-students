import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

export default function PrivacySettings() {
  const [showUsername, setShowUsername] = useState<boolean>(true);
  const [acceptAnonymous, setAcceptAnonymous] = useState<boolean>(true);
  const [dataConsent, setDataConsent] = useState<boolean>(true);

  return (
    <ScrollView style={styles.container} testID="privacy-settings-screen">
      <Text style={styles.title}>Privacy & Security</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Show my name to students</Text>
          <Switch value={showUsername} onValueChange={setShowUsername} testID="switch-show-name" />
        </View>
        <Text style={styles.hint}>Turn OFF to appear as "Counselor" in chat and bookings.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Accept anonymous bookings</Text>
          <Switch value={acceptAnonymous} onValueChange={setAcceptAnonymous} testID="switch-accept-anon" />
        </View>
        <Text style={styles.hint}>Students can book sessions without revealing identity.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Privacy policy</Text>
        <Text style={styles.paragraph}>
          We collect minimal data necessary for appointments and support. Notes are confidential and visible only to you
          and the assigned student with explicit consent. Admins see only anonymized trends, never personal notes.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>I acknowledge the data policy</Text>
          <Switch value={dataConsent} onValueChange={setDataConsent} testID="switch-data-consent" />
        </View>
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
  paragraph: { marginTop: 8, lineHeight: 20, color: Colors.text.secondary },
});
