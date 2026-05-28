import { ConfigContext, ExpoConfig } from 'expo/config';
import { ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

const optionalAndroidFeatures = [
  'android.hardware.camera',
  'android.hardware.camera.any',
  'android.hardware.camera.autofocus',
  'android.hardware.microphone',
];

const withOptionalAndroidHardwareFeatures: ConfigPlugin = config => {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults.manifest;
    manifest['uses-feature'] = manifest['uses-feature'] || [];

    optionalAndroidFeatures.forEach(featureName => {
      const existingFeature = manifest['uses-feature']?.find(
        feature => feature.$?.['android:name'] === featureName
      );

      if (existingFeature) {
        existingFeature.$['android:required'] = 'false';
      } else {
        manifest['uses-feature']?.push({
          $: {
            'android:name': featureName,
            'android:required': 'false',
          },
        });
      }
    });

    return config;
  });
};

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: 'Autorply',
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'autorply',
    version: '4.5.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: 'autorply',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      enableFullScreenImage_legacy: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.autorply',
      buildNumber: '2',
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
      // Please use the relative path to the GoogleService-Info.plist file
      googleServicesFile: './GoogleService-Info.plist',
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: ['applinks:autorply.online'],
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' },
      package: 'com.autorply',
      versionCode: 30,
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
        {
          action: 'VIEW',
          data: [
            {
              scheme: 'autorply',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      eas: {
        projectId: 'cd9673e2-b702-4ee1-b578-e0f10986e3bc',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    owner: 'auto-team',
    plugins: [
      'expo-font',
      '@react-native-community/datetimepicker',
      ['react-native-permissions', { iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary'] }],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
        },
      ],
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
      withOptionalAndroidHardwareFeatures,
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
