import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings } from '../services/settings-context';

interface CheckInLocation {
  latitude: number;
  longitude: number;
}

interface CheckInModalProps {
  visible: boolean;
  location: CheckInLocation;
  onClose: () => void;
}

const recipients = [
  { id: 'mama', name: 'Mama', group: 'Grupa Rodzinna', initial: 'M' },
];

export default function CheckInModal({ visible, location, onClose }: CheckInModalProps) {
  const { theme, isHighContrast, showToast } = useSettings();
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedRecipient(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedRecipient) {
      showToast('Wybierz osobę z listy', 'error');
      return;
    }

    const recipient = recipients.find((item) => item.id === selectedRecipient);
    if (!recipient) {
      showToast('Nie udało się wybrać odbiorcy', 'error');
      return;
    }

    handleClose();
    showToast(
      `Wysłano do: ${recipient.name} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`,
      'success'
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View
          style={[
            styles.header,
            { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
            isHighContrast && styles.highContrastBorder,
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.backButton} accessibilityLabel="Wróć">
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Check in</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.safeCard,
              { backgroundColor: theme.cardBg, borderColor: '#22C55E' },
              isHighContrast && styles.highContrastCard,
            ]}
          >
            <View style={styles.safeIcon}>
              <Text style={styles.safeIconText}>🛡️</Text>
            </View>
            <Text style={[styles.safeTitle, { color: isHighContrast ? theme.text : '#15803D' }]}>
              Jestem bezpieczny/a
            </Text>
            <Text style={[styles.safeDescription, { color: theme.textSecondary }]}>
              Wybierz osobę, aby wysłać powiadomienie z potwierdzeniem Twojego bezpieczeństwa i
              obecną lokalizacją.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Wybierz odbiorcę wiadomości
          </Text>

          {recipients.map((recipient) => {
            const isSelected = selectedRecipient === recipient.id;
            return (
              <TouchableOpacity
                key={recipient.id}
                style={[
                  styles.recipient,
                  { backgroundColor: theme.cardBg, borderColor: isSelected ? '#22C55E' : theme.border },
                  isSelected && styles.selectedRecipient,
                  isHighContrast && styles.highContrastCard,
                ]}
                onPress={() => setSelectedRecipient(recipient.id)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{recipient.initial}</Text>
                </View>
                <View style={styles.recipientInfo}>
                  <Text style={[styles.recipientName, { color: theme.text }]}>{recipient.name}</Text>
                  <Text style={[styles.recipientGroup, { color: theme.textSecondary }]}>
                    {recipient.group}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkIndicator,
                    { borderColor: isSelected ? '#22C55E' : theme.textSecondary },
                    isSelected && styles.checkedIndicator,
                  ]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.cardBg, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.submitButton, !selectedRecipient && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>✈  WYŚLIJ CHECK-IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  highContrastBorder: { borderBottomWidth: 2, borderBottomColor: '#FFFF00' },
  backButton: { padding: 8, marginRight: 8 },
  backButtonText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  content: { padding: 16, paddingBottom: 24 },
  safeCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  highContrastCard: { backgroundColor: '#000000', borderWidth: 2, borderColor: '#FFFF00' },
  safeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  safeIconText: { fontSize: 26 },
  safeTitle: { fontSize: 17, fontWeight: 'bold' },
  safeDescription: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  recipient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  selectedRecipient: { borderWidth: 2, backgroundColor: '#F0FDF4' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#2563EB', fontSize: 18, fontWeight: 'bold' },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 15, fontWeight: 'bold' },
  recipientGroup: { fontSize: 12, marginTop: 3 },
  checkIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedIndicator: { backgroundColor: '#22C55E' },
  checkmark: { color: '#FFFFFF', fontWeight: 'bold' },
  footer: { padding: 16, borderTopWidth: 1 },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.55 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
