import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { SkeletonRows } from '../components/ui/SkeletonRows';
import { useAuth } from '../context/AuthContext';
import { formatProgressLabel } from '../lib/progress';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, type } from '../theme/tokens';
import type { CourseDetailResponse, LibraryCourse, LibraryResponse } from '../types/api';

export function LibraryScreen() {
  const { apiClient } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();
  const [courses, setCourses] = useState<LibraryCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openingCourseSlug, setOpeningCourseSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isTabletLandscape = width >= 1024 && width > height;
  const gridColumns = isTabletLandscape ? 2 : 1;

  const loadLibrary = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setErrorMessage(null);
        const response = await apiClient.requestWithCache<LibraryResponse>('/api/v1/mobile/library', {
          forceRefresh,
        });
        setCourses(response.courses);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load courses right now.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiClient],
  );

  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [loadLibrary]),
  );

  const openCourse = useCallback(
    async (courseSlug: string, courseTitle: string) => {
      if (!isTabletLandscape) {
        navigation.navigate('Course', {
          courseSlug,
          title: courseTitle,
        });
        return;
      }

      setOpeningCourseSlug(courseSlug);

      try {
        const detail = await apiClient.requestWithCache<CourseDetailResponse>(`/api/v1/mobile/courses/${courseSlug}`);
        const lessons = detail.course.modules.flatMap((module) => module.lessons);
        const nextIncomplete = lessons.find((lesson) => lesson.progress?.status !== 'completed');
        const targetLesson = nextIncomplete ?? lessons[0];

        if (!targetLesson) {
          navigation.navigate('Course', {
            courseSlug,
            title: courseTitle,
          });
          return;
        }

        navigation.navigate('Player', {
          courseSlug,
          lessonSlug: targetLesson.slug,
          title: targetLesson.title,
        });
      } catch {
        navigation.navigate('Course', {
          courseSlug,
          title: courseTitle,
        });
      } finally {
        setOpeningCourseSlug(null);
      }
    },
    [apiClient, isTabletLandscape, navigation],
  );

  return (
    <ScreenContainer>
      <SectionHeading title="My Courses" subtitle="Continue where you left off." />

      {isLoading ? <SkeletonRows rows={3} height={120} /> : null}

      {!isLoading && errorMessage ? <ErrorState message={errorMessage} onRetry={() => loadLibrary(true)} /> : null}

      {!isLoading && !errorMessage && courses.length === 0 ? (
        <EmptyState title="No courses yet" message="No entitled courses found for this account." />
      ) : null}

      {!isLoading && !errorMessage ? <FlatList
        data={courses}
        keyExtractor={(item) => String(item.id)}
        key={gridColumns}
        contentContainerStyle={styles.list}
        numColumns={gridColumns}
        columnWrapperStyle={gridColumns > 1 ? styles.columnWrap : undefined}
        refreshing={isRefreshing}
        onRefresh={() => loadLibrary(true)}
        renderItem={({ item }) => (
          <Pressable
            style={gridColumns > 1 ? styles.cardGrid : undefined}
            onPress={() => openCourse(item.slug, item.title)}
            disabled={openingCourseSlug === item.slug}
          >
            <Card>
              <View style={styles.thumbnailWrap}>
                {item.thumbnail_url ? (
                  <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={styles.thumbnailPlaceholder}>
                    <Text style={styles.thumbnailPlaceholderText}>No Thumbnail</Text>
                  </View>
                )}
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>{formatProgressLabel(item.progress.percent_complete)}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.description || 'No description'}</Text>
                {openingCourseSlug === item.slug ? <Text style={styles.meta}>Opening...</Text> : null}
              </View>
            </Card>
          </Pressable>
        )}
      /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  columnWrap: {
    gap: spacing.sm,
  },
  cardGrid: {
    flex: 1,
  },
  thumbnailWrap: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface.muted,
  },
  thumbnailPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadge: {
    position: 'absolute',
    right: spacing.sm + 2,
    bottom: spacing.sm + 2,
    backgroundColor: colors.surface.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  progressBadgeText: {
    color: colors.text.inverse,
    fontSize: type.label,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    gap: spacing.xs + 1,
  },
  thumbnailPlaceholderText: {
    color: colors.text.subtle,
    fontSize: type.label,
    fontWeight: '600',
  },
  title: {
    fontSize: type.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  meta: {
    fontSize: type.body,
    color: colors.text.secondary,
  },
});
