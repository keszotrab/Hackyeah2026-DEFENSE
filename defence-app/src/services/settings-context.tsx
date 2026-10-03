import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export interface ThemePalette {
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  headerBg: string;
  border: string;
  primaryRed: string;
  highContrastBorder?: string;
}

export interface SettingsContextType {
  isDarkMode: boolean;
  isHighContrast: boolean;
  isEasyMode: boolean;
  toast: ToastState;
  setDarkMode: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setEasyMode: (val: boolean) => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  theme: ThemePalette;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isEasyMode, setIsEasyMode] = useState<boolean>(false);

  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Wyliczanie palety kolorów na podstawie aktywnego trybu
  let theme: ThemePalette = {
    bg: '#0F172A',         // dark slate-900
    cardBg: '#1E293B',     // dark slate-800
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    headerBg: '#0F172A',
    border: '#334155',
    primaryRed: '#DC2626',
  };

  if (isHighContrast) {
    theme = {
      bg: '#000000',
      cardBg: '#000000',
      text: '#FFFF00',
      textSecondary: '#FFFF00',
      headerBg: '#000000',
      border: '#FFFF00',
      primaryRed: '#FF0000',
      highContrastBorder: '#FFFF00',
    };
  } else if (!isDarkMode) {
    theme = {
      bg: '#F8FAFC',
      cardBg: '#FFFFFF',
      text: '#0F172A',
      textSecondary: '#64748B',
      headerBg: '#0F172A', // Granatowy nagłówek navy-900 z szablonu
      border: '#E2E8F0',
      primaryRed: '#DC2626',
    };
  }

  return (
    <SettingsContext.Provider
      value={{
        isDarkMode,
        isHighContrast,
        isEasyMode,
        toast,
        setDarkMode: setIsDarkMode,
        setHighContrast: setIsHighContrast,
        setEasyMode: setIsEasyMode,
        showToast,
        hideToast,
        theme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
