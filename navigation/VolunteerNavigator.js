import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/auth-store';
import { useNavigation } from '@react-navigation/native';
import { LogOut, MessageSquareMore } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import NotificationBell from '../components/NotificationBell';

// Import screens
import VolunteerDashboardScreen from '../app/(volunteer)/dashboard';
import VolunteerStudentChatIndexScreen from '../app/(volunteer)/student-chat/index';
import VolunteerStudentChatScreen from '../app/(volunteer)/student-chat/[studentId]';

const Stack = createNativeStackNavigator();

function HeaderRight() {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = useCallback(async () => {
    try {
      console.log('[VolunteerNavigator] Logout pressed');
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (e) {
      console.error('[VolunteerNavigator] Logout error', e);
    }
  }, [logout, navigation]);

  const goToChatList = useCallback(() => {
    try {
      navigation.navigate('VolunteerStudentChatIndex');
    } catch (e) {
      console.error('[VolunteerNavigator] Nav to chat list error', e);
    }
  }, [navigation]);

  return (
    <View style={styles.headerRightWrap}>
      <NotificationBell />
      <TouchableOpacity
        onPress={goToChatList}
        style={styles.chatBtn}
        testID="open-student-chat"
        accessibilityLabel="Chat with Student"
      >
        <MessageSquareMore size={18} color={Colors.text.white} />
        <Text style={styles.chatText}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutBtn}
        testID="logout-button"
        accessibilityLabel="Logout"
      >
        <LogOut size={18} color={Colors.text.white} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function VolunteerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Volunteer',
        headerRight: () => <HeaderRight />,
      }}
    >
      <Stack.Screen 
        name="VolunteerDashboard" 
        component={VolunteerDashboardScreen}
        options={{ title: 'Volunteer Dashboard' }}
      />
      <Stack.Screen 
        name="VolunteerStudentChatIndex" 
        component={VolunteerStudentChatIndexScreen}
        options={{ title: 'Chat with Student' }}
      />
      <Stack.Screen 
        name="VolunteerStudentChat" 
        component={VolunteerStudentChatScreen}
        options={{ title: 'Student Chat' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerRightWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 8 },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chatText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  logoutText: { color: Colors.text.white, fontSize: 12, fontWeight: '700' },
});