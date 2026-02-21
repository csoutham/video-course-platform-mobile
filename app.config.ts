import 'dotenv/config';

import type { ExpoConfig } from 'expo/config';

import appJson from './app.json';

const staticConfig = appJson.expo as ExpoConfig;

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export default (): ExpoConfig => {
  const projectId = readOptionalEnv('EXPO_PROJECT_ID') ?? readOptionalEnv('EAS_PROJECT_ID');
  const updatesUrl = readOptionalEnv('EXPO_UPDATES_URL') ?? (projectId ? `https://u.expo.dev/${projectId}` : undefined);

  const extra: NonNullable<ExpoConfig['extra']> = {
    ...(staticConfig.extra ?? {}),
  };

  extra.eas = {
    ...(extra.eas ?? {}),
    ...(projectId ? { projectId } : {}),
  };

  const config: ExpoConfig = {
    ...staticConfig,
    extra,
    runtimeVersion: staticConfig.runtimeVersion ?? { policy: 'appVersion' },
  };

  if (updatesUrl) {
    config.updates = {
      ...(config.updates ?? {}),
      url: updatesUrl,
    };
  }

  return config;
};
