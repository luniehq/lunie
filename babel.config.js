module.exports = {
  presets: [
    [
      "@vue/app",
      {
        useBuiltIns: "entry",
      },
    ],
  ],
  plugins: [["@babel/transform-runtime"]],
}
