import { Stack } from 'expo-router';
import React from 'react';

export default function AdminSettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="helplines" options={{ title: 'Helpline Management' }} />
    </Stack>
  );
}
