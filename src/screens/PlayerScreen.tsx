import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import type { PlaybackResponse, ResourceResponse } from '../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

export function PlayerScreen() {
  const { apiClient } = useAuth();
  const route = useRoute<Props['route']>();

  const [playback, setPlayback] = useState<PlaybackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const latestPlaybackRef = useRef<PlaybackResponse | null>(null);

  const loadPlayback = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await apiClient.request<PlaybackResponse>(
        `/api/v1/mobile/courses/${route.params.courseSlug}/lessons/${route.params.lessonSlug}/playback`,
      );
      latestPlaybackRef.current = response;
      setPlayback(response);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, route.params.courseSlug, route.params.lessonSlug]);

  useFocusEffect(
    useCallback(() => {
      loadPlayback();
    }, [loadPlayback]),
  );

  const player = useVideoPlayer(playback?.stream_url || null, (instance) => {
    instance.loop = false;
  });

  const isIframeStream = useMemo(() => {
    const url = playback?.stream_url || '';
    return url.includes('iframe.videodelivery.net') || url.includes('/iframe');
  }, [playback?.stream_url]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{route.params.title}</Text>

      {isLoading ? <Text style={styles.meta}>Loading lesson...</Text> : null}

      {!isLoading && playback?.stream_url ? (
        <View style={styles.videoWrap}>
          {isIframeStream ? (
            <WebView source={{ uri: playback.stream_url }} style={styles.video} />
          ) : (
            <VideoView player={player} style={styles.video} allowsFullscreen allowsPictureInPicture />
          )}
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Resources</Text>
      {playback?.lesson.resources.length ? (
        playback.lesson.resources.map((resource) => (
          <Pressable key={resource.id} style={styles.resource} onPress={() => openResource(resource.id)}>
            <Text style={styles.resourceTitle}>{resource.name}</Text>
            <Text style={styles.meta}>{resource.mime_type || 'file'}</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.meta}>No resources for this lesson.</Text>
      )}
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
    height: 220,
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
});
