const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add resolution for asset extensions
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = [...assetExts, 'db', 'sqlite'];
config.resolver.sourceExts = [...sourceExts, 'mjs'];

// Add additional configurations for web support
config.resolver.resolverMainFields = ['browser', 'main'];

// Add resolver for expo-router
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'expo-router': require.resolve('expo-router')
};

// Ensure proper handling of Symbol serialization
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [],
  getPolyfills: () => []
};

module.exports = config;