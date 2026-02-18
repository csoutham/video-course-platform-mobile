import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

  const moduleCount = course?.modules.length ?? 0;
  const lessonCount = course?.modules.reduce((count, module) => count + module.lessons.length, 0) ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{course?.title || route.params.title}</Text>
      <Text style={styles.meta}>{isLoading ? 'Loading...' : `${moduleCount} modules · ${lessonCount} lessons`}</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {course?.modules.map((module) => (
          <View key={module.id} style={styles.moduleBlock}>
            <Text style={styles.moduleTitle}>{module.title}</Text>

            {module.lessons.map((lesson) => (
              <Pressable
                key={lesson.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('Player', {
                    courseSlug: route.params.courseSlug,
                    lessonSlug: lesson.slug,
                    title: lesson.title,
                  })
                }
              >
                <Text style={styles.title}>{lesson.title}</Text>
                <Text style={styles.meta}>Progress: {lesson.progress?.percent_complete ?? 0}%</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 20,
  },
  moduleBlock: {
    gap: 8,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
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
