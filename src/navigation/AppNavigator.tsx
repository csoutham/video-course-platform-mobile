import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';
import type { AppTabParamList, RootStackParamList } from './types';
import { AccountScreen } from '../screens/AccountScreen';
import { CourseScreen } from '../screens/CourseScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { colors } from '../theme/tokens';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppTabs = createBottomTabNavigator<AppTabParamList>();

function TabsNavigator() {
  const { logout } = useAuth();

  return (
    <AppTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.subtle,
        tabBarStyle: {
          borderTopColor: colors.surface.muted,
          backgroundColor: colors.surface.card,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Library' ? 'library-outline' : 'person-circle-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <AppTabs.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: 'My Courses',
          tabBarLabel: 'My Courses',
        }}
      />
      <AppTabs.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerRight: () => (
            <Pressable onPress={() => logout()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Log out of your account">
              <Text style={{ color: colors.brand.primary, fontWeight: '600', marginRight: 16 }}>Logout</Text>
            </Pressable>
          ),
        }}
      />
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
            <RootStack.Screen
              name="AppTabs"
              component={TabsNavigator}
              options={{
                headerShown: false,
                title: 'Courses',
              }}
            />
            <RootStack.Screen
              name="Course"
              component={CourseScreen}
              options={({ route }) => ({
                title: route.params.title,
                headerBackButtonDisplayMode: 'minimal',
                headerBackTitle: 'Courses',
              })}
            />
            <RootStack.Screen
              name="Player"
              component={PlayerScreen}
              options={({ route }) => ({
                title: route.params.title,
                headerBackButtonDisplayMode: 'minimal',
                headerBackTitle: 'Courses',
                headerStyle: {
                  backgroundColor: colors.dark.background,
                },
                headerTintColor: colors.dark.text,
                headerTitleStyle: {
                  color: colors.dark.text,
                },
              })}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
