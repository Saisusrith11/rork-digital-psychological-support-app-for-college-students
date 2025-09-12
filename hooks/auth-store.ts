import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { User } from '@/types/user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData && userData.trim() && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && typeof parsedUser === 'object') {
            setUser(parsedUser);
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // Clear corrupted data
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Mock login - in real app, this would call an API
      const mockUser: User = {
        id: '1',
        username,
        email: `${username}@example.com`,
        fullName: 'Test Student',
        college: 'Demo College',
        year: '2',
        course: 'Computer Science',
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
});