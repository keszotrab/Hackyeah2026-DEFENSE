import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useSettings } from '../services/settings-context';

export default function GroupsScreen() {
  const { theme, isHighContrast } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }, isHighContrast && styles.highContrastContainer]}>
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.cardBg }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Moje Grupy & Społeczność</Text>
      </View>
      
      <ScrollView style={styles.scroll}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Rodzina (Najbliżsi)</Text>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Osoby powiadamiane jako pierwsze w nagłych wypadkach.</Text>
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>👨‍👩‍👧‍👦 Grupa: Rodzina Kowalskich</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>4 osoby online. Ostatni check-in: 10 min temu.</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.btnSmall}>
                <Text style={styles.btnSmallText}>Check-in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSmall}>
                <Text style={styles.btnSmallText}>Czat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Społeczność</Text>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Dołącz do lokalnych społeczności np. klasy, uczelni, osiedla.</Text>
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>🏫 Grupa: Liceum 3b</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>25 osób w grupie. Hierarchia wiadomości (Mesh/WiFi/Kom).</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Osoby w pobliżu</Text>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Użytkownicy DEFENSE w promieniu 2km (Sieć Mesh).</Text>
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>📡 Radar Aktywny</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Wykryto 12 urządzeń w pobliżu.</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ogłoszenia / Zaginieni</Text>
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>🔎 Zgłoś zaginięcie</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Wysyła alert do wszystkich użytkowników w promieniu 10km.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  highContrastContainer: {
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  btnSmall: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
