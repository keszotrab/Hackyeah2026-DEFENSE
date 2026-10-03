import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSettings } from '../services/settings-context';

interface SOSEscalationModalProps {
  visible: boolean;
  onRevoke: () => void;
}

export default function SOSEscalationModal({
  visible,
  onRevoke,
}: SOSEscalationModalProps) {
  const { isHighContrast } = useSettings();

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: isHighContrast ? '#000000' : '#450A0A' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header icon */}
          <View style={styles.topIconBox}>
            <Text style={styles.topIcon}>📡</Text>
          </View>

          <Text style={[styles.title, isHighContrast && styles.highContrastText]}>
            AKTYWNY ALARM SOS
          </Text>
          <Text style={styles.subtitle}>Procedura eskalacji bezpieczeństwa</Text>

          {/* Step 1 */}
          <View style={[styles.stepCard, styles.stepCardActive, isHighContrast && styles.highContrastCard]}>
            <Text style={styles.stepIcon}>👥</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Krok 1: Powiadomiono grupy bliskich</Text>
              <Text style={styles.stepDesc}>Sygnał wysłano do 4 dodanych kontaktów alarmowych.</Text>
            </View>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          {/* Step 2 */}
          <View style={[styles.stepCard, styles.stepCardActive, isHighContrast && styles.highContrastCard]}>
            <Text style={styles.stepIcon}>📍</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Krok 2: Użytkownicy w okolicy</Text>
              <Text style={styles.stepDesc}>Twój punkt SOS jest wyemitowany na mapie taktycznej.</Text>
            </View>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          {/* Step 3 */}
          <View style={[styles.stepCard, isHighContrast && styles.highContrastCard]}>
            <Text style={styles.stepIcon}>🚑</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Krok 3: Połączenie ze służbami (112)</Text>
              <Text style={styles.stepDesc}>Gotowość do automatycznego powiadomienia numeru 112.</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.revokeBtn,
              isHighContrast && styles.highContrastRevokeBtn,
            ]}
            onPress={onRevoke}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.revokeBtnText,
                isHighContrast && styles.highContrastRevokeText,
              ]}
            >
              🛡️ ODWOŁAJ ALARM
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  topIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7F1D1D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  topIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#FCA5A5',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 32,
  },
  highContrastText: {
    color: '#FFFF00',
  },
  stepCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#64748B',
    opacity: 0.8,
  },
  stepCardActive: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#1E1E2E',
    opacity: 1,
  },
  highContrastCard: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFF00',
    borderLeftColor: '#FF0000',
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  stepDesc: {
    color: '#94A3B8',
    fontSize: 11,
  },
  checkIcon: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  revokeBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  revokeBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  highContrastRevokeBtn: {
    backgroundColor: '#FFFF00',
    borderWidth: 3,
    borderColor: '#000000',
  },
  highContrastRevokeText: {
    color: '#000000',
  },
});
