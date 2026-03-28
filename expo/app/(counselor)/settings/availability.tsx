import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DayAvailability {
  day: string;
  enabled: boolean;
  start: string; // HH:mm
  end: string;   // HH:mm
}

const DAYS: readonly string[] = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;

export default function AvailabilitySettings() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [slots, setSlots] = useState<DayAvailability[]>(
    DAYS.map((d) => ({ day: d, enabled: d !== 'Sun', start: '10:00', end: '17:00' }))
  );
  const [allowInstantBooking, setAllowInstantBooking] = useState<boolean>(true);

  const toggleDay = useCallback((day: string) => {
    setSlots((prev) => prev.map((s) => (s.day === day ? { ...s, enabled: !s.enabled } : s)));
  }, []);

  const shiftTime = useCallback((day: string, which: 'start' | 'end', deltaMinutes: number) => {
    setSlots((prev) => prev.map((s) => {
      if (s.day !== day) return s;
      const [hh, mm] = s[which].split(':').map((n) => parseInt(n, 10));
      const date = new Date();
      date.setHours(hh, mm + deltaMinutes, 0, 0);
      const nh = String(date.getHours()).padStart(2, '0');
      const nm = String(date.getMinutes()).padStart(2, '0');
      return { ...s, [which]: `${nh}:${nm}` } as DayAvailability;
    }));
  }, []);

  const summary = useMemo(() => {
    const enabled = slots.filter((s) => s.enabled);
    return `${enabled.length}/7 days • ${allowInstantBooking ? 'Instant booking ON' : 'Manual approval'}`;
  }, [slots, allowInstantBooking]);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} testID="availability-settings-screen">
      <Text style={styles.title}>Weekly Availability</Text>
      <Text style={styles.subtitle}>{summary}</Text>

      {slots.map((s) => (
        <View key={s.day} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.day}>{s.day}</Text>
            <Switch value={s.enabled} onValueChange={() => toggleDay(s.day)} testID={`switch-${s.day}`} />
          </View>

          <View style={styles.timesRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Start</Text>
              <Text style={styles.time}>{s.start}</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => shiftTime(s.day, 'start', -30)} style={styles.timeBtn} testID={`start-${s.day}-minus`}>
                  <Text style={styles.timeBtnText}>-30m</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shiftTime(s.day, 'start', 30)} style={styles.timeBtn} testID={`start-${s.day}-plus`}>
                  <Text style={styles.timeBtnText}>+30m</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>End</Text>
              <Text style={styles.time}>{s.end}</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => shiftTime(s.day, 'end', -30)} style={styles.timeBtn} testID={`end-${s.day}-minus`}>
                  <Text style={styles.timeBtnText}>-30m</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shiftTime(s.day, 'end', 30)} style={styles.timeBtn} testID={`end-${s.day}-plus`}>
                  <Text style={styles.timeBtnText}>+30m</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Allow instant booking</Text>
          <Switch value={allowInstantBooking} onValueChange={setAllowInstantBooking} testID="switch-instant-booking" />
        </View>
        <Text style={styles.cardHint}>Students can book available slots without approval.</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} testID="btn-save-availability">
        <Text style={styles.saveText}>Save Availability</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, margin: 16 },
  subtitle: { fontSize: 14, color: Colors.text.secondary, marginHorizontal: 16, marginBottom: 8 },
  card: { backgroundColor: Colors.surface, marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  day: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  timesRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  timeBlock: { flex: 1, backgroundColor: Colors.surface, borderRadius: 8 },
  timeLabel: { fontSize: 12, color: Colors.text.secondary },
  time: { fontSize: 20, fontWeight: '700', color: Colors.primary, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  timeBtn: { backgroundColor: Colors.primary + '20', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  timeBtnText: { color: Colors.primary, fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  cardHint: { marginTop: 6, fontSize: 12, color: Colors.text.secondary },
  saveBtn: { backgroundColor: Colors.primary, margin: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: Colors.text.white, fontSize: 16, fontWeight: '700' },
});
