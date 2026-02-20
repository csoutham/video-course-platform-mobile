import { getSslPinningConfig } from '../config/env';

let initialized = false;

export async function initializeSslPinningForProduction(): Promise<void> {
  if (__DEV__ || initialized) {
    return;
  }

  const config = getSslPinningConfig();
  if (!config?.enabled) {
    return;
  }

  const module = await import('react-native-ssl-public-key-pinning');
  if (!module.isSslPinningAvailable()) {
    return;
  }

  await module.initializeSslPinning({
    [config.host]: {
      includeSubdomains: true,
      publicKeyHashes: config.publicKeys,
    },
  });

  module.addSslPinningErrorListener((error) => {
    console.warn('SSL pinning mismatch detected', {
      serverHostname: error.serverHostname,
      message: error.message,
    });
  });

  initialized = true;
}
