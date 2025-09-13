import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();
  const [bookingAlerts, setBookingAlerts] = useState<boolean>(true);
  const [messageAlerts, setMessageAlerts] = useState<boolean>(true);
  const [dailySummary, setDailySummary] = useState<boolean>(false);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} testID="notification-settings-screen">
      <Text style={styles.title}>Notifications</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Booking alerts</Text>
          <Switch value={bookingAlerts} onValueChange={setBookingAlerts} testID="switch-booking-alerts" />
        </View>
        <Text style={styles.hint}>Get notified when a student books or cancels an appointment.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Message alerts</Text>
          <Switch value={messageAlerts} onValueChange={setMessageAlerts} testID="switch-message-alerts" />
        </View>
        <Text style={styles.hint}>Receive alerts for new chat messages from students.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Daily summary</Text>
          <Switch value={dailySummary} onValueChange={setDailySummary} testID="switch-daily-summary" />
        </View>
        <Text style={styles.hint}>Get a concise summary of bookings and unread messages every evening.</Text>
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
