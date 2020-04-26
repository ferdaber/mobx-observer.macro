const pluginTester = require("babel-plugin-tester").default;
const plugin = require("babel-plugin-macros");
const path = require("path");
const fs = require("fs");

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: "fixture-1",
    presets: [
      [
        "@babel/preset-env",
        {
          modules: false,
          targets: {
            chrome: 80,
          },
        },
      ],
      "@babel/preset-react",
    ],
  },
  tests: [
    fs.readFileSync(path.resolve("__fixtures__", "fixture-1.js")).toString(),
  ],
});
