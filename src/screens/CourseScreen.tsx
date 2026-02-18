import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import type { CourseDetailResponse } from '../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Course'>;

export function CourseScreen() {
  const { apiClient } = useAuth();
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [course, setCourse] = useState<CourseDetailResponse['course'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCourse = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await apiClient.request<CourseDetailResponse>(`/api/v1/mobile/courses/${route.params.courseSlug}`);
      setCourse(response.course);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, route.params.courseSlug]);

  useFocusEffect(
    useCallback(() => {
      loadCourse();
    }, [loadCourse]),
  );

  const lessons = course?.modules.flatMap((module) => module.lessons) || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{course?.title || route.params.title}</Text>
      <Text style={styles.meta}>{isLoading ? 'Loading...' : `${lessons.length} lessons`}</Text>

      <FlatList
        data={lessons}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('Player', {
                courseSlug: route.params.courseSlug,
                lessonSlug: item.slug,
                title: item.title,
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>Progress: {item.progress?.percent_complete ?? 0}%</Text>
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0f172a',
  },
  meta: {
    fontSize: 13,
    color: '#475569',
  },
  list: {
    gap: 10,
    paddingTop: 12,
  },
  card: {
    borderRadius: 10,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 14,
    gap: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
});
