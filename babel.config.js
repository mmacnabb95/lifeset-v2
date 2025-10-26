module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            src: './src',
          },
        },
      ],
      // TEMPORARILY DISABLED: Reanimated plugin causes symlink issues
      // We'll add it back once the app is running
      // 'react-native-reanimated/plugin', // Must be last
    ],
  };
};

