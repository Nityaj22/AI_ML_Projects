const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support TF.js model binary files
config.resolver.assetExts.push('bin');

module.exports = config;
