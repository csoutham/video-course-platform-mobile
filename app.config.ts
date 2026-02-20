import type { ExpoConfig } from 'expo/config';

import appJson from './app.json';

const staticConfig = appJson.expo as ExpoConfig;

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export default (): ExpoConfig => {
  const projectId = readOptionalEnv('EXPO_PROJECT_ID');
  const updatesUrl = readOptionalEnv('EXPO_UPDATES_URL') ?? (projectId ? `https://u.expo.dev/${projectId}` : undefined);

  const extra: NonNullable<ExpoConfig['extra']> = {
    ...(staticConfig.extra ?? {}),
  };

  if (projectId) {
    extra.eas = {
      ...(extra.eas ?? {}),
      projectId,
    };
  }

  const config: ExpoConfig = {
    ...staticConfig,
    extra,
  };

  if (updatesUrl) {
    config.runtimeVersion = config.runtimeVersion ?? { policy: 'appVersion' };
    config.updates = {
      ...(config.updates ?? {}),
      url: updatesUrl,
    };
  }

  return config;
};
