import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/theme-store';
import { useLanguage } from '@/hooks/language-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GeneralSettings() {
  const { settings, toggleDarkMode, toggleCompactUI, colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background,
      paddingTop: insets.top 
    },
    title: { 
      fontSize: 22, 
      fontWeight: '700', 
      color: colors.text.primary, 
      margin: 16 
    },
    card: { 
      backgroundColor: colors.surface, 
      marginHorizontal: 16, 
      marginVertical: 8, 
      borderRadius: 12, 
      padding: settings.isCompactUI ? 12 : 16 
    },
    rowBetween: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    },
    itemTitle: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: colors.text.primary 
    },
    hint: { 
      marginTop: 6, 
      fontSize: 12, 
      color: colors.text.secondary 
    },
  });

  return (
    <ScrollView style={styles.container} testID="general-settings-screen">
      <Text style={styles.title}>{t('settings.general') || 'General'}</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>{t('settings.darkMode') || 'Dark mode'}</Text>
          <Switch 
            value={settings.isDarkMode} 
            onValueChange={toggleDarkMode} 
            testID="switch-dark-mode" 
          />
        </View>
        <Text style={styles.hint}>{t('settings.darkModeHint') || 'Reduce eye strain with darker colors.'}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemTitle}>{t('settings.compactUI') || 'Compact UI'}</Text>
          <Switch 
            value={settings.isCompactUI} 
            onValueChange={toggleCompactUI} 
            testID="switch-compact-ui" 
          />
        </View>
        <Text style={styles.hint}>{t('settings.compactUIHint') || 'Fit more content on screen by reducing paddings.'}</Text>
      </View>
    </ScrollView>
  );
}
