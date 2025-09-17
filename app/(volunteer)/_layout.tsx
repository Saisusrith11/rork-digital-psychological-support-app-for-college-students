import React from 'react';
import { Stack } from 'expo-router';

export default function VolunteerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="student-chat/index" />
      <Stack.Screen name="student-chat/[studentId]" />
    </Stack>
  );
}