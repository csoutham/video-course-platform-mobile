export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export type MobileUser = {
  id: number;
  name: string;
  email: string;
  updated_at: string | null;
};

export type LoginResponse = {
  token: string;
  token_type: string;
  user: MobileUser;
};

export type LibraryCourse = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  updated_at: string | null;
  progress: {
    total_lessons: number;
    completed_lessons: number;
    percent_complete: number;
    last_viewed_at: string | null;
  };
};

export type LibraryResponse = {
  courses: LibraryCourse[];
};

export type CourseDetail = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  long_description: string | null;
  thumbnail_url: string | null;
  updated_at: string | null;
  modules: Array<{
    id: number;
    title: string;
    sort_order: number;
    updated_at: string | null;
    lessons: Array<{
      id: number;
      slug: string;
      title: string;
      summary: string | null;
      duration_seconds: number | null;
      stream_video_id: string | null;
      has_video: boolean;
      sort_order: number;
      updated_at: string | null;
      progress: {
        status: string;
        playback_position_seconds: number;
        video_duration_seconds: number | null;
        percent_complete: number;
        last_viewed_at: string | null;
        completed_at: string | null;
        updated_at: string | null;
      } | null;
      resources: Array<{
        id: number;
        name: string;
        mime_type: string | null;
        size_bytes: number | null;
        updated_at: string | null;
      }>;
    }>;
  }>;
};

export type CourseDetailResponse = {
  course: CourseDetail;
};

export type PlaybackResponse = {
  stream_url: string | null;
  heartbeat_seconds: number;
  auto_complete_percent: number;
  lesson: {
    id: number;
    slug: string;
    title: string;
    summary: string | null;
    duration_seconds: number | null;
    updated_at: string | null;
    resources: Array<{
      id: number;
      name: string;
      mime_type: string | null;
      size_bytes: number | null;
      updated_at: string | null;
    }>;
  };
  progress: {
    status: string;
    playback_position_seconds: number;
    video_duration_seconds: number | null;
    percent_complete: number;
    last_viewed_at: string | null;
    completed_at: string | null;
    updated_at: string | null;
  };
};

export type ResourceResponse = {
  resource: {
    id: number;
    name: string;
    mime_type: string | null;
    size_bytes: number | null;
    expires_at: string;
    url: string;
  };
};
