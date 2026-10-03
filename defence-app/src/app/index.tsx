import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import OSMWebView from '../components/map/OSMWebView';
import AddDangerModal from '../components/add-danger-modal';
import SOSAlertBanner from '../components/sos-alert-banner';
import SettingsModal from '../components/settings-modal';
import SOSCountdownModal from '../components/sos-countdown-modal';
import SOSEscalationModal from '../components/sos-escalation-modal';
import FeatureGrid from '../components/feature-grid';
import ChatbotModal from '../components/chatbot-modal';
import ContactsModal from '../components/contacts-modal';

import { useLocation } from '../hooks/use-location';
import { useSettings } from '../services/settings-context';
import {
  DefenseStore,
  DangerousLocation,
  SOSAlert,
} from '../services/defense-store';

export default function HomeScreen() {
  const { location, loading: locationLoading, refreshLocation } = useLocation();
  const { isDarkMode, isHighContrast, isEasyMode, theme, showToast } = useSettings();

  const [dangerousLocations, setDangerousLocations] = useState<DangerousLocation[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);

  // Modale i widoczność
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isAddDangerVisible, setIsAddDangerVisible] = useState(false);
  const [isSOSCountdownVisible, setIsSOSCountdownVisible] = useState(false);
  const [isSOSEscalationVisible, setIsSOSEscalationVisible] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isContactsVisible, setIsContactsVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Załaduj zapisane dane
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
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
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- SOS FLOW ---
  const handleStartSOSProcess = () => {
    setIsSOSCountdownVisible(true);
  };

  const handleCancelSOSCountdown = () => {
    setIsSOSCountdownVisible(false);
    showToast('Procedura SOS anulowana', 'info');
  };

  const handleCompleteSOSCountdown = async () => {
    setIsSOSCountdownVisible(false);
    setIsSOSEscalationVisible(true);
    try {
      const newSOS = await DefenseStore.triggerSOS(
        location.latitude,
        location.longitude,
        'Twój Profil (SOS)',
        'Potrzebuję pomocy w mojej lokalizacji!'
      );
      setSosAlerts((prev) => [newSOS, ...prev]);
      showToast('Wysłano sygnał SOS!', 'error');
    } catch {
      showToast('Nie udało się nadać sygnału SOS', 'error');
    }
  };

  const handleRevokeSOS = async () => {
    setIsSOSEscalationVisible(false);
    if (sosAlerts.length > 0) {
      const updated = await DefenseStore.resolveSOS(sosAlerts[0].id);
      setSosAlerts(updated.filter((s) => s.active));
    }
    showToast('Alarm SOS został odwołany', 'success');
  };

  // --- DODAWANIE ZAGROŻENIA ---
  const handleSaveDanger = async (dangerData: Omit<DangerousLocation, 'id' | 'timestamp'>) => {
    try {
      const updated = await DefenseStore.addDangerousLocation(dangerData);
      setDangerousLocations(updated);
      showToast('Punkt zagrożenia został dodany!', 'success');
    } catch {
      showToast('Nie udało się dodać punktu', 'error');
    }
  };

  const handleDeleteDanger = async (id: string) => {
    try {
      const updated = await DefenseStore.deleteDangerousLocation(id);
      setDangerousLocations(updated);
      showToast('Usunięto znacznik', 'info');
    } catch {
      showToast('Nie udało się usunąć znacznika', 'error');
    }
  };

  const activeSOSCount = sosAlerts.length;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.bg },
        isHighContrast && styles.highContrastContainer,
      ]}
    >
      <StatusBar
        barStyle={isDarkMode || isHighContrast ? 'light-content' : 'dark-content'}
        backgroundColor={theme.headerBg}
      />

      {/* NAGŁÓWEK - CENTRUM BEZPIECZEŃSTWA */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
          isHighContrast && styles.highContrastBorderBottom,
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogoIcon}>🛡️</Text>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>
            Centrum Bezpieczeństwa
          </Text>
        </View>

        <View style={styles.headerRight}>
          {!isEasyMode && (
            <>
              {/* Powiadomienia */}
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => showToast('Brak nowych powiadomień', 'info')}
              >
                <Text style={styles.headerIconText}>🔔</Text>
                <View style={styles.notifBadge} />
              </TouchableOpacity>

              {/* Profil */}
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => showToast('Profil użytkownika DEFENSE', 'info')}
              >
                <Text style={styles.headerIconText}>👤</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Ustawienia (Zawsze widoczne) */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsSettingsVisible(true)}
          >
            <Text style={styles.headerIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BANER ALARMU SOS */}
      <SOSAlertBanner
        activeSOSList={sosAlerts}
        onResolveSOS={async (id) => {
          const updated = await DefenseStore.resolveSOS(id);
          setSosAlerts(updated.filter((s) => s.active));
          showToast('Odwołano alert SOS', 'success');
        }}
        onFlyToSOS={(coords) => {
          setSelectedCoords(coords);
          setIsMapVisible(true);
        }}
      />

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* DUŻY CENTRALNY PRZYCISK SOS / POMOC */}
        <View style={styles.sosSection}>
          <TouchableOpacity
            style={[
              styles.sosMainBtn,
              isEasyMode && styles.sosMainBtnEasy,
              isHighContrast && styles.highContrastSOSBtn,
            ]}
            onPress={handleStartSOSProcess}
            activeOpacity={0.85}
          >
            <Text style={[styles.sosIcon, isEasyMode && styles.sosIconEasy]}>🚨</Text>
            <Text
              style={[
                styles.sosText,
                isEasyMode && styles.sosTextEasy,
                isHighContrast && styles.highContrastSOSText,
              ]}
            >
              {isEasyMode ? 'POMOC' : 'POTRZEBUJĘ\nPOMOCY'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.sosSubtext, { color: theme.textSecondary }]}>
            Naciśnij w nagłej sytuacji
          </Text>
        </View>

        {/* SIATKA SKRÓTÓW FUNKCJI (GRID) */}
        <FeatureGrid
          onOpenAlerts={() => {
            setSelectedCoords({ latitude: location.latitude, longitude: location.longitude });
            setIsAddDangerVisible(true);
          }}
          onOpenGroups={() => setIsContactsVisible(true)}
          onToggleMap={() => {
            setIsMapVisible(!isMapVisible);
            showToast(isMapVisible ? 'Ukryto mapę' : 'Otwarto mapę taktyczną', 'info');
          }}
          onOpenContacts={() => setIsContactsVisible(true)}
          onOpenChatbot={() => setIsChatbotVisible(true)}
          onCheckIn={() => {}}
        />

        {/* WIDOK MAPY TAKTYCZNEJ */}
        {isMapVisible && (
          <View
            style={[
              styles.mapWrapper,
              { borderColor: theme.border },
              isHighContrast && styles.highContrastCardBorder,
            ]}
          >
            <View style={[styles.mapHeader, { backgroundColor: theme.cardBg }]}>
              <View style={styles.mapHeaderTitleRow}>
                <Text style={styles.mapHeaderIcon}>📍</Text>
                <Text style={[styles.mapHeaderTitle, { color: theme.text }]}>
                  Mapa Taktyczna {activeSOSCount > 0 ? `(🚨 ${activeSOSCount} SOS)` : ''}
                </Text>
              </View>

              <View style={styles.mapHeaderControls}>
                <TouchableOpacity style={styles.mapControlChip} onPress={refreshLocation}>
                  <Text style={styles.mapControlChipText}>🎯 Moja Pozycja</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mapControlChip}
                  onPress={() => setIsDrawerOpen(!isDrawerOpen)}
                >
                  <Text style={styles.mapControlChipText}>
                    📋 Lista ({dangerousLocations.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.mapFrame}>
              {locationLoading ? (
                <View style={styles.mapLoader}>
                  <ActivityIndicator size="large" color="#DC2626" />
                </View>
              ) : (
                <OSMWebView
                  userLocation={{ latitude: location.latitude, longitude: location.longitude }}
                  dangerousLocations={dangerousLocations}
                  sosAlerts={sosAlerts}
                  onMapClick={(coords) => {
                    setSelectedCoords(coords);
                    setIsAddDangerVisible(true);
                  }}
                  zoom={14}
                  themeMode={isHighContrast ? 'highcontrast' : isDarkMode ? 'dark' : 'light'}
                />
              )}
            </View>
          </View>
        )}

        {/* DRAWER LISTA ZAGROŻEŃ */}
        {isDrawerOpen && (
          <View
            style={[
              styles.drawerBox,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
              isHighContrast && styles.highContrastCardBorder,
            ]}
          >
            <Text style={[styles.drawerTitle, { color: theme.text }]}>
              ⚠️ Oznaczone zagrożenia na mapie ({dangerousLocations.length})
            </Text>
            {dangerousLocations.map((item) => (
              <View key={item.id} style={styles.dangerRow}>
                <View style={styles.dangerRowInfo}>
                  <Text style={[styles.dangerRowTitle, { color: '#EF4444' }]}>{item.title}</Text>
                  <Text style={[styles.dangerRowDesc, { color: theme.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteDanger(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODALE */}
      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />

      <AddDangerModal
        visible={isAddDangerVisible}
        initialCoords={selectedCoords}
        onClose={() => setIsAddDangerVisible(false)}
        onSave={handleSaveDanger}
      />

      <SOSCountdownModal
        visible={isSOSCountdownVisible}
        onCancel={handleCancelSOSCountdown}
        onComplete={handleCompleteSOSCountdown}
      />

      <SOSEscalationModal
        visible={isSOSEscalationVisible}
        onRevoke={handleRevokeSOS}
      />

      <ChatbotModal
        visible={isChatbotVisible}
        onClose={() => setIsChatbotVisible(false)}
      />

      <ContactsModal
        visible={isContactsVisible}
        onClose={() => setIsContactsVisible(false)}
      />
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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  highContrastBorderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFF00',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  headerIconText: {
    fontSize: 18,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  // SOS SECTION
  sosSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  sosMainBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(254, 202, 202, 0.4)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  sosMainBtnEasy: {
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  highContrastSOSBtn: {
    backgroundColor: '#FF0000',
    borderColor: '#FFFFFF',
    borderWidth: 6,
  },
  sosIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  sosIconEasy: {
    fontSize: 56,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  sosTextEasy: {
    fontSize: 26,
  },
  highContrastSOSText: {
    color: '#FFFFFF',
  },
  sosSubtext: {
    fontSize: 12,
    marginTop: 14,
    fontWeight: '500',
  },
  // MAP SECTION
  mapWrapper: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  highContrastCardBorder: {
    borderWidth: 2,
    borderColor: '#FFFF00',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mapHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapHeaderIcon: {
    fontSize: 16,
  },
  mapHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  mapHeaderControls: {
    flexDirection: 'row',
    gap: 6,
  },
  mapControlChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  mapControlChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  mapFrame: {
    height: 280,
    backgroundColor: '#0F172A',
  },
  mapLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerBox: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dangerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  dangerRowInfo: {
    flex: 1,
    paddingRight: 10,
  },
  dangerRowTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  dangerRowDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
