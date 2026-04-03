// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimization: Ensure we can resolve .cjs files (used by Prisma)
if (!config.resolver.sourceExts.includes('cjs')) {
    config.resolver.sourceExts.push('cjs');
}

// Performance: Increase maxWorkers for faster bundling (optional but helpful)
config.maxWorkers = 2; // Set to a reasonable number for your machine

// Optimization: Specifically handle Prisma to prevent OOM
// This helps Metro skip heavy processing of the generated Prisma client
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
