module.exports = {
  presets: [
    '@vue/cli-plugin-babel',
    [
      "@vue/app",
      {
        useBuiltIns: "entry",
      },
    ],
  ],
  plugins: ["@babel/transform-runtime", '@babel/plugin-proposal-optional-chaining'],
}
