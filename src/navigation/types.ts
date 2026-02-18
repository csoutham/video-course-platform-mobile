export type RootStackParamList = {
  Login: undefined;
  AppTabs: undefined;
  Course: { courseSlug: string; title: string };
  Player: { courseSlug: string; lessonSlug: string; title: string };
};

export type AppTabParamList = {
  Library: undefined;
  Account: undefined;
};
