import React, { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OSMWebView from "../components/map/OSMWebView";
import AddDangerModal from "../components/add-danger-modal";
import SOSAlertBanner from "../components/sos-alert-banner";
import SettingsModal from "../components/settings-modal";
import SOSCountdownModal from "../components/sos-countdown-modal";
import SOSEscalationModal from "../components/sos-escalation-modal";
import ChatbotModal from "../components/chatbot-modal";
import ContactsModal from "../components/contacts-modal";
import FeatureGrid from "../components/feature-grid";
import SafeTimerModal from "../components/safe-timer-modal";

import { useLocation } from "../hooks/use-location";
import { useSettings } from "../services/settings-context";
import { DefenseStore, SOSAlert } from "../services/defense-store";

export default function HomeScreen() {
  const { location } = useLocation();
  const { isDarkMode, isHighContrast, isEasyMode, theme, showToast } =
    useSettings();

  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [isStatusBarVisible, setIsStatusBarVisible] = useState(false);
  const previousScrollOffset = useRef(0);
  const accumulatedScrollDelta = useRef(0);

  // Modale i widoczność
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isSOSCountdownVisible, setIsSOSCountdownVisible] = useState(false);
  const [isSOSEscalationVisible, setIsSOSEscalationVisible] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isContactsVisible, setIsContactsVisible] = useState(false);
  const [isSafeTimerVisible, setIsSafeTimerVisible] = useState(false);

  // Tryby alarmowania
  const [alertMode, setAlertMode] = useState<
    "rodzina" | "spolecznosc" | "poblizu"
  >("rodzina");

  // Załaduj zapisane dane
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const alerts = await DefenseStore.getSOSAlerts();
    setSosAlerts(alerts);
  };

  const handleStartSOSProcess = () => {
    if (isEasyMode) {
      handleCompleteSOSCountdown();
    } else {
      setIsSOSCountdownVisible(true);
    }
  };

  const handleCancelSOSCountdown = () => {
    setIsSOSCountdownVisible(false);
    showToast("Anulowano SOS", "info");
  };

  const handleCompleteSOSCountdown = async () => {
    setIsSOSCountdownVisible(false);
    await DefenseStore.triggerSOS(location.latitude, location.longitude);
    setIsSOSEscalationVisible(true);
    loadData();

    let modeText = "najbliższych (Rodzina)";
    if (alertMode === "spolecznosc")
      modeText = "społeczności (np. Twoja klasa)";
    if (alertMode === "poblizu") modeText = "osób w pobliżu (Radar)";
    showToast(`Wysłano powiadomienie do: ${modeText}`);
  };

  const handleRevokeSOS = async () => {
    setIsSOSEscalationVisible(false);
    const active = sosAlerts.find((s) => s.active);
    if (active) {
      await DefenseStore.resolveSOS(active.id);
    }
    loadData();
    showToast("Odwołano wezwanie pomocy");
  };

  const renderAlertModeSelector = () => (
    <View style={styles.alertModeContainer}>
      <Text style={[styles.alertModeTitle, { color: theme.text }]}>
        Odbiorcy alertu (Tryb)
      </Text>
      <View style={styles.alertModeRow}>
        <TouchableOpacity
          style={[
            styles.alertModeBtn,
            {
              backgroundColor:
                alertMode === "rodzina" ? "#3B82F6" : theme.cardBg,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setAlertMode("rodzina")}
        >
          <Text
            style={[
              styles.alertModeBtnText,
              { color: alertMode === "rodzina" ? "#FFF" : theme.textSecondary },
            ]}
          >
            Rodzina
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.alertModeBtn,
            {
              backgroundColor:
                alertMode === "spolecznosc" ? "#8B5CF6" : theme.cardBg,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setAlertMode("spolecznosc")}
        >
          <Text
            style={[
              styles.alertModeBtnText,
              {
                color:
                  alertMode === "spolecznosc" ? "#FFF" : theme.textSecondary,
              },
            ]}
          >
            Społeczność
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.alertModeBtn,
            {
              backgroundColor:
                alertMode === "poblizu" ? "#EF4444" : theme.cardBg,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setAlertMode("poblizu")}
        >
          <Text
            style={[
              styles.alertModeBtnText,
              { color: alertMode === "poblizu" ? "#FFF" : theme.textSecondary },
            ]}
          >
            W pobliżu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
    const scrollDelta = offsetY - previousScrollOffset.current;

    accumulatedScrollDelta.current += scrollDelta;

    if (offsetY > 0 && accumulatedScrollDelta.current <= -24) {
      setIsStatusBarVisible(true);
      accumulatedScrollDelta.current = 0;
    } else if (accumulatedScrollDelta.current >= 24) {
      setIsStatusBarVisible(false);
      accumulatedScrollDelta.current = 0;
    }

    previousScrollOffset.current = offsetY;
  };

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[
        styles.container,
        { backgroundColor: theme.bg },
        isHighContrast && styles.highContrastContainer,
      ]}
    >
      <StatusBar
        barStyle={
          isDarkMode || isHighContrast ? "light-content" : "dark-content"
        }
        backgroundColor={theme.headerBg}
        hidden={!isStatusBarVisible}
        translucent={false}
        animated
      />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.cardBg, borderBottomColor: theme.border },
          isHighContrast && styles.highContrastBorderBottom,
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogoIcon}>🛡️</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            DEFENSE
          </Text>
        </View>

        <View style={styles.headerRight}>
          {!isEasyMode && (
            <>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => showToast("Brak nowych powiadomień", "info")}
              >
                <Text style={styles.headerIconText}>🔔</Text>
                <View style={styles.notifBadge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => showToast("Profil użytkownika DEFENSE", "info")}
              >
                <Text style={styles.headerIconText}>👤</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsSettingsVisible(true)}
          >
            <Text style={styles.headerIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SOSAlertBanner
        activeSOSList={sosAlerts}
        onResolveSOS={async (id) => {
          const updated = await DefenseStore.resolveSOS(id);
          setSosAlerts(updated.filter((s) => s.active));
          showToast("Odwołano alert SOS", "success");
        }}
        onFlyToSOS={() => {
          showToast("Przejdź do zakładki Mapa", "info");
        }}
      />

      <ScrollView
        style={[styles.scrollArea, { backgroundColor: theme.bg }]}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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
            <Text style={[styles.sosIcon, isEasyMode && styles.sosIconEasy]}>
              🆘
            </Text>
            <Text
              style={[
                styles.sosText,
                isEasyMode && styles.sosTextEasy,
                isHighContrast && styles.highContrastSOSText,
              ]}
            >
              {isEasyMode ? "POMOC" : "POTRZEBUJĘ\nPOMOCY"}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.sosSubtext, { color: theme.textSecondary }]}>
            Naciśnij w nagłej sytuacji
          </Text>

          <TouchableOpacity
            style={[
              styles.timerButton,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setIsSafeTimerVisible(true)}
          >
            <Text style={styles.timerButtonIcon}>⏳</Text>
            <View style={styles.timerButtonTexts}>
              <Text style={[styles.timerButtonTitle, { color: theme.text }]}>
                Timer Bezpieczeństwa
              </Text>
              <Text
                style={[styles.timerButtonSub, { color: theme.textSecondary }]}
              >
                Ustaw czas, po którym wyślemy powiadomienie
              </Text>
            </View>
          </TouchableOpacity>

          <FeatureGrid
            onOpenAlerts={() => showToast("Przejdź do zakładki Mapa", "info")}
            onOpenGroups={() => setIsContactsVisible(true)}
            onToggleMap={() => showToast("Przejdź do zakładki Mapa", "info")}
            onOpenContacts={() => setIsContactsVisible(true)}
            onOpenChatbot={() => setIsChatbotVisible(true)}
            onCheckIn={() => showToast("Zrobiono Check-in z grupą!", "success")}
          />
        </View>
      </ScrollView>

      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
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
      <SafeTimerModal
        visible={isSafeTimerVisible}
        onClose={() => setIsSafeTimerVisible(false)}
        onTimerExpired={handleCompleteSOSCountdown}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  highContrastContainer: { backgroundColor: "#000000" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  highContrastBorderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFF00",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogoIcon: { fontSize: 22 },
  headerTitle: { fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerIconBtn: { padding: 8, borderRadius: 20, position: "relative" },
  headerIconText: { fontSize: 18 },
  notifBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  scrollArea: { flex: 1, width: "100%" },
  scrollContent: { flexGrow: 1 },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  alertModeContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  alertModeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  alertModeRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 8,
  },
  alertModeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  alertModeBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sosSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  sosMainBtn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(254, 202, 202, 0.4)",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  sosMainBtnEasy: { width: 240, height: 240, borderRadius: 120 },
  highContrastSOSBtn: {
    backgroundColor: "#FF0000",
    borderColor: "#FFFFFF",
    borderWidth: 6,
  },
  sosIcon: { fontSize: 48, marginBottom: 6 },
  sosIconEasy: { fontSize: 56 },
  sosText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
  },
  sosTextEasy: { fontSize: 26 },
  highContrastSOSText: { color: "#FFFFFF" },
  sosSubtext: { fontSize: 12, marginTop: 14, fontWeight: "500" },
  timerButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  timerButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  timerButtonTexts: {
    flex: 1,
  },
  timerButtonTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  timerButtonSub: {
    fontSize: 12,
    marginTop: 4,
  },
});
