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

interface ContactsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ContactsModal({ visible, onClose }: ContactsModalProps) {
  const { theme, isHighContrast, showToast } = useSettings();

  const contacts = [
    { id: '1', name: 'Mama (Anna)', phone: '+48 600 111 222', status: 'Bezpieczna', relation: 'Rodzina' },
    { id: '2', name: 'Tata (Marek)', phone: '+48 600 333 444', status: 'Bezpieczny', relation: 'Rodzina' },
    { id: '3', name: 'Brat (Piotr)', phone: '+48 600 555 666', status: 'W zasięgu', relation: 'Grupa Domowa' },
    { id: '4', name: 'Numer Alarmowy 112', phone: '112', status: 'Służby Ratunkowe', relation: 'Alarmowy' },
  ];

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>👥 Moje Grupy & Kontakty</Text>
        </View>

        <ScrollView style={styles.listArea} contentContainerStyle={styles.listContent}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            OSOBY W TWOJEJ SIECI BEZPIECZEŃSTWA
          </Text>

          {contacts.map((contact) => (
            <View
              key={contact.id}
              style={[
                styles.contactCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
                isHighContrast && styles.highContrastCard,
              ]}
            >
              <View style={styles.avatarBox}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
                <Text style={[styles.contactPhone, { color: theme.textSecondary }]}>
                  {contact.phone} • {contact.relation}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => showToast(`Łączenie z ${contact.name}...`, 'info')}
              >
                <Text style={styles.callBtnText}>📞 Połącz</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  highContrastCard: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFF00',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 20,
  },
  infoBox: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
