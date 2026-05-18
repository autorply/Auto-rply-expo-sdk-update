const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
// const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);
// const sentryConfig = getSentryExpoConfig(__dirname);

// Merge Sentry config with default config
const config = {
  ...defaultConfig,
  // ...sentryConfig,
};

module.exports = wrapWithReanimatedMetroConfig(
  withStorybook(config, {
    enabled: true,
    configPath: path.resolve(__dirname, './.storybook'),
  }),
);
