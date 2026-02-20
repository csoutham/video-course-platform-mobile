import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';

import { ApiRequestError } from '../api/client';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonRows } from '../components/ui/SkeletonRows';
import { useAuth } from '../context/AuthContext';
import { formatLessonProgress } from '../lib/progress';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, type } from '../theme/tokens';
import type { CourseDetailResponse, PlaybackResponse, ResourceResponse } from '../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;
const PROGRESS_MAX_DURATION_SECONDS = 12 * 60 * 60;
const PROGRESS_MIN_WRITE_INTERVAL_MS = 3000;

export function PlayerScreen() {
  const { apiClient } = useAuth();
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width, height } = useWindowDimensions();

  const [playback, setPlayback] = useState<PlaybackResponse | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetailResponse['course'] | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [isLessonLoading, setIsLessonLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [switchingToLessonSlug, setSwitchingToLessonSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressWarning, setProgressWarning] = useState<string | null>(null);
  const lastProgressWriteRef = useRef<{ at: number; position: number } | null>(null);
  const latestPlaybackRef = useRef<PlaybackResponse | null>(null);
  const playbackPath = `/api/v1/mobile/courses/${route.params.courseSlug}/lessons/${route.params.lessonSlug}/playback`;
  const progressPath = `/api/v1/mobile/courses/${route.params.courseSlug}/lessons/${route.params.lessonSlug}/progress`;
  const courseDetailPath = `/api/v1/mobile/courses/${route.params.courseSlug}`;
  const libraryPath = '/api/v1/mobile/library';

  const isTabletLandscape = width >= 1024 && width > height;

  const loadPlayback = useCallback(
    async (forceRefresh = false, showLoading = false) => {
      if (showLoading) {
        setIsLessonLoading(true);
      }

      try {
        setErrorMessage(null);
        const response = await apiClient.requestWithCache<PlaybackResponse>(playbackPath, {
          forceRefresh,
          ttlMs: 20 * 1000,
          fallbackToStaleOnError: false,
        });
        latestPlaybackRef.current = response;
        setPlayback(response);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this lesson right now.');
      } finally {
        if (showLoading) {
          setIsLessonLoading(false);
          setSwitchingToLessonSlug(null);
        }
      }
    },
    [apiClient, playbackPath],
  );

  const loadCourseDetail = useCallback(
    async (forceRefresh = false, showLoading = false) => {
      if (showLoading) {
        setIsCourseLoading(true);
      }

      try {
        const response = await apiClient.requestWithCache<CourseDetailResponse>(courseDetailPath, {
          forceRefresh,
        });
        setCourseDetail(response.course);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this course right now.');
      } finally {
        if (showLoading) {
          setIsCourseLoading(false);
        }
      }
    },
    [apiClient, courseDetailPath],
  );

  const refreshAll = useCallback(
    async (forceRefresh = false) => {
      setIsRefreshing(true);

      try {
        await Promise.all([loadPlayback(forceRefresh, false), loadCourseDetail(forceRefresh, false)]);
      } finally {
        setIsRefreshing(false);
      }
    },
    [loadCourseDetail, loadPlayback],
  );

  useFocusEffect(
    useCallback(() => {
      void loadCourseDetail(true, true);
    }, [loadCourseDetail]),
  );

  useFocusEffect(
    useCallback(() => {
      setPlayback(null);
      void loadPlayback(true, true);
    }, [loadPlayback]),
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

  useEffect(() => {
    if (!preferredStreamUrl || isIframeStream) {
      return;
    }

    try {
      player.play();
    } catch {
      // no-op; playback can still be started manually if autoplay is blocked
    }
  }, [isIframeStream, player, preferredStreamUrl]);

  const openResource = async (resourceId: number): Promise<void> => {
    const response = await apiClient.request<ResourceResponse>(`/api/v1/mobile/resources/${resourceId}`);
    await Linking.openURL(response.resource.url);
  };

  const openLesson = (lessonSlug: string, title: string): void => {
    if (lessonSlug === route.params.lessonSlug) {
      return;
    }

    setSwitchingToLessonSlug(lessonSlug);
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
  const isLessonCompleted =
    playback?.progress.status === 'completed' || (playback?.progress.percent_complete ?? 0) >= 99;

  const handleProgressSubmissionError = useCallback((error: unknown, context: 'heartbeat' | 'complete') => {
    if (error instanceof ApiRequestError && (error.status === 422 || error.status === 429)) {
      setProgressWarning(
        context === 'complete'
          ? 'Completion could not be saved right now. Please try again.'
          : 'Progress sync is temporarily limited. We will retry automatically.',
      );
      console.warn('Progress update rejected by API', {
        status: error.status,
        code: error.code,
        details: error.details,
      });
      return;
    }

    if (error instanceof Error) {
      setProgressWarning(error.message);
      return;
    }

    setProgressWarning('Progress sync failed unexpectedly.');
  }, []);

  const applyProgressUpdate = useCallback(
    async (response: { status: string; percent_complete: number; playback_position_seconds: number; updated_at: string | null }) => {
      let nextPlayback: PlaybackResponse | null = null;
      let nextCourse: CourseDetailResponse['course'] | null = null;

      setPlayback((current) => {
        if (!current) {
          return current;
        }

        nextPlayback = {
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

        return nextPlayback;
      });

      setCourseDetail((current) => {
        if (!current) {
          return current;
        }

        nextCourse = {
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

        return nextCourse;
      });

      if (nextPlayback) {
        latestPlaybackRef.current = nextPlayback;
        await apiClient.setCachedResponse(playbackPath, nextPlayback);
        setProgressWarning(null);
      }

      if (nextCourse) {
        await apiClient.setCachedResponse(courseDetailPath, { course: nextCourse });
      }

      await apiClient.invalidateCachedResponse(libraryPath);
    },
    [apiClient, courseDetailPath, libraryPath, playbackPath, route.params.lessonSlug],
  );

  const submitProgress = useCallback(
    async (isCompleted = false) => {
      const now = Date.now();
      const rawPosition = typeof player.currentTime === 'number' ? Math.max(0, Math.floor(player.currentTime)) : 0;
      const rawDuration = typeof player.duration === 'number' && player.duration > 0 ? Math.floor(player.duration) : undefined;

      if (!isCompleted && rawDuration && rawDuration > PROGRESS_MAX_DURATION_SECONDS) {
        throw new Error('Video duration is out of range for progress updates.');
      }

      const position = rawDuration ? Math.min(rawPosition, rawDuration + 60) : rawPosition;
      const duration = rawDuration;

      const previousWrite = lastProgressWriteRef.current;
      if (
        !isCompleted &&
        previousWrite &&
        now - previousWrite.at < PROGRESS_MIN_WRITE_INTERVAL_MS &&
        Math.abs(position - previousWrite.position) < 2
      ) {
        return null;
      }

      const response = await apiClient.request<{
        status: string;
        percent_complete: number;
        playback_position_seconds: number;
        updated_at: string | null;
      }>(progressPath, {
        method: 'POST',
        body: JSON.stringify({
          position_seconds: position,
          duration_seconds: duration,
          is_completed: isCompleted,
        }),
      });

      lastProgressWriteRef.current = {
        at: now,
        position,
      };

      return response;
    },
    [apiClient, player, progressPath],
  );

  const markLessonComplete = useCallback(async () => {
    if (!playback || isLessonCompleted) {
      return;
    }

    setIsCompleting(true);

    try {
      const response = await submitProgress(true);
      if (response) {
        await applyProgressUpdate(response);
      }
    } catch (error) {
      handleProgressSubmissionError(error, 'complete');
    } finally {
      setIsCompleting(false);
    }
  }, [applyProgressUpdate, handleProgressSubmissionError, isLessonCompleted, playback, submitProgress]);

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

        try {
          const response = await submitProgress();
          if (!response) {
            return;
          }

          if (
            response.status !== current.progress.status ||
            response.percent_complete !== current.progress.percent_complete ||
            response.playback_position_seconds !== current.progress.playback_position_seconds
          ) {
            await applyProgressUpdate(response);
          }
        } catch (error) {
          handleProgressSubmissionError(error, 'heartbeat');
        }
      }, heartbeatSeconds * 1000);

      return () => clearInterval(interval);
    }, [applyProgressUpdate, handleProgressSubmissionError, submitProgress]),
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = player.addListener('playToEnd', () => {
        if (latestPlaybackRef.current?.progress.status === 'completed') {
          return;
        }

        void submitProgress(true)
          .then((response) => {
            if (response) {
              return applyProgressUpdate(response);
            }
            return Promise.resolve();
          })
          .catch((error) => {
            handleProgressSubmissionError(error, 'complete');
          });
      });

      return () => {
        subscription.remove();
      };
    }, [applyProgressUpdate, handleProgressSubmissionError, player, submitProgress]),
  );

  const playerContent = (
    <>
      {isLessonLoading && !playback ? (
        <View style={styles.playerSkeletonWrap}>
          <View style={styles.playerSkeletonVideo} />
          <View style={styles.playerSkeletonControls}>
            <View style={styles.playerSkeletonButton} />
            <View style={styles.playerSkeletonButton} />
            <View style={styles.playerSkeletonButton} />
          </View>
          <View style={styles.playerSkeletonLineLong} />
          <View style={styles.playerSkeletonLineShort} />
        </View>
      ) : null}
      {!isLessonLoading && errorMessage ? <ErrorState message={errorMessage} onRetry={() => refreshAll(true)} /> : null}
      {!isLessonLoading && !errorMessage && !playback ? (
        <EmptyState title="Lesson unavailable" message="We could not load playback details for this lesson." />
      ) : null}

      {!isLessonLoading && (preferredStreamUrl || iframeStreamUrl) ? (
        <View style={styles.videoWrap}>
          {isIframeStream && iframeStreamUrl ? (
            <WebView source={{ uri: iframeStreamUrl }} style={styles.video} />
          ) : (
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture
            />
          )}
        </View>
      ) : null}

      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.controlButton, !previousLesson ? styles.controlButtonDisabled : undefined]}
          onPress={() => previousLesson && openLesson(previousLesson.slug, previousLesson.title)}
          disabled={!previousLesson}
          accessibilityRole="button"
          accessibilityLabel="Previous lesson"
        >
          <Text style={styles.controlButtonText}>Previous</Text>
        </Pressable>

        <Pressable
          style={[
            styles.controlButton,
            styles.controlButtonComplete,
            isLessonCompleted || isCompleting ? styles.controlButtonDisabled : undefined,
          ]}
          onPress={markLessonComplete}
          disabled={isLessonCompleted || isCompleting}
          accessibilityRole="button"
          accessibilityLabel={isLessonCompleted ? 'Lesson completed' : 'Mark lesson as complete'}
        >
          <Text style={styles.controlButtonText}>
            {isCompleting ? 'Saving...' : isLessonCompleted ? 'Completed' : 'Complete'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.controlButton,
            styles.controlButtonPrimary,
            !nextLesson ? styles.controlButtonDisabled : undefined,
          ]}
          onPress={() => nextLesson && openLesson(nextLesson.slug, nextLesson.title)}
          disabled={!nextLesson}
          accessibilityRole="button"
          accessibilityLabel="Next lesson"
        >
          <Text style={styles.controlButtonPrimaryText}>Next</Text>
        </Pressable>
      </View>
      {progressWarning ? <Text style={styles.warningText}>{progressWarning}</Text> : null}

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
            <Pressable
              key={resource.id}
              style={styles.resource}
              onPress={() => openResource(resource.id)}
              accessibilityRole="link"
              accessibilityLabel={`Open resource: ${resource.name}`}
              accessibilityHint="Opens this resource file in your browser."
            >
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
            {isCourseLoading && !courseDetail ? <SkeletonRows rows={6} /> : null}
            {!isCourseLoading ? (
              <ScrollView contentContainerStyle={styles.lessonListContent}>
                {lessonList.map((module) => (
                  <View key={module.id} style={styles.moduleGroup}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.slug === route.params.lessonSlug;
                      const isPending = switchingToLessonSlug === lesson.slug && !isActive;

                      return (
                        <Pressable
                          key={lesson.id}
                          style={[
                            styles.lessonItem,
                            isActive ? styles.lessonItemActive : undefined,
                            isPending ? styles.lessonItemPending : undefined,
                          ]}
                          onPress={() => openLesson(lesson.slug, lesson.title)}
                          disabled={Boolean(switchingToLessonSlug)}
                          accessibilityRole="button"
                          accessibilityLabel={`Open lesson: ${lesson.title}`}
                          accessibilityHint="Loads this lesson in the player."
                        >
                          <View style={styles.lessonItemRow}>
                            <View style={styles.lessonItemBody}>
                              <Text style={[styles.lessonItemTitle, isActive ? styles.lessonItemTitleActive : undefined]}>
                                {lesson.title}
                              </Text>
                              <Text style={styles.lessonItemMeta}>
                                {formatLessonProgress(lesson.progress?.status, lesson.progress?.percent_complete)}
                              </Text>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color={isActive ? colors.dark.accentSoft : colors.dark.textMuted}
                            />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>

          <ScrollView
            style={styles.playerColumn}
            contentContainerStyle={styles.playerContent}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => refreshAll(true)} />}
          >
            <Text style={styles.title}>{route.params.title}</Text>
            {isLessonLoading && playback ? <Text style={styles.meta}>Loading lesson...</Text> : null}
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
      {isLessonLoading && playback ? <Text style={styles.meta}>Loading lesson...</Text> : null}
      {playerContent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  lessonsColumn: {
    width: 360,
    borderRightWidth: 1,
    borderRightColor: colors.dark.borderStrong,
    padding: spacing.md,
    gap: spacing.sm,
  },
  playerColumn: {
    flex: 1,
  },
  playerContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  lessonListContent: {
    gap: spacing.sm + 2,
    paddingBottom: spacing.lg + 4,
  },
  moduleGroup: {
    gap: spacing.sm,
  },
  moduleTitle: {
    color: colors.dark.textSecondary,
    fontWeight: '700',
    fontSize: type.bodyLarge,
  },
  lessonItem: {
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    gap: 4,
    backgroundColor: colors.dark.panel,
  },
  lessonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lessonItemBody: {
    flex: 1,
    gap: 4,
  },
  lessonItemActive: {
    borderColor: colors.dark.accent,
    backgroundColor: colors.brand.primaryMuted,
  },
  lessonItemPending: {
    opacity: 0.65,
  },
  lessonItemTitle: {
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  lessonItemTitleActive: {
    color: colors.dark.accentSoft,
  },
  lessonItemMeta: {
    color: colors.dark.textMuted,
    fontSize: type.label,
  },
  title: {
    color: colors.dark.text,
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    color: colors.dark.textMuted,
  },
  videoWrap: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderColor: colors.dark.borderStrong,
    borderWidth: 1,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.dark.videoBackground,
  },
  playerSkeletonWrap: {
    gap: spacing.sm + 2,
  },
  playerSkeletonVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    backgroundColor: colors.dark.panelMuted,
    borderWidth: 1,
    borderColor: colors.dark.borderStrong,
  },
  playerSkeletonControls: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  playerSkeletonButton: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.dark.panel,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  playerSkeletonLineLong: {
    height: 14,
    width: '72%',
    borderRadius: radius.pill,
    backgroundColor: colors.dark.panelMuted,
  },
  playerSkeletonLineShort: {
    height: 12,
    width: '44%',
    borderRadius: radius.pill,
    backgroundColor: colors.dark.panelMuted,
  },
  sectionTitle: {
    color: colors.dark.text,
    fontWeight: '600',
    fontSize: type.subheading,
    marginTop: spacing.sm,
  },
  resource: {
    borderRadius: radius.md,
    borderColor: colors.dark.border,
    borderWidth: 1,
    padding: spacing.md,
  },
  resourceTitle: {
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  summaryWrap: {
    borderRadius: radius.md,
    borderColor: colors.dark.border,
    borderWidth: 1,
    padding: spacing.md,
    backgroundColor: colors.dark.panel,
  },
  summaryText: {
    color: colors.dark.textSecondary,
    lineHeight: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  controlButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.panel,
  },
  controlButtonPrimary: {
    borderColor: colors.brand.primaryMuted,
    backgroundColor: colors.brand.primaryMuted,
  },
  controlButtonComplete: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.panelMuted,
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlButtonText: {
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  controlButtonPrimaryText: {
    color: colors.dark.text,
    fontWeight: '700',
  },
  warningText: {
    color: colors.dark.accentSoft,
    fontSize: type.body,
  },
});
