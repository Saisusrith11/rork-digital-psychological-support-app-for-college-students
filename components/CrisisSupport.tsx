import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Modal } from 'react-native';
import { AlertTriangle, Phone } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function CrisisSupport() {
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleCrisisCall = async () => {
    try {
      const phoneNumber = 'tel:+911276670800';
      const canOpen = await Linking.canOpenURL(phoneNumber);
      if (canOpen) {
        await Linking.openURL(phoneNumber);
      } else {
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error making phone call:', error);
      setShowErrorModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertTriangle size={20} color={Colors.crisis.text} />
        <Text style={styles.title}>Need immediate support?</Text>
      </View>
      <Text style={styles.subtitle}>If you&apos;re in crisis, we&apos;re here for you 24/7</Text>
      
      <TouchableOpacity 
        style={styles.callButton} 
        onPress={handleCrisisCall}
        testID="crisis-call-button"
      >
        <Phone size={20} color={Colors.text.white} />
        <Text style={styles.callButtonText}>Call Crisis Helpline</Text>
      </TouchableOpacity>

      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>Unable to make phone call</Text>
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
    backgroundColor: Colors.crisis.background,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.crisis.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.crisis.text,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.crisis.text,
    marginBottom: 16,
    opacity: 0.8,
  },
  callButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
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
});