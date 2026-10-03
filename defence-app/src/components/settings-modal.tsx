import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSettings } from '../services/settings-context';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const {
    isDarkMode,
    isHighContrast,
    isEasyMode,
    setDarkMode,
    setHighContrast,
    setEasyMode,
    theme,
  } = useSettings();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalBox,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
            isHighContrast && styles.highContrastBorder,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>⚙️ Ustawienia</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* List options */}
          <View style={styles.content}>
            {/* Tryb Ułatwiony */}
            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Tryb ułatwiony
                </Text>
                <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                  Tylko najważniejsze, duże przyciski.
                </Text>
              </View>
              <Switch
                value={isEasyMode}
                onValueChange={setEasyMode}
                trackColor={{ false: '#475569', true: '#3B82F6' }}
                thumbColor={isEasyMode ? '#FFFFFF' : '#94A3B8'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Tryb Ciemny */}
            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Tryb ciemny
                </Text>
                <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                  Mniej męczy oczy, oszczędza baterię.
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#475569', true: '#3B82F6' }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#94A3B8'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Wysoki Kontrast */}
            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Wysoki kontrast (A11Y)
                </Text>
                <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                  Maksymalna czytelność (czarno-żółte).
                </Text>
              </View>
              <Switch
                value={isHighContrast}
                onValueChange={setHighContrast}
                trackColor={{ false: '#475569', true: '#EAB308' }}
                thumbColor={isHighContrast ? '#FFFF00' : '#94A3B8'}
              />
            </View>
          </View>

          {/* Footer Close */}
          <TouchableOpacity
            style={[
              styles.doneBtn,
              isHighContrast
                ? styles.highContrastBtn
                : { backgroundColor: '#3B82F6' },
            ]}
            onPress={onClose}
          >
            <Text
              style={[
                styles.doneBtnText,
                isHighContrast && styles.highContrastBtnText,
              ]}
            >
              Zapisz i zamknij
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  highContrastBorder: {
    borderWidth: 3,
    borderColor: '#FFFF00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    paddingVertical: 14,
    gap: 14,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  doneBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  highContrastBtn: {
    backgroundColor: '#FFFF00',
    borderWidth: 2,
    borderColor: '#000000',
  },
  highContrastBtnText: {
    color: '#000000',
  },
});
