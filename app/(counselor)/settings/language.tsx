import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/hooks/language-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LanguageSettings() {
  const { currentLanguage, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  const options: { code: 'en' | 'ta' | 'te' | 'hi'; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="language-settings-screen">
      <Text style={styles.title}>Language</Text>
      <Text style={styles.subtitle}>Language = Total App Language</Text>

      {options.map((opt) => {
        const active = currentLanguage === opt.code;
        return (
          <TouchableOpacity
            key={opt.code}
            style={[styles.row, active && styles.rowActive]}
            onPress={() => setLanguage(opt.code)}
            testID={`lang-${opt.code}`}
          >
            <Text style={[styles.langText, active && styles.langTextActive]}>{opt.label}</Text>
            {active && <Text style={styles.badge}>Active</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  subtitle: { marginTop: 4, color: Colors.text.secondary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginTop: 12 },
  rowActive: { borderWidth: 2, borderColor: Colors.primary },
  langText: { fontSize: 16, color: Colors.text.primary },
  langTextActive: { color: Colors.primary, fontWeight: '700' },
  badge: { backgroundColor: Colors.primary, color: Colors.text.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
});
