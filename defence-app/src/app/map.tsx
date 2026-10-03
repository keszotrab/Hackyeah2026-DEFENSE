import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import OSMWebView from '../components/map/OSMWebView';
import AddDangerModal from '../components/add-danger-modal';
import { useLocation } from '../hooks/use-location';
import { useSettings } from '../services/settings-context';
import {
  DefenseStore,
  DangerousLocation,
  SOSAlert,
} from '../services/defense-store';

export default function MapScreen() {
  const { location, loading: locationLoading, refreshLocation } = useLocation();
  const { isDarkMode, isHighContrast, theme, showToast } = useSettings();

  const [dangerousLocations, setDangerousLocations] = useState<DangerousLocation[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);

  const [isAddDangerVisible, setIsAddDangerVisible] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const locs = await DefenseStore.getDangerousLocations();
    const alerts = await DefenseStore.getSOSAlerts();
    setDangerousLocations(locs);
    setSosAlerts(alerts);
  };

  const handleSaveDanger = async (danger: Omit<DangerousLocation, 'id' | 'timestamp'>) => {
    await DefenseStore.addDangerousLocation(danger);
    setIsAddDangerVisible(false);
    loadData();
    showToast('Oznaczono miejsce jako niebezpieczne na mapie.');
  };

  const handleDeleteDanger = async (id: string) => {
    await DefenseStore.deleteDangerousLocation(id);
    loadData();
    showToast('Usunięto zgłoszenie z mapy.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }, isHighContrast && styles.highContrastContainer]}>
      <View style={styles.mapWrapper}>
        <View style={styles.mapHeader}>
          <View style={styles.mapHeaderTitleRow}>
            <Text style={styles.mapHeaderIcon}>📍</Text>
            <Text style={[styles.mapHeaderTitle, { color: theme.text }]}>Mapa Zagrożeń</Text>
          </View>
          <View style={styles.mapHeaderControls}>
            <TouchableOpacity style={styles.mapControlChip} onPress={refreshLocation}>
              <Text style={styles.mapControlChipText}>🔄 Pozycja</Text>
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
              onInteractionStart={() => setIsMapInteracting(true)}
              onInteractionEnd={() => setIsMapInteracting(false)}
              zoom={14}
              themeMode={isHighContrast ? 'highcontrast' : isDarkMode ? 'dark' : 'light'}
            />
          )}
        </View>
      </View>

      {isDrawerOpen && (
        <View
          style={[
            styles.drawerBox,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
            isHighContrast && styles.highContrastCardBorder,
          ]}
        >
          <Text style={[styles.drawerTitle, { color: theme.text }]}>
            📍 Oznaczone zagrożenia na mapie ({dangerousLocations.length})
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

      <AddDangerModal
        visible={isAddDangerVisible}
        initialCoords={selectedCoords}
        onClose={() => setIsAddDangerVisible(false)}
        onSave={handleSaveDanger}
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
  mapWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    fontSize: 16,
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
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerBox: {
    margin: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    zIndex: 10,
  },
  highContrastCardBorder: {
    borderWidth: 2,
    borderColor: '#FFFF00',
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
