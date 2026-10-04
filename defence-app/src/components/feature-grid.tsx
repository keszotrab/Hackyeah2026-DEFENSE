import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSettings } from '../services/settings-context';

interface FeatureGridProps {
  onOpenAlerts: () => void;
  onOpenGroups: () => void;
  onToggleMap: () => void;
  onOpenContacts: () => void;
  onOpenChatbot: () => void;
  onCheckIn: () => void;
}

export default function FeatureGrid({
  onOpenAlerts,
  onOpenGroups,
  onToggleMap,
  onOpenContacts,
  onOpenChatbot,
  onCheckIn,
}: FeatureGridProps) {
  const { isEasyMode, isHighContrast, theme } = useSettings();

  // --- TRYB UŁATWIONY (Easy Mode - 2 duże przyciski) ---
  if (isEasyMode) {
    return (
      <View style={styles.easyGrid}>
        <TouchableOpacity
          style={[
            styles.easyCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
            isHighContrast && styles.highContrastCard,
          ]}
          onPress={onOpenChatbot}
          activeOpacity={0.8}
        >
          <View style={[styles.easyIconBox, { backgroundColor: '#F3E8FF' }]}>
            <Text style={styles.easyIcon}>🤖</Text>
          </View>
          <Text style={[styles.easyCardLabel, { color: theme.text }]}>Chatbot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.easyCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
            isHighContrast && styles.highContrastCard,
          ]}
          onPress={onCheckIn}
          activeOpacity={0.8}
        >
          <View style={[styles.easyIconBox, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.easyIcon}>📍</Text>
          </View>
          <Text style={[styles.easyCardLabel, { color: theme.text }]}>Check in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- TRYB PEŁNY (Standard Mode - 6 kafelków) ---
  return (
    <View style={styles.grid}>
      {/* Alerty */}
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
          isHighContrast && styles.highContrastCard,
        ]}
        onPress={onOpenAlerts}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>Alerty</Text>
      </TouchableOpacity>

      {/* Moje grupy */}
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
          isHighContrast && styles.highContrastCard,
        ]}
        onPress={onOpenGroups}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
          <Text style={styles.icon}>👥</Text>
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>Moje grupy</Text>
      </TouchableOpacity>

      {/* Mapa */}
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
          isHighContrast && styles.highContrastCard,
        ]}
        onPress={onToggleMap}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
          <Text style={styles.icon}>🗺️</Text>
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>Mapa</Text>
      </TouchableOpacity>

      {/* Kontakt */}
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
          isHighContrast && styles.highContrastCard,
        ]}
        onPress={onOpenContacts}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
          <Text style={styles.icon}>📞</Text>
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>Kontakt</Text>
      </TouchableOpacity>

      {/* Chatbot */}
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
          isHighContrast && styles.highContrastCard,
        ]}
        onPress={onOpenChatbot}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
          <Text style={styles.icon}>🤖</Text>
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>Chatbot</Text>
      </TouchableOpacity>

      {/* Check in */}
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.border },
          isHighContrast && styles.highContrastCard,
        ]}
        onPress={onCheckIn}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
          <Text style={styles.icon}>📍</Text>
        </View>
        <Text style={[styles.cardLabel, { color: theme.text }]}>Check in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  highContrastCard: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFF00',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Easy mode styling
  easyGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  easyCard: {
    flex: 1,
    paddingVertical: 22,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 4,
  },
  easyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  easyIcon: {
    fontSize: 28,
  },
  easyCardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
