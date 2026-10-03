import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { DangerCategory, DangerSeverity, DangerousLocation } from '../services/defense-store';
import { useSettings } from '../services/settings-context';

interface AddDangerModalProps {
  visible: boolean;
  initialCoords: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onSave: (danger: Omit<DangerousLocation, 'id' | 'timestamp'>) => void;
}

const CATEGORIES: { label: string; value: DangerCategory; icon: string }[] = [
  { label: 'Zagrożenie / Napad', value: 'threat', icon: '🚨' },
  { label: 'Podejrzana aktywność', value: 'suspicious', icon: '👁️' },
  { label: 'Brak oświetlenia', value: 'lighting', icon: '💡' },
  { label: 'Wypadek / Kolizja', value: 'accident', icon: '🚗' },
  { label: 'Uszkodzona infrastruktura', value: 'infrastructure', icon: '🚧' },
  { label: 'Inne zagrożenie', value: 'other', icon: '⚠️' },
];

const SEVERITIES: { label: string; value: DangerSeverity; color: string }[] = [
  { label: 'Niski', value: 'low', color: '#457B9D' },
  { label: 'Średni', value: 'medium', color: '#FCBF49' },
  { label: 'Wysoki', value: 'high', color: '#F77F00' },
  { label: 'Krytyczny', value: 'critical', color: '#E63946' },
];

export default function AddDangerModal({
  visible,
  initialCoords,
  onClose,
  onSave,
}: AddDangerModalProps) {
  const { theme } = useSettings();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DangerCategory>('threat');
  const [severity, setSeverity] = useState<DangerSeverity>('high');
  const [reporterName, setReporterName] = useState('Użytkownik DEFENSE');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('threat');
    setSeverity('high');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Proszę podać tytuł zgłoszenia.');
      return;
    }
    if (!initialCoords) {
      alert('Brak współrzędnych geograficznych.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      latitude: initialCoords.latitude,
      longitude: initialCoords.longitude,
      reportedBy: reporterName.trim() || 'Anonim',
    });
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.cardBg }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Text style={[styles.backButtonText, { color: theme.text }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              ⚠️ Oznacz Niebezpieczne Miejsce
            </Text>
          </View>

          <ScrollView style={styles.formContent} keyboardShouldPersistTaps="handled">
            {initialCoords && (
              <View style={[styles.coordsBox, { backgroundColor: theme.bg }]}>
                <Text style={[styles.coordsLabel, { color: theme.textSecondary }]}>
                  📍 Lokalizacja znacznika:
                </Text>
                <Text style={[styles.coordsValue, { color: theme.text }]}>
                  {initialCoords.latitude.toFixed(5)}, {initialCoords.longitude.toFixed(5)}
                </Text>
              </View>
            )}

            <Text style={[styles.inputLabel, { color: theme.text }]}>Tytuł zgłoszenia *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bg, color: theme.text }]}
              placeholder="np. Brak latarni, podejrzany pojazd"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Kategoria zagrożenia</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    category === cat.value && styles.categoryChipSelected,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      { color: theme.textSecondary },
                      category === cat.value && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Poziom niebezpieczeństwa</Text>
            <View style={styles.severityRow}>
              {SEVERITIES.map((sev) => (
                <TouchableOpacity
                  key={sev.value}
                  style={[
                    styles.severityBtn,
                    { borderColor: sev.color },
                    severity === sev.value && { backgroundColor: sev.color },
                  ]}
                  onPress={() => setSeverity(sev.value)}
                >
                  <Text
                    style={[
                      styles.severityText,
                      { color: theme.textSecondary },
                      severity === sev.value && styles.severityTextSelected,
                    ]}
                  >
                    {sev.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Szczegółowy opis</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.bg, color: theme.text }]}
              placeholder="Opisz zagrożenie, aby inni użytkownicy wiedzieli, na co uważać..."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Zgłaszający</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bg, color: theme.text }]}
              placeholder="Twoja nazwa / pseudonim"
              placeholderTextColor="#666"
              value={reporterName}
              onChangeText={setReporterName}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primaryRed }]}
              onPress={handleSubmit}
            >
              <Text style={styles.saveBtnText}>Dodaj Punkt Na Mapie</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  coordsBox: {
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coordsLabel: {
    color: '#A0A0A5',
    fontSize: 12,
  },
  coordsValue: {
    color: '#30D158',
    fontWeight: 'bold',
    fontSize: 13,
  },
  inputLabel: {
    color: '#EBEBF5',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  categoryChipSelected: {
    backgroundColor: '#FF453A',
    borderColor: '#FF453A',
  },
  categoryIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  categoryText: {
    color: '#CCC',
    fontSize: 12,
  },
  categoryTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  severityText: {
    color: '#CCC',
    fontSize: 12,
    fontWeight: '500',
  },
  severityTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
