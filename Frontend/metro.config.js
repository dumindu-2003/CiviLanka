// Expo installs Router as an optional peer, but this app uses React Navigation.
process.env.EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK = "1";

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
});