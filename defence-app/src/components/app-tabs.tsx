import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'map', android: 'explore', web: 'map' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'safari', android: 'explore', web: 'link' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}
