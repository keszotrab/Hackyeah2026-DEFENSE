import AsyncStorage from '@react-native-async-storage/async-storage';

export type DangerCategory = 
  | 'threat'        // Bezpośrednie zagrożenie / Napad
  | 'suspicious'    // Podejrzana aktywność
  | 'lighting'      // Słabe / brak oświetlenia
  | 'accident'      // Wypadek / Kolizja
  | 'infrastructure'// Uszkodzona infrastruktura
  | 'other';        // Inne

export type DangerSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DangerousLocation {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  category: DangerCategory;
  severity: DangerSeverity;
  reportedBy: string;
  timestamp: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  message: string;
  timestamp: string;
  active: boolean;
}

const STORAGE_KEY_DANGERS = '@defense_app_dangers_v1';
const STORAGE_KEY_SOS = '@defense_app_sos_v1';

// Początkowe dane demonstracyjne
const INITIAL_DANGERS: DangerousLocation[] = [
  {
    id: 'demo-1',
    latitude: 52.2315,
    longitude: 21.0065,
    title: 'Słabe oświetlenie w przejściu',
    description: 'Przejście podziemne bez sprawnego oświetlenia. Należy zachować ostrożność po zmroku.',
    category: 'lighting',
    severity: 'medium',
    reportedBy: 'Patrol-01',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-2',
    latitude: 52.2260,
    longitude: 21.0180,
    title: 'Podejrzana aktywność',
    description: 'Zgłoszenie od mieszkańca: Grupa agresywnych osób w pobliżu parku.',
    category: 'suspicious',
    severity: 'high',
    reportedBy: 'Anna M.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'demo-3',
    latitude: 52.2350,
    longitude: 21.0150,
    title: 'Uszkodzona barierka ochronna',
    description: 'Prace remontowe bez właściwego oznakowania przy krawędzi jezdni.',
    category: 'infrastructure',
    severity: 'low',
    reportedBy: 'Marek K.',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const DefenseStore = {
  // --- DANGEROUS LOCATIONS ---
  async getDangerousLocations(): Promise<DangerousLocation[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_DANGERS);
      if (jsonValue != null) {
        return JSON.parse(jsonValue);
      }
      // Jeśli brak danych, zapisz i zwróć dane demo
      await AsyncStorage.setItem(STORAGE_KEY_DANGERS, JSON.stringify(INITIAL_DANGERS));
      return INITIAL_DANGERS;
    } catch (e) {
      console.error('Błąd podczas odczytu niebezpiecznych miejsc:', e);
      return INITIAL_DANGERS;
    }
  },

  async addDangerousLocation(
    danger: Omit<DangerousLocation, 'id' | 'timestamp'>
  ): Promise<DangerousLocation[]> {
    try {
      const current = await this.getDangerousLocations();
      const newEntry: DangerousLocation = {
        ...danger,
        id: `danger-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
      };
      const updated = [newEntry, ...current];
      await AsyncStorage.setItem(STORAGE_KEY_DANGERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Błąd podczas dodawania niebezpiecznego miejsca:', e);
      throw e;
    }
  },

  async deleteDangerousLocation(id: string): Promise<DangerousLocation[]> {
    try {
      const current = await this.getDangerousLocations();
      const updated = current.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY_DANGERS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Błąd podczas usuwania zagrożenia:', e);
      throw e;
    }
  },

  // --- SOS ALERTS ---
  async getSOSAlerts(): Promise<SOSAlert[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_SOS);
      if (jsonValue != null) {
        return JSON.parse(jsonValue);
      }
      return [];
    } catch (e) {
      console.error('Błąd podczas pobierania alertów SOS:', e);
      return [];
    }
  },

  async triggerSOS(
    latitude: number,
    longitude: number,
    userName: string = 'Użytkownik DEFENSE',
    message: string = 'WEZWANO POMOC SOS! Potrzebne wsparcie w lokalizacji!'
  ): Promise<SOSAlert> {
    try {
      const current = await this.getSOSAlerts();
      const newSOS: SOSAlert = {
        id: `sos-${Date.now()}`,
        userId: `user-${Math.random().toString(36).substr(2, 5)}`,
        userName,
        latitude,
        longitude,
        message,
        timestamp: new Date().toISOString(),
        active: true,
      };
      const updated = [newSOS, ...current];
      await AsyncStorage.setItem(STORAGE_KEY_SOS, JSON.stringify(updated));
      return newSOS;
    } catch (e) {
      console.error('Błąd podczas wysyłania alertu SOS:', e);
      throw e;
    }
  },

  async resolveSOS(id: string): Promise<SOSAlert[]> {
    try {
      const current = await this.getSOSAlerts();
      const updated = current.map((item) =>
        item.id === id ? { ...item, active: false } : item
      );
      await AsyncStorage.setItem(STORAGE_KEY_SOS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Błąd podczas odwoływania SOS:', e);
      throw e;
    }
  },

  async clearAllSOS(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SOS);
    } catch (e) {
      console.error('Błąd czyszczenia SOS:', e);
    }
  },
};
