import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homefitly.app',
  appName: 'HomeFitly',
  webDir: 'dist',
  ios: {
    scheme: 'HomeFitly',
    contentInset: 'automatic',
    path: 'ios/App'
  },
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#2563eb',
      sound: 'beep.wav'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    StatusBar: {
      style: 'Light',
      backgroundColor: '#2563eb'
    }
  }
};

export default config;
