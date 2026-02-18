import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import type { LibraryCourse, LibraryResponse } from '../types/api';

export function LibraryScreen() {
  const { apiClient } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [courses, setCourses] = useState<LibraryCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await apiClient.request<LibraryResponse>('/api/v1/mobile/library');
      setCourses(response.courses);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [loadLibrary]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Courses</Text>

      {isLoading ? <Text style={styles.meta}>Loading...</Text> : null}

      {!isLoading && courses.length === 0 ? (
        <Text style={styles.meta}>No entitled courses found for this account.</Text>
      ) : null}

      <FlatList
        data={courses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('Course', {
                courseSlug: item.slug,
                title: item.title,
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.description || 'No description'}</Text>
            <Text style={styles.progress}>Progress: {item.progress.percent_complete}%</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 10,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  meta: {
    fontSize: 13,
    color: '#475569',
  },
  progress: {
    fontSize: 13,
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
