module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "@feature-sliced/eslint-config/rules/import-order",
    "@feature-sliced/eslint-config/rules/public-api/lite",
    "@feature-sliced/eslint-config/rules/layers-slices",
  ],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
  ignorePatterns: ["dist", "node_modules", "scripts", "vite.config.ts"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};
