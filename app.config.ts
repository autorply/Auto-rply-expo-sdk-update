import { ExpoConfig, ConfigContext } from 'expo/config';
require('dotenv').config();

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: 'Autorply',
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'chatwoot-mobile',
    version: '4.2.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      enableFullScreenImage_legacy: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.autorply',
      infoPlist: {
        NSCameraUsageDescription:
          'This app requires access to the camera to upload images and videos.',
        NSPhotoLibraryUsageDescription:
          'This app requires access to the photo library to upload images.',
        NSMicrophoneUsageDescription: 'This app requires access to the microphone to record audio.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
      // Please use the relative path to the google-services.json file
      googleServicesFile: './GoogleService-Info.plist',
      entitlements: {
        'aps-environment': 'production',
      },
      associatedDomains: ['applinks:com.autorply'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.autorply',
      permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      // Please use the relative path to the google-services.json file
      googleServicesFile: './google-services.json',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'autorply.online',
              pathPrefix: '/app/accounts/',
              pathPattern: '/*/conversations/*',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      eas: {
        projectId: 'b1d2aaac-5e55-4805-be99-92e83ddac743',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    owner: 'auto-team',
    plugins: [
      'expo-font',
      [
        'expo-font',
        {
          fonts: [
            './src/assets/fonts/Inter-400-20.ttf',
            './src/assets/fonts/Inter-420-20.ttf',
            './src/assets/fonts/Inter-500-24.ttf',
            './src/assets/fonts/Inter-580-24.ttf',
            './src/assets/fonts/Inter-600-20.ttf',
          ],
        },
      ],
      [
        'react-native-permissions',
        {
          iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary'],
        },
      ],
      // [
      //   '@sentry/react-native/expo',
      //   {
      //     url: 'https://sentry.io/',
      //     project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
      //     organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
      //   },
      // ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            enableProguardInReleaseBuilds: true,
          },
          ios: { useFrameworks: 'static' },
        },
      ],
      './with-ffmpeg-pod.js',
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
