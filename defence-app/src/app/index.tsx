import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import OSMWebView from '../components/map/OSMWebView';
import AddDangerModal from '../components/add-danger-modal';
import SOSAlertBanner from '../components/sos-alert-banner';
import { useLocation } from '../hooks/use-location';
import {
  DefenseStore,
  DangerousLocation,
  SOSAlert,
} from '../services/defense-store';

export default function HomeScreen() {
  const { location, isPermissionGranted, loading: locationLoading, refreshLocation } = useLocation();

  const [dangerousLocations, setDangerousLocations] = useState<DangerousLocation[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  
  // Stany UI
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(0));

  // Pobierz dane z pamięci po załadowaniu
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const dangers = await DefenseStore.getDangerousLocations();
        const sosList = await DefenseStore.getSOSAlerts();
        if (isMounted) {
          setDangerousLocations(dangers);
          setSosAlerts(sosList.filter((s) => s.active));
        }
      } catch (e) {
        console.error('Błąd ładowania danych:', e);
      }
    }
    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Uruchomienie alarmu SOS przez użytkownika
  const handleTriggerSOS = () => {
    Alert.alert(
      '🚨 WEZWANIE POMOCY SOS',
      'Czy na pewno chcesz wysłać sygnał SOS? Wszyscy użytkownicy aplikacji w okolicy zostaną natychmiast powiadomieni!',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'WYŚLIJ SOS NOW!',
          style: 'destructive',
          onPress: async () => {
            try {
              const newSOS = await DefenseStore.triggerSOS(
                location.latitude,
                location.longitude,
                'Twój Profil (SOS)',
                'Potrzebuję pilnej pomocy! Sprawdź moją lokalizację na mapie!'
              );
              setSosAlerts((prev) => [newSOS, ...prev]);
              Alert.alert('✅ WYSŁANO ALARM SOS', 'Twój sygnał pomocy został rozesłany do innych użytkowników!');
            } catch {
              Alert.alert('Błąd', 'Nie udało się wysłać alarmu SOS.');
            }
          },
        },
      ]
    );
  };

  // Symulacja odbioru powiadomienia SOS od innego użytkownika (narzędzie testowe)
  const handleSimulateIncomingSOS = async () => {
    const offsetLat = (Math.random() - 0.5) * 0.008;
    const offsetLng = (Math.random() - 0.5) * 0.008;
    const incomingLat = location.latitude + offsetLat;
    const incomingLng = location.longitude + offsetLng;

    const testUserNames = ['Jan Kowalski', 'Patrol Cywilny #4', 'Marta Z.', 'Użytkownik #882'];
    const randomUser = testUserNames[Math.floor(Math.random() * testUserNames.length)];

    const newSOS = await DefenseStore.triggerSOS(
      incomingLat,
      incomingLng,
      randomUser,
      '🚨 Zagrożenie bezpieczeństwa w okolicy! Potrzebna asysta!'
    );

    setSosAlerts((prev) => [newSOS, ...prev]);
  };

  // Dodanie nowego niebezpiecznego miejsca z formularza
  const handleSaveDanger = async (
    dangerData: Omit<DangerousLocation, 'id' | 'timestamp'>
  ) => {
    try {
      const updated = await DefenseStore.addDangerousLocation(dangerData);
      setDangerousLocations(updated);
      Alert.alert('Oznaczono Miejsce', 'Punkt zagrożenia został pomyślnie dodany do mapy.');
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać punktu.');
    }
  };

  // Usunięcie niebezpiecznego miejsca
  const handleDeleteDanger = async (id: string) => {
    try {
      const updated = await DefenseStore.deleteDangerousLocation(id);
      setDangerousLocations(updated);
    } catch {
      Alert.alert('Błąd', 'Nie udało się usunąć znacznika.');
    }
  };

  // Rozwiązanie / odwołanie alarmu SOS
  const handleResolveSOS = async (id: string) => {
    try {
      const updated = await DefenseStore.resolveSOS(id);
      setSosAlerts(updated.filter((s) => s.active));
    } catch (e) {
      console.error(e);
    }
  };

  // Kliknięcie w dowolne miejsce na mapie (dodawanie znacznika w tym punkcie)
  const handleMapClick = (coords: { latitude: number; longitude: number }) => {
    setSelectedCoords(coords);
    setIsAddModalVisible(true);
  };

  // Przycisk "Dodaj przy mojej pozycji"
  const handleAddAtCurrentLocation = () => {
    setSelectedCoords({ latitude: location.latitude, longitude: location.longitude });
    setIsAddModalVisible(true);
  };

  // Przełączanie widoczności listy zagrożeń
  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    setIsDrawerOpen(!isDrawerOpen);
    Animated.timing(drawerAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const activeSOSCount = sosAlerts.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Górny Pasek Taktyczny */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <View>
            <Text style={styles.title}>DEFENSE APP</Text>
            <Text style={styles.subtitle}>System Ochrony & Reagowania Kryzysowego</Text>
          </View>
        </View>

        <View style={styles.statusGroup}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isPermissionGranted ? '#30D158' : '#FF9500' },
              ]}
            />
            <Text style={styles.statusText}>
              {isPermissionGranted ? 'GPS Aktywny' : 'GPS Domyślny'}
            </Text>
          </View>

          {activeSOSCount > 0 && (
            <View style={styles.sosBadge}>
              <Text style={styles.sosBadgeText}>🚨 SOS ({activeSOSCount})</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pasek Powiadomienia o Aktywnym SOS */}
      <SOSAlertBanner
        activeSOSList={sosAlerts}
        onResolveSOS={handleResolveSOS}
        onFlyToSOS={(coords) => {
          setSelectedCoords(coords);
        }}
      />

      {/* Komponent Mapy */}
      <View style={styles.mapContainer}>
        {locationLoading ? (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color="#FF3B30" />
            <Text style={styles.loaderText}>Inicjalizacja GPS...</Text>
          </View>
        ) : (
          <OSMWebView
            userLocation={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            dangerousLocations={dangerousLocations}
            sosAlerts={sosAlerts}
            onMapClick={handleMapClick}
            zoom={14}
          />
        )}

        {/* Pływające Przyciski Sterujące Mapą */}
        <View style={styles.floatingControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={refreshLocation}>
            <Text style={styles.controlBtnIcon}>🎯</Text>
            <Text style={styles.controlBtnText}>Moja Pozycja</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={handleAddAtCurrentLocation}>
            <Text style={styles.controlBtnIcon}>➕</Text>
            <Text style={styles.controlBtnText}>Zgłoś Miejsce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleDrawer}>
            <Text style={styles.controlBtnIcon}>📋</Text>
            <Text style={styles.controlBtnText}>
              Wykaz ({dangerousLocations.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.simBtn} onPress={handleSimulateIncomingSOS}>
            <Text style={styles.simBtnText}>🧪 Test Odbioru SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dolny Panel Zagrożeń (Drawer) */}
      {isDrawerOpen && (
        <View style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>
              ⚠️ Oznaczone Niebezpieczne Miejsca ({dangerousLocations.length})
            </Text>
            <TouchableOpacity onPress={toggleDrawer} style={styles.closeDrawerBtn}>
              <Text style={styles.closeDrawerText}>✕ Zamknij</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerList}>
            {dangerousLocations.length === 0 ? (
              <Text style={styles.emptyText}>Brak zarejestrowanych zagrożeń na mapie.</Text>
            ) : (
              dangerousLocations.map((item) => (
                <View key={item.id} style={styles.dangerCard}>
                  <View style={styles.dangerCardHeader}>
                    <Text style={styles.dangerCardTitle}>{item.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteDanger(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>Usuń</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.dangerCardDesc}>{item.description}</Text>
                  <View style={styles.dangerCardMeta}>
                    <Text style={styles.dangerMetaText}>
                      Kategoria: <Text style={styles.whiteText}>{item.category}</Text>
                    </Text>
                    <Text style={styles.dangerMetaText}>
                      Zgłosił: <Text style={styles.whiteText}>{item.reportedBy}</Text>
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Główny Przycisk Kryzysowy SOS */}
      <View style={styles.sosButtonContainer}>
        <TouchableOpacity
          style={styles.sosMainButton}
          onPress={handleTriggerSOS}
          activeOpacity={0.8}
        >
          <View style={styles.sosButtonInner}>
            <Text style={styles.sosIcon}>🚨</Text>
            <Text style={styles.sosButtonText}>POTRZEBUJĘ POMOCY! (SOS)</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal Dodawania Zagrożenia */}
      <AddDangerModal
        visible={isAddModalVisible}
        initialCoords={selectedCoords}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleSaveDanger}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    color: '#8E8E93',
  },
  statusGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#CCC',
    fontSize: 11,
    fontWeight: '600',
  },
  sosBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sosBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loaderText: {
    color: '#AAA',
    marginTop: 10,
    fontSize: 13,
  },
  floatingControls: {
    position: 'absolute',
    top: 14,
    right: 12,
    gap: 8,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  controlBtnIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  controlBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  simBtn: {
    backgroundColor: 'rgba(58, 58, 60, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  simBtnText: {
    color: '#FFD60A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  drawerContainer: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    right: 12,
    height: 240,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    zIndex: 900,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  drawerTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  closeDrawerBtn: {
    padding: 4,
  },
  closeDrawerText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  drawerList: {
    flex: 1,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
  dangerCard: {
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  dangerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dangerCardTitle: {
    color: '#FF453A',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dangerCardDesc: {
    color: '#CCC',
    fontSize: 12,
    marginBottom: 6,
  },
  dangerCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dangerMetaText: {
    color: '#8E8E93',
    fontSize: 10,
  },
  whiteText: {
    color: '#FFF',
  },
  sosButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  sosMainButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  sosButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sosButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
