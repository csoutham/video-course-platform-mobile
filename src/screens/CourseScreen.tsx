import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/ui/Card';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { useAuth } from '../context/AuthContext';
import { formatLessonProgress } from '../lib/progress';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, type } from '../theme/tokens';
import type { CourseDetailResponse } from '../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Course'>;

export function CourseScreen() {
  const { apiClient } = useAuth();
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [course, setCourse] = useState<CourseDetailResponse['course'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCourse = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await apiClient.requestWithCache<CourseDetailResponse>(
        `/api/v1/mobile/courses/${route.params.courseSlug}`,
        { forceRefresh },
      );
      setCourse(response.course);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiClient, route.params.courseSlug]);

  useFocusEffect(
    useCallback(() => {
      loadCourse(true);
    }, [loadCourse]),
  );

  const moduleCount = course?.modules.length ?? 0;
  const lessonCount = course?.modules.reduce((count, module) => count + module.lessons.length, 0) ?? 0;

  return (
    <ScreenContainer>
      <SectionHeading title={course?.title || route.params.title} subtitle={isLoading ? 'Loading...' : `${moduleCount} modules · ${lessonCount} lessons`} />

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadCourse(true)} />}
      >
        {course?.modules.map((module) => (
          <View key={module.id} style={styles.moduleBlock}>
            <Text style={styles.moduleTitle}>{module.title}</Text>

            {module.lessons.map((lesson) => (
              <Pressable
                key={lesson.id}
                onPress={() =>
                  navigation.navigate('Player', {
                    courseSlug: route.params.courseSlug,
                    lessonSlug: lesson.slug,
                    title: lesson.title,
                  })
                }
              >
                <Card>
                  <View style={styles.row}>
                    <View style={styles.rowContent}>
                      <Text style={styles.title}>{lesson.title}</Text>
                      <Text style={styles.meta}>
                        {formatLessonProgress(lesson.progress?.status, lesson.progress?.percent_complete)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.text.subtle} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontSize: type.body,
    color: colors.text.secondary,
  },
  list: {
    gap: spacing.sm + 2,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg + 4,
  },
  moduleBlock: {
    gap: spacing.sm,
  },
  moduleTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
  },
  rowContent: {
    flex: 1,
    gap: spacing.xs + 1,
  },
  title: {
    fontSize: type.subheading,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
