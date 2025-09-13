import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

export default function GeneralSettings() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [compactUI, setCompactUI] = useState<boolean>(false);

  return (
    <ScrollView style={styles.container} testID="general-settings-screen">
      <Text style={styles.title}>General</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Dark mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} testID="switch-dark-mode" />
        </View>
        <Text style={styles.hint}>Reduce eye strain with darker colors.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>Compact UI</Text>
          <Switch value={compactUI} onValueChange={setCompactUI} testID="switch-compact-ui" />
        </View>
        <Text style={styles.hint}>Fit more content on screen by reducing paddings.</Text>
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
