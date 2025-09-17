import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@/types/user';
import { safeJsonParse, safeJsonStringify } from '@/utils/safe-json-parse';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = safeJsonParse<User>(userData);
      if (parsedUser && typeof parsedUser === 'object') {
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      if (!username?.trim() || !password?.trim()) {
        return { success: false, error: 'Invalid credentials' } as const;
      }
      
      let mockUser: User;
      
      if (username === 'counselor' && password === 'counselor123') {
        mockUser = {
          id: 'counselor_1',
          username: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@college.edu',
          fullName: 'Dr. Sarah Johnson',
          college: 'Demo College',
          year: '',
          course: '',
          createdAt: new Date().toISOString(),
          role: 'counselor',
          specialization: 'Clinical Psychology',
          languages: ['English', 'Tamil', 'Hindi'],
          isOnline: true,
        };
      }
      else if (username === 'admin' && password === 'admin123') {
        mockUser = {
          id: 'admin_1',
          username: 'Admin User',
          email: 'admin@college.edu',
          fullName: 'System Administrator',
          college: 'Demo College',
          year: '',
          course: '',
          createdAt: new Date().toISOString(),
          role: 'admin',
        };
      }
      else if (username === 'volunteer' && password === 'volunteer123') {
        mockUser = {
          id: 'volunteer_1',
          username: 'Student Volunteer',
          email: 'volunteer@college.edu',
          fullName: 'Campus Volunteer',
          college: 'Demo College',
          year: '2',
          course: 'Psychology',
          createdAt: new Date().toISOString(),
          role: 'volunteer',
          showUsername: true,
        };
      }
      else {
        mockUser = {
          id: '1',
          username: username.trim(),
          email: `${username.trim()}@example.com`,
          fullName: 'Test Student',
          college: 'Demo College',
          year: '2',
          course: 'Computer Science',
          createdAt: new Date().toISOString(),
          role: 'student',
          showUsername: true,
        };
      }
      
      const userJson = safeJsonStringify(mockUser);
      if (userJson) {
        await AsyncStorage.setItem('user', userJson);
      }
      setUser(mockUser);
      return { success: true, user: mockUser } as const;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' } as const;
    }
  }, []);

  const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      if (!userData.username?.trim() || !userData.email?.trim()) {
        return { success: false, error: 'Invalid user data' } as const;
      }
      
      const newUser: User = {
        ...userData,
        username: userData.username.trim(),
        email: userData.email.trim(),
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const userJson = safeJsonStringify(newUser);
      if (userJson) {
        await AsyncStorage.setItem('user', userJson);
      }
      setUser(newUser);
      return { success: true, user: newUser } as const;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' } as const;
    }
  }, []);

  const loginAnonymous = useCallback(async () => {
    try {
      const anonymousUser: User = {
        id: 'anonymous_' + Date.now(),
        username: 'Anonymous User',
        email: '',
        fullName: 'Anonymous',
        college: '',
        year: '',
        course: '',
        createdAt: new Date().toISOString(),
        isAnonymous: true,
        role: 'student',
      };
      
      setUser(anonymousUser);
      return { success: true, user: anonymousUser } as const;
    } catch (error) {
      console.error('Anonymous login error:', error);
      return { success: false, error: 'Anonymous login failed' } as const;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!user?.isAnonymous) {
        await AsyncStorage.removeItem('user');
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [user?.isAnonymous]);

  return useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    loginAnonymous,
    logout,
    isAuthenticated: !!user,
  }), [user, isLoading, login, register, loginAnonymous, logout]);
});