import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from './components/Toast';
import { FavoritesProvider } from './context/FavoritesContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}
