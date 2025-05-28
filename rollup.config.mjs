import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

const production = !process.env.ROLLUP_WATCH;

export default [
{
  input: "src/index.js",
  output: {
    file: "public/bundle.js",
    format: "iife",
    sourcemap: !production,
  },
  watch: {
   clearScreen: false,
   include: "src/**"
  },
  plugins: [
    resolve({
      extensions: [".js", ".jsx"],
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        production ? "production" : "development",
      ),
      preventAssignment: true,
    }),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-env"],
      plugins: [
        // Transform JSX to h() function calls for Preact
        [
          "@babel/plugin-transform-react-jsx",
          { pragma: "h", pragmaFrag: "Fragment" },
        ],
      ],
    }),
    commonjs(),
    postcss({
      extensions: [".css"],
      minimize: production,
      extract: "bundle.css"
    }),
    !production &&
      serve({
        contentBase: "public",
        host: "localhost",
        port: 3000,
      }),
    !production && livereload("public"),
    production && terser(),
  ]
  }
];
