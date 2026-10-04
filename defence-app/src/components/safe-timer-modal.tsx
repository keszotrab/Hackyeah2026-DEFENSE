import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSettings } from '../services/settings-context';

interface SafeTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onTimerExpired: () => void;
}

export default function SafeTimerModal({
  visible,
  onClose,
  onTimerExpired,
}: SafeTimerModalProps) {
  const { theme, isHighContrast } = useSettings();
  const [minutes, setMinutes] = useState('30');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      onClose();
      onTimerExpired();
    }
    return () => clearTimeout(timer);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    const parsed = parseInt(minutes, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setTimeLeft(parsed * 60);
      setIsActive(true);
    }
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Timer Bezpieczeństwa</Text>

          {!isActive ? (
            <>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>
                Ustaw czas. Jeśli nie odwołasz alarmu przed jego upływem, automatycznie wyślemy SOS do wybranej grupy.
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={minutes}
                  onChangeText={setMinutes}
                  maxLength={3}
                />
                <Text style={{ color: theme.text, marginLeft: 10 }}>minut</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={handleStart}>
                  <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.timerText, { color: theme.text }]}>{formatTime(timeLeft)}</Text>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>
                Naciśnij "Jestem Bezpieczny", aby zatrzymać timer.
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.safeBtn]} onPress={handleStop}>
                  <Text style={styles.safeBtnText}>Jestem Bezpieczny</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 18,
    width: 80,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e2e8f0',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: 'bold',
  },
  startBtn: {
    backgroundColor: '#3b82f6',
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  safeBtn: {
    backgroundColor: '#10b981',
  },
  safeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
