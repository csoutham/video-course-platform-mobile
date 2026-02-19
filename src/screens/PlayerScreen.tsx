import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import type { CourseDetailResponse, PlaybackResponse, ResourceResponse } from '../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export function PlayerScreen() {
  const { apiClient } = useAuth();
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();

  const [playback, setPlayback] = useState<PlaybackResponse | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetailResponse['course'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const latestPlaybackRef = useRef<PlaybackResponse | null>(null);

  const isTabletLandscape = width >= 1024 && width > height;

  const loadPlayback = useCallback(
    async (forceRefresh = false) => {
      const response = await apiClient.requestWithCache<PlaybackResponse>(
        `/api/v1/mobile/courses/${route.params.courseSlug}/lessons/${route.params.lessonSlug}/playback`,
        { forceRefresh, ttlMs: 60 * 1000 },
      );

      latestPlaybackRef.current = response;
      setPlayback(response);
    },
    [apiClient, route.params.courseSlug, route.params.lessonSlug],
  );

  const loadCourseDetail = useCallback(
    async (forceRefresh = false) => {
      const response = await apiClient.requestWithCache<CourseDetailResponse>(`/api/v1/mobile/courses/${route.params.courseSlug}`, {
        forceRefresh,
      });

      setCourseDetail(response.course);
    },
    [apiClient, route.params.courseSlug],
  );

  const refreshAll = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        await Promise.all([loadPlayback(forceRefresh), loadCourseDetail(forceRefresh)]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [loadCourseDetail, loadPlayback],
  );

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll]),
  );

  const preferredStreamUrl = playback?.stream?.preferred_url || playback?.stream_url || null;
  const iframeStreamUrl = playback?.stream?.iframe_url || null;

  const player = useVideoPlayer(preferredStreamUrl, (instance) => {
    instance.loop = false;
  });

  const isIframeStream = useMemo(() => {
    const preferredPlayer = playback?.stream?.player;

    return preferredPlayer === 'webview';
  }, [playback?.stream?.player]);

  useFocusEffect(
    useCallback(() => {
      if (!latestPlaybackRef.current) {
        return;
      }

      const heartbeatSeconds = latestPlaybackRef.current.heartbeat_seconds;

      const interval = setInterval(async () => {
        const current = latestPlaybackRef.current;
        if (!current) {
          return;
        }

        const position = typeof player.currentTime === 'number' ? Math.max(0, Math.floor(player.currentTime)) : 0;
        const duration = typeof player.duration === 'number' && player.duration > 0 ? Math.floor(player.duration) : undefined;

        try {
          await apiClient.request(
            `/api/v1/mobile/courses/${route.params.courseSlug}/lessons/${route.params.lessonSlug}/progress`,
            {
              method: 'POST',
              body: JSON.stringify({
                position_seconds: position,
                duration_seconds: duration,
              }),
            },
          );
        } catch {
          // no-op for heartbeat failures
        }
      }, heartbeatSeconds * 1000);

      return () => clearInterval(interval);
    }, [apiClient, player, route.params.courseSlug, route.params.lessonSlug]),
  );

  const openResource = async (resourceId: number): Promise<void> => {
    const response = await apiClient.request<ResourceResponse>(`/api/v1/mobile/resources/${resourceId}`);
    await Linking.openURL(response.resource.url);
  };

  const openLesson = (lessonSlug: string, title: string): void => {
    if (lessonSlug === route.params.lessonSlug) {
      return;
    }

    navigation.setParams({
      lessonSlug,
      title,
    });
  };

  const hasSummary = Boolean(playback?.lesson.summary?.trim());
  const hasResources = Boolean(playback?.lesson.resources.length);

  const lessonList = courseDetail?.modules ?? [];
  const flattenedLessons = useMemo(() => lessonList.flatMap((module) => module.lessons), [lessonList]);
  const currentLessonIndex = useMemo(
    () => flattenedLessons.findIndex((lesson) => lesson.slug === route.params.lessonSlug),
    [flattenedLessons, route.params.lessonSlug],
  );
  const previousLesson = currentLessonIndex > 0 ? flattenedLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < flattenedLessons.length - 1
      ? flattenedLessons[currentLessonIndex + 1]
      : null;
  const isLessonCompleted = playback?.progress.status === 'completed';

  const markLessonComplete = useCallback(async () => {
    if (!playback || isLessonCompleted) {
      return;
    }

    setIsCompleting(true);

    try {
      const position = typeof player.currentTime === 'number' ? Math.max(0, Math.floor(player.currentTime)) : 0;
      const duration = typeof player.duration === 'number' && player.duration > 0 ? Math.floor(player.duration) : undefined;

      const response = await apiClient.request<{
        status: string;
        percent_complete: number;
        playback_position_seconds: number;
        updated_at: string | null;
      }>(`/api/v1/mobile/courses/${route.params.courseSlug}/lessons/${route.params.lessonSlug}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          position_seconds: position,
          duration_seconds: duration,
          is_completed: true,
        }),
      });

      setPlayback((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          progress: {
            ...current.progress,
            status: response.status,
            percent_complete: response.percent_complete,
            playback_position_seconds: response.playback_position_seconds,
            updated_at: response.updated_at,
            completed_at: response.status === 'completed' ? response.updated_at : current.progress.completed_at,
          },
        };
      });

      setCourseDetail((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          modules: current.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => {
              if (lesson.slug !== route.params.lessonSlug) {
                return lesson;
              }

              return {
                ...lesson,
                progress: {
                  status: response.status,
                  percent_complete: response.percent_complete,
                  playback_position_seconds: response.playback_position_seconds,
                  video_duration_seconds: lesson.progress?.video_duration_seconds ?? lesson.duration_seconds,
                  last_viewed_at: lesson.progress?.last_viewed_at ?? null,
                  completed_at: response.status === 'completed' ? response.updated_at : null,
                  updated_at: response.updated_at,
                },
              };
            }),
          })),
        };
      });
    } finally {
      setIsCompleting(false);
    }
  }, [apiClient, isLessonCompleted, playback, player, route.params.courseSlug, route.params.lessonSlug]);

  const playerContent = (
    <>
      {!isLoading && (preferredStreamUrl || iframeStreamUrl) ? (
        <View style={styles.videoWrap}>
          {isIframeStream && iframeStreamUrl ? (
            <WebView source={{ uri: iframeStreamUrl }} style={styles.video} />
          ) : (
            <VideoView player={player} style={styles.video} fullscreenOptions={{ enable: true }} allowsPictureInPicture />
          )}
        </View>
      ) : null}

      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.controlButton, !previousLesson ? styles.controlButtonDisabled : undefined]}
          onPress={() => previousLesson && openLesson(previousLesson.slug, previousLesson.title)}
          disabled={!previousLesson}
        >
          <Text style={styles.controlButtonText}>Previous</Text>
        </Pressable>

        <Pressable
          style={[
            styles.controlButton,
            styles.controlButtonPrimary,
            !nextLesson ? styles.controlButtonDisabled : undefined,
          ]}
          onPress={() => nextLesson && openLesson(nextLesson.slug, nextLesson.title)}
          disabled={!nextLesson}
        >
          <Text style={styles.controlButtonPrimaryText}>Next</Text>
        </Pressable>

        <Pressable
          style={[
            styles.controlButton,
            styles.controlButtonComplete,
            isLessonCompleted || isCompleting ? styles.controlButtonDisabled : undefined,
          ]}
          onPress={markLessonComplete}
          disabled={isLessonCompleted || isCompleting}
        >
          <Text style={styles.controlButtonText}>
            {isCompleting ? 'Saving...' : isLessonCompleted ? 'Completed' : 'Complete'}
          </Text>
        </Pressable>
      </View>

      {hasSummary ? (
        <>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryWrap}>
            <Text style={styles.summaryText}>{playback?.lesson.summary}</Text>
          </View>
        </>
      ) : null}

      {hasResources ? (
        <>
          <Text style={styles.sectionTitle}>Resources</Text>
          {playback?.lesson.resources.map((resource) => (
            <Pressable key={resource.id} style={styles.resource} onPress={() => openResource(resource.id)}>
              <Text style={styles.resourceTitle}>{resource.name}</Text>
              <Text style={styles.meta}>{resource.mime_type || 'file'}</Text>
            </Pressable>
          ))}
        </>
      ) : null}
    </>
  );

  if (isTabletLandscape) {
    return (
      <View style={styles.container}>
        <View style={styles.splitLayout}>
          <View style={styles.lessonsColumn}>
            <Text style={styles.title}>{courseDetail?.title || route.params.courseSlug}</Text>
            <ScrollView contentContainerStyle={styles.lessonListContent}>
              {lessonList.map((module) => (
                <View key={module.id} style={styles.moduleGroup}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  {module.lessons.map((lesson) => {
                    const isActive = lesson.slug === route.params.lessonSlug;

                    return (
                      <Pressable
                        key={lesson.id}
                        style={[styles.lessonItem, isActive ? styles.lessonItemActive : undefined]}
                        onPress={() => openLesson(lesson.slug, lesson.title)}
                      >
                        <View style={styles.lessonItemRow}>
                          <View style={styles.lessonItemBody}>
                            <Text style={[styles.lessonItemTitle, isActive ? styles.lessonItemTitleActive : undefined]}>
                              {lesson.title}
                            </Text>
                            <Text style={styles.lessonItemMeta}>Progress: {lesson.progress?.percent_complete ?? 0}%</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={isActive ? '#bfdbfe' : '#94a3b8'} />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            style={styles.playerColumn}
            contentContainerStyle={styles.playerContent}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => refreshAll(true)} />}
          >
            <Text style={styles.title}>{route.params.title}</Text>
            {isLoading ? <Text style={styles.meta}>Loading lesson...</Text> : null}
            {playerContent}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => refreshAll(true)} />}
    >
      <Text style={styles.title}>{route.params.title}</Text>

      {isLoading ? <Text style={styles.meta}>Loading lesson...</Text> : null}

      {playerContent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 12,
    gap: 12,
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  lessonsColumn: {
    width: 360,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    padding: 12,
    gap: 8,
  },
  playerColumn: {
    flex: 1,
  },
  playerContent: {
    padding: 12,
    gap: 12,
  },
  lessonListContent: {
    gap: 10,
    paddingBottom: 20,
  },
  moduleGroup: {
    gap: 8,
  },
  moduleTitle: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 14,
  },
  lessonItem: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    backgroundColor: '#0f172a',
  },
  lessonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lessonItemBody: {
    flex: 1,
    gap: 4,
  },
  lessonItemActive: {
    borderColor: '#60a5fa',
    backgroundColor: '#172554',
  },
  lessonItemTitle: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  lessonItemTitleActive: {
    color: '#bfdbfe',
  },
  lessonItemMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    color: '#94a3b8',
  },
  videoWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: '#1e293b',
    borderWidth: 1,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    minHeight: 240,
    backgroundColor: '#000',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 8,
  },
  resource: {
    borderRadius: 10,
    borderColor: '#334155',
    borderWidth: 1,
    padding: 12,
  },
  resourceTitle: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  summaryWrap: {
    borderRadius: 10,
    borderColor: '#334155',
    borderWidth: 1,
    padding: 12,
    backgroundColor: '#0f172a',
  },
  summaryText: {
    color: '#e2e8f0',
    lineHeight: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  controlButtonPrimary: {
    borderColor: '#1d4ed8',
    backgroundColor: '#1d4ed8',
  },
  controlButtonComplete: {
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlButtonText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  controlButtonPrimaryText: {
    color: '#f8fafc',
    fontWeight: '700',
  },
});
