import { Stack } from 'expo-router';
import React from 'react';

export default function VolunteerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Volunteer',
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Volunteer Dashboard' }} />
    </Stack>
  );
}
