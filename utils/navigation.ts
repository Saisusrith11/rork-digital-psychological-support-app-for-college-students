import { NavigationProp, useNavigation as useReactNavigation, useRoute, RouteProp } from '@react-navigation/native';

// Define your navigation types here
export type RootStackParamList = {
  Auth: undefined;
  AuthScreen: undefined;
  Index: undefined;
  Student: undefined;
  Counselor: undefined;
  Admin: undefined;
  Volunteer: undefined;
  Booking: undefined;
  Assessment: undefined;
  AssessmentResult: { score?: number; category?: string };
  WeeklyReport: undefined;
  ResourceDetail: { resourceId?: string };
  CounselorApplication: undefined;
  CounselorApplicationsAdmin: undefined;
  EnterCounselor: undefined;
  AiChat: undefined;
  Test: undefined;
  // Add more screens as needed
};

// Export navigation hook
export const useNavigation = () => useReactNavigation<NavigationProp<RootStackParamList>>();

// Export route hook
export const useLocalSearchParams = <T extends keyof RootStackParamList>() => {
  const route = useRoute<RouteProp<RootStackParamList, T>>();
  return route.params || {} as RootStackParamList[T];
};

// Create a router-like interface for easier migration
export function useRouter() {
  const navigation = useReactNavigation<NavigationProp<RootStackParamList>>();
  
  return {
    push: (screen: keyof RootStackParamList, params?: any) => {
      navigation.navigate(screen as any, params);
    },
    replace: (screen: keyof RootStackParamList, params?: any) => {
      navigation.reset({
        index: 0,
        routes: [{ name: screen as any, params }],
      });
    },
    back: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    navigate: (screen: keyof RootStackParamList, params?: any) => {
      navigation.navigate(screen as any, params);
    },
  };
}

// Export router as a placeholder that will be replaced with useRouter() in components
export const router = {
  push: () => console.warn('router.push should be replaced with useRouter().push'),
  replace: () => console.warn('router.replace should be replaced with useRouter().replace'),
  back: () => console.warn('router.back should be replaced with useRouter().back'),
  navigate: () => console.warn('router.navigate should be replaced with useRouter().navigate'),
};