import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.github.hiromiyoshimu.sonaememo',
  appName: 'そなえメモ',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
};

export default config;
