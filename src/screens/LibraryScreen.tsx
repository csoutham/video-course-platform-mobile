import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { formatProgressLabel } from '../lib/progress';
import type { RootStackParamList } from '../navigation/types';
import type { CourseDetailResponse, LibraryCourse, LibraryResponse } from '../types/api';

export function LibraryScreen() {
  const { apiClient } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();
  const [courses, setCourses] = useState<LibraryCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openingCourseSlug, setOpeningCourseSlug] = useState<string | null>(null);
  const isTabletLandscape = width >= 1024 && width > height;
  const gridColumns = isTabletLandscape ? 2 : 1;

  const loadLibrary = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await apiClient.requestWithCache<LibraryResponse>('/api/v1/mobile/library', {
        forceRefresh,
      });
      setCourses(response.courses);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiClient]);

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
    <View style={styles.container}>
      <Text style={styles.header}>My Courses</Text>
      <Text style={styles.subHeader}>Continue where you left off.</Text>

      {isLoading ? <Text style={styles.meta}>Loading...</Text> : null}

      {!isLoading && courses.length === 0 ? (
        <Text style={styles.meta}>No entitled courses found for this account.</Text>
      ) : null}

      <FlatList
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
            style={[styles.card, gridColumns > 1 ? styles.cardGrid : undefined]}
            onPress={() => openCourse(item.slug, item.title)}
            disabled={openingCourseSlug === item.slug}
          >
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
    marginBottom: 4,
    color: '#0f172a',
  },
  subHeader: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  columnWrap: {
    gap: 10,
  },
  card: {
    borderRadius: 12,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
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
    backgroundColor: '#e2e8f0',
  },
  thumbnailPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressBadgeText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 5,
  },
  thumbnailPlaceholderText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    fontSize: 13,
    color: '#475569',
  },
  progress: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
