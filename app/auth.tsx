import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { Heart, Shield } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthForm = {
  username: string;
  password: string;
};

export default function AuthScreen() {
  const { login, loginAnonymous } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<AuthForm>({
    username: '',
    password: '',
  });

  const navigateAfterAuth = () => {
    router.replace('/(tabs)/home');
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      console.log('Please fill in all fields');
      return;
    }
    const result = await login(formData.username, formData.password);
    if (result.success) {
      navigateAfterAuth();
    } else {
      console.log(result.error || 'Login failed');
    }
  };

  const handleAnonymousLogin = async () => {
    const result = await loginAnonymous();
    if (result.success) {
      navigateAfterAuth();
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
          <Text style={styles.formTitle}>Welcome Back</Text>
          
          <View style={styles.inputContainer}>
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

          <View style={styles.inputContainer}>
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

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.anonymousButton} 
            onPress={handleAnonymousLogin}
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
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
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
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
    color: Colors.primary,
    marginLeft: 8,
  },
  privacyDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 18,
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
    fontWeight: '600' as const,
  },
  anonymousSubtext: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center' as const,
  },
});