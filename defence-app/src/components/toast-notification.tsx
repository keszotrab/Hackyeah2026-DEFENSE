import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { useSettings } from '../services/settings-context';

export default function ToastNotification() {
  const { toast, hideToast, isHighContrast } = useSettings();
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (toast.visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          hideToast();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.visible, fadeAnim, hideToast]);

  if (!toast.visible) return null;

  let icon = 'ℹ️';
  let badgeColor = '#3B82F6';

  if (toast.type === 'success') {
    icon = '✅';
    badgeColor = '#22C55E';
  } else if (toast.type === 'error') {
    icon = '🚨';
    badgeColor = '#EF4444';
  } else if (toast.type === 'warning') {
    icon = '⚠️';
    badgeColor = '#F59E0B';
  }

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        isHighContrast && styles.highContrastToast,
        { opacity: fadeAnim },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: badgeColor }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={[styles.messageText, isHighContrast && styles.highContrastText]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 75,
    alignSelf: 'center',
    zIndex: 9999,
    backgroundColor: '#1E293B',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  highContrastToast: {
    backgroundColor: '#000000',
    borderColor: '#FFFF00',
    borderWidth: 2,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 12,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  highContrastText: {
    color: '#FFFF00',
  },
});
