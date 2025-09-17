import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Shield, Heart, CheckCircle } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isScrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (agreedToTerms) {
      router.replace('/auth');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Heart size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Digital Psychological Support</Text>
        <Text style={styles.subtitle}>Terms & Conditions</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to Our Mental Health Platform</Text>
          <Text style={styles.text}>
            This Digital Psychological Support platform is designed specifically for college students 
            to provide accessible mental health resources, counseling services, and peer support.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using this platform, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
            please do not use our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Privacy & Confidentiality</Text>
          <Text style={styles.text}>
            • All conversations with counselors are confidential and protected{"\n"}
            • Your personal information is encrypted and secure{"\n"}
            • We comply with HIPAA and mental health privacy standards{"\n"}
            • Anonymous usage options are available for additional privacy
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Emergency Situations</Text>
          <Text style={styles.text}>
            This platform is NOT for emergency mental health situations. If you are experiencing 
            a mental health emergency or having thoughts of self-harm, please:{"\n"}{"\n"}
            • Call 988 (Suicide & Crisis Lifeline){"\n"}
            • Call 911 for immediate emergency assistance{"\n"}
            • Go to your nearest emergency room{"\n"}
            • Contact your local crisis center
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
          <Text style={styles.text}>
            • Provide accurate information during registration{"\n"}
            • Use the platform respectfully and appropriately{"\n"}
            • Respect other users' privacy and confidentiality{"\n"}
            • Follow community guidelines in group discussions{"\n"}
            • Report any inappropriate behavior or content
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Counselor Services</Text>
          <Text style={styles.text}>
            • All counselors are licensed mental health professionals{"\n"}
            • Counselor applications are reviewed and verified{"\n"}
            • Sessions are conducted through secure, encrypted channels{"\n"}
            • Counselors follow professional ethical guidelines
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Collection & Usage</Text>
          <Text style={styles.text}>
            We collect minimal necessary information to provide our services:{"\n"}{"\n"}
            • Basic profile information (name, email, college){"\n"}
            • Usage analytics to improve our platform{"\n"}
            • Assessment responses for personalized recommendations{"\n"}
            • Communication logs for quality assurance{"\n"}{"\n"}
            Your data is never sold or shared with third parties without your explicit consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Platform Availability</Text>
          <Text style={styles.text}>
            While we strive for 24/7 availability, the platform may occasionally be unavailable 
            due to maintenance, updates, or technical issues. We are not liable for any 
            inconvenience caused by temporary unavailability.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.text}>
            This platform provides support and resources but is not a substitute for professional 
            medical treatment. Users are responsible for seeking appropriate medical care when needed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.text}>
            We may update these terms periodically. Users will be notified of significant changes 
            and will need to accept updated terms to continue using the platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.text}>
            For questions about these terms or our services, please contact our support team 
            through the platform's help section or reach out to your institution's counseling center.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            agreedToTerms && styles.checkboxContainerActive
          ]}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          disabled={!hasScrolledToBottom}
        >
          <View style={[
            styles.checkbox,
            agreedToTerms && styles.checkboxActive,
            !hasScrolledToBottom && styles.checkboxDisabled
          ]}>
            {agreedToTerms && (
              <CheckCircle size={20} color={Colors.text.white} />
            )}
          </View>
          <Text style={[
            styles.checkboxText,
            !hasScrolledToBottom && styles.checkboxTextDisabled
          ]}>
            I have read and agree to the Terms & Conditions
          </Text>
        </TouchableOpacity>

        {!hasScrolledToBottom && (
          <Text style={styles.scrollHint}>
            Please scroll to the bottom to continue
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.acceptButton,
            (!agreedToTerms || !hasScrolledToBottom) && styles.acceptButtonDisabled
          ]}
          onPress={handleAccept}
          disabled={!agreedToTerms || !hasScrolledToBottom}
        >
          <Text style={[
            styles.acceptButtonText,
            (!agreedToTerms || !hasScrolledToBottom) && styles.acceptButtonTextDisabled
          ]}>
            Continue to App
          </Text>
        </TouchableOpacity>

        <View style={styles.privacyNote}>
          <Shield size={16} color={Colors.primary} />
          <Text style={styles.privacyText}>Your privacy and mental health are our priority</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.secondary,
  },
  bottomPadding: {
    height: 40,
  },
  footer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainerActive: {
    // Add any active styles if needed
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: Colors.background,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
  checkboxTextDisabled: {
    color: Colors.text.light,
  },
  scrollHint: {
    fontSize: 12,
    color: Colors.text.light,
    textAlign: 'center' as const,
    marginBottom: 12,
    fontStyle: 'italic' as const,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  acceptButtonDisabled: {
    backgroundColor: Colors.surfaceLight,
  },
  acceptButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  acceptButtonTextDisabled: {
    color: Colors.text.light,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500' as const,
  },
});