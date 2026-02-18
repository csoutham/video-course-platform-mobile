import { Button, Linking, StyleSheet, Text, View } from 'react-native';

import { buildApiUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function AccountScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.name}</Text>
      <Text style={styles.meta}>{user?.email}</Text>

      <Button
        title="Open Web Catalog"
        onPress={() => {
          Linking.openURL(buildApiUrl('/courses'));
        }}
      />

      <Button title="Logout" onPress={() => logout()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    color: '#475569',
  },
});
