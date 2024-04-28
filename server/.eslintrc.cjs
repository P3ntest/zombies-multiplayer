module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["eslint:recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "no-unused-vars": "off",
  },
};
