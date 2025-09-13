import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Modal 
} from 'react-native';
import { Heart, Shield, UserCog, GraduationCap, Handshake } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UserRole } from '@/types/user';

type AuthForm = {
  username: string;
  email: string;
  fullName: string;
  password: string;
  college: string;
  year: string;
  course: string;
  role: UserRole;
};

export default function AuthScreen() {
  const { login, register, loginAnonymous } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState<AuthForm>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    college: '',
    year: '',
    course: '',
    role: 'student',
  });

  const showError = (message: string) => {
    if (!message || typeof message !== 'string') return;
    if (message.length > 200) return;
    const sanitized = message.trim();
    if (!sanitized) return;
    setErrorMessage(sanitized);
    setShowErrorModal(true);
  };

  const navigateAfterAuth = (role?: UserRole) => {
    if (role === 'counselor') {
      router.replace('/(counselor)/dashboard');
    } else if (role === 'admin') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleSubmit = async () => {
    if (isLogin) {
      if (!formData.username || !formData.password) {
        showError('Please fill in all fields');
        return;
      }
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigateAfterAuth(result.user?.role);
      } else {
        showError(result.error || 'Login failed');
      }
    } else {
      if (!formData.username || !formData.email || !formData.fullName || 
          !formData.password) {
        showError('Please fill in required fields');
        return;
      }
      const result = await register({
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        college: formData.college,
        year: formData.year,
        course: formData.course,
        role: formData.role,
      });
      if (result.success) {
        navigateAfterAuth(result.user?.role);
      } else {
        showError(result.error || 'Registration failed');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Heart size={32} color={Colors.text.white} />
          </View>
          <Text style={styles.appName}>MindCare</Text>
          <Text style={styles.tagline}>Your digital mental health companion</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Welcome</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer} testID="usernameField">
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              placeholder="Enter username"
              placeholderTextColor={Colors.text.light}
              autoCapitalize="none"
            />
          </View>

          {!isLogin && (
            <>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    placeholder="Enter email"
                    placeholderTextColor={Colors.text.light}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer} testID="fullNameField">
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                  placeholder="Enter full name"
                  placeholderTextColor={Colors.text.light}
                />
              </View>

              <View style={styles.inputContainer} testID="roleSelector">
                <Text style={styles.inputLabel}>Register as</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    testID="roleStudent"
                    style={[styles.rolePill, formData.role === 'student' && styles.rolePillActive]}
                    onPress={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                  >
                    <GraduationCap size={16} color={formData.role === 'student' ? Colors.text.white : Colors.primary} />
                    <Text style={[styles.rolePillText, formData.role === 'student' && styles.rolePillTextActive]}>Student</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID="roleCounselor"
                    style={[styles.rolePill, formData.role === 'counselor' && styles.rolePillActive]}
                    onPress={() => setFormData(prev => ({ ...prev, role: 'counselor' }))}
                  >
                    <UserCog size={16} color={formData.role === 'counselor' ? Colors.text.white : Colors.primary} />
                    <Text style={[styles.rolePillText, formData.role === 'counselor' && styles.rolePillTextActive]}>Counselor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID="roleVolunteer"
                    style={[styles.rolePill, formData.role === 'volunteer' && styles.rolePillActive]}
                    onPress={() => setFormData(prev => ({ ...prev, role: 'volunteer' }))}
                  >
                    <Handshake size={16} color={formData.role === 'volunteer' ? Colors.text.white : Colors.primary} />
                    <Text style={[styles.rolePillText, formData.role === 'volunteer' && styles.rolePillTextActive]}>Volunteer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <View style={styles.inputContainer} testID="passwordField">
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="Enter password"
              placeholderTextColor={Colors.text.light}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>College</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.college}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, college: text }))}
                    placeholder="College name"
                    placeholderTextColor={Colors.text.light}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Year</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.year}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, year: text }))}
                    placeholder="Year"
                    placeholderTextColor={Colors.text.light}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Course</Text>
                <TextInput
                  style={styles.input}
                  value={formData.course}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, course: text }))}
                  placeholder="Course/Major"
                  placeholderTextColor={Colors.text.light}
                />
              </View>
            </>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} testID="submitAuth">
            <Text style={styles.submitButtonText}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.anonymousButton} 
            onPress={async () => {
              const result = await loginAnonymous();
              if (result.success) {
                navigateAfterAuth(result.user?.role);
              }
            }}
          >
            <Text style={styles.anonymousButtonText}>Continue Anonymously</Text>
            <Text style={styles.anonymousSubtext}>For offline students - No registration required</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyNote}>
          <Shield size={16} color={Colors.primary} />
          <Text style={styles.privacyText}>Your privacy is protected</Text>
        </View>
        <Text style={styles.privacyDescription}>
          All conversations are confidential and secure. We comply with mental health privacy standards.
        </Text>
      </KeyboardAvoidingView>

      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8 as unknown as number,
    alignItems: 'center',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: Colors.surface,
  },
  rolePillActive: {
    backgroundColor: Colors.primary,
  },
  rolePillText: {
    marginLeft: 6,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  rolePillTextActive: {
    color: Colors.text.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 8,
  },
  privacyDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  anonymousButton: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  anonymousButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  anonymousSubtext: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});