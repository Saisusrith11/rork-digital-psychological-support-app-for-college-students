import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="resources" />
      <Stack.Screen name="students" />
      <Stack.Screen name="review-queue" />
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="settings/helplines" />
      <Stack.Screen name="settings/student-review" />
    </Stack>
  );
}