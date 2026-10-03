import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useSettings } from '../services/settings-context';

interface SOSCountdownModalProps {
  visible: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

export default function SOSCountdownModal({
  visible,
  onCancel,
  onComplete,
}: SOSCountdownModalProps) {
  const { theme, isHighContrast } = useSettings();
  const [countdown, setCountdown] = useState<number>(5);
  const [spinValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      spinValue.setValue(0);

      const animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        animation.stop();
        clearInterval(timer);
      };
    }
  }, [visible, spinValue, onComplete]);

  if (!visible) return null;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Inicjowanie procedury ratunkowej...
        </Text>

        <View style={styles.timerCircleBox}>
          <Animated.View
            style={[
              styles.spinnerRing,
              { transform: [{ rotate: spin }] },
              isHighContrast && styles.highContrastRing,
            ]}
          />
          <Text style={[styles.countdownText, { color: theme.text }]}>
            {countdown}
          </Text>
        </View>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Masz 5 sekund na anulowanie zgłoszenia, jeśli przycisk został wciśnięty przypadkowo.
        </Text>

        <TouchableOpacity
          style={[
            styles.cancelBtn,
            isHighContrast && styles.highContrastCancelBtn,
          ]}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.cancelBtnText,
              isHighContrast && styles.highContrastCancelText,
            ]}
          >
            ANULUJ ZGŁOSZENIE
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  timerCircleBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  spinnerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderTopColor: '#EF4444',
  },
  highContrastRing: {
    borderColor: '#FFFF00',
    borderTopColor: '#FF0000',
    borderWidth: 8,
  },
  countdownText: {
    fontSize: 64,
    fontWeight: '900',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  cancelBtn: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#334155',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  highContrastCancelBtn: {
    backgroundColor: '#FFFF00',
    borderWidth: 3,
    borderColor: '#000000',
  },
  highContrastCancelText: {
    color: '#000000',
  },
});
