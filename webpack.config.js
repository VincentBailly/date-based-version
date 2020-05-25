module.exports = {
  target: "node",
  mode: "production",
  entry: "./lib/index.js",
  output: {
    path: __dirname,
    filename: "index.js",
    library: "date-based-version",
    libraryTarget: "umd",
  },
};
