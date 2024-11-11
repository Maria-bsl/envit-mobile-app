import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'envit-mobile-app',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      showSpinner: true,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
