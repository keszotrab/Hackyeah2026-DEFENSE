import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SOSAlert } from '../services/defense-store';

interface SOSAlertBannerProps {
  activeSOSList: SOSAlert[];
  onResolveSOS: (id: string) => void;
  onFlyToSOS: (coords: { latitude: number; longitude: number }) => void;
}

export default function SOSAlertBanner({
  activeSOSList,
  onResolveSOS,
  onFlyToSOS,
}: SOSAlertBannerProps) {
  if (1 == 1 || !activeSOSList || activeSOSList.length === 0) {
    return null; // fix later
  }

  // Wyświetl najnowszy aktywny alarm SOS
  const currentSOS = activeSOSList[0];

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.badgeRow}>
        <Text style={styles.pulseDot}>🔴</Text>
        <Text style={styles.alertTitle}>ALARM SOS - WEZWANIE POMOCY!</Text>
        {activeSOSList.length > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{activeSOSList.length - 1}</Text>
          </View>
        )}
      </View>

      <Text style={styles.userText}>
        Osoba w niebezpieczeństwie: <Text style={styles.boldText}>{currentSOS.userName}</Text>
      </Text>

      <Text style={styles.messageText}>{currentSOS.message}</Text>

      <Text style={styles.timeText}>
        Zgłoszono: {new Date(currentSOS.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtnMap}
          onPress={() => onFlyToSOS({ latitude: currentSOS.latitude, longitude: currentSOS.longitude })}
        >
          <Text style={styles.actionBtnTextMap}>📍 ZOBACZ NA MAPIE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnResolve}
          onPress={() => onResolveSOS(currentSOS.id)}
        >
          <Text style={styles.actionBtnTextResolve}>✓ ODWOŁAJ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 60,
    left: 12,
    right: 12,
    zIndex: 999,
    backgroundColor: '#8B0000',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#FF3B30',
    shadowColor: '#FF2D55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pulseDot: {
    fontSize: 12,
    marginRight: 6,
  },
  alertTitle: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  countText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userText: {
    color: '#FFD1D1',
    fontSize: 13,
    marginBottom: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  messageText: {
    color: '#FFF',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  timeText: {
    color: '#FFAAAA',
    fontSize: 10,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnMap: {
    flex: 2,
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnTextMap: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  actionBtnResolve: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnTextResolve: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 11,
  },
});
