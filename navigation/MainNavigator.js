import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/auth-store';

// Import navigators
import AuthNavigator from './AuthNavigator';
import StudentTabNavigator from './StudentTabNavigator';
import CounselorNavigator from './CounselorNavigator';
import AdminNavigator from './AdminNavigator';
import VolunteerNavigator from './VolunteerNavigator';

// Import screens
import LoadingScreen from '../screens/LoadingScreen';
import BookingScreen from '../app/booking';
import AssessmentScreen from '../app/assessment';
import AssessmentResultScreen from '../app/assessment-result';
import WeeklyReportScreen from '../app/weekly-report';
import ResourceDetailScreen from '../app/resource-detail';
import CounselorApplicationScreen from '../app/counselor-application';
import CounselorApplicationsAdminScreen from '../app/counselor-applications-admin';
import EnterCounselorScreen from '../app/enter-counselor';
import TestScreen from '../app/test';
import AiChatScreen from '../app/ai-chat';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          {/* Role-based navigation */}
          {user?.role === 'counselor' && (
            <Stack.Screen name="Counselor" component={CounselorNavigator} />
          )}
          {user?.role === 'admin' && (
            <Stack.Screen name="Admin" component={AdminNavigator} />
          )}
          {user?.role === 'volunteer' && (
            <Stack.Screen name="Volunteer" component={VolunteerNavigator} />
          )}
          {(!user?.role || user?.role === 'student') && (
            <Stack.Screen name="Student" component={StudentTabNavigator} />
          )}
          
          {/* Shared screens */}
          <Stack.Screen 
            name="Booking" 
            component={BookingScreen} 
            options={{ headerShown: true, title: 'Book Appointment' }}
          />
          <Stack.Screen 
            name="Assessment" 
            component={AssessmentScreen} 
            options={{ headerShown: true, title: 'Assessment' }}
          />
          <Stack.Screen 
            name="AssessmentResult" 
            component={AssessmentResultScreen} 
            options={{ headerShown: true, title: 'Assessment Result' }}
          />
          <Stack.Screen 
            name="WeeklyReport" 
            component={WeeklyReportScreen} 
            options={{ headerShown: true, title: 'Weekly Report' }}
          />
          <Stack.Screen 
            name="ResourceDetail" 
            component={ResourceDetailScreen} 
            options={{ headerShown: true, title: 'Resource Details' }}
          />
          <Stack.Screen 
            name="CounselorApplication" 
            component={CounselorApplicationScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CounselorApplicationsAdmin" 
            component={CounselorApplicationsAdminScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EnterCounselor" 
            component={EnterCounselorScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AiChat" 
            component={AiChatScreen} 
            options={{ headerShown: true, title: 'AI Mental Health Support' }}
          />
          <Stack.Screen 
            name="Test" 
            component={TestScreen} 
            options={{ headerShown: true, title: 'Test Screen' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}