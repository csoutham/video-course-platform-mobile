import { useEffect } from 'react';
import * as Device from 'expo-device';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './context/AuthContext';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    const lockOrientation = async (): Promise<void> => {
      const deviceType = await Device.getDeviceTypeAsync();
      const isTablet = deviceType === Device.DeviceType.TABLET;

      if (isTablet) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        return;
      }

      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    lockOrientation().catch(() => {
      // no-op if orientation lock fails
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
