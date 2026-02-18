import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import type { AppTabParamList, RootStackParamList } from './types';
import { AccountScreen } from '../screens/AccountScreen';
import { CourseScreen } from '../screens/CourseScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PlayerScreen } from '../screens/PlayerScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppTabs = createBottomTabNavigator<AppTabParamList>();

function TabsNavigator() {
  return (
    <AppTabs.Navigator>
      <AppTabs.Screen name="Library" component={LibraryScreen} />
      <AppTabs.Screen name="Account" component={AccountScreen} />
    </AppTabs.Navigator>
  );
}

export function AppNavigator() {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {!token ? (
          <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <RootStack.Screen name="AppTabs" component={TabsNavigator} options={{ headerShown: false }} />
            <RootStack.Screen name="Course" component={CourseScreen} options={({ route }) => ({ title: route.params.title })} />
            <RootStack.Screen name="Player" component={PlayerScreen} options={({ route }) => ({ title: route.params.title })} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
