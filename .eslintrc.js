module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    "import/resolver": "webpack"
  },
  rules: {
    indent: [ "error", "tab", { SwitchCase: 1 } ],
    quotes: [ "error", "double" ],
    "no-tabs": [ "error", { allowIndentationTabs: true } ],
    "no-restricted-globals": [ "off" ],
    "brace-style": [ "error", "allman", { allowSingleLine: true } ],
    "no-plusplus": [ "off" ],
    "array-bracket-spacing": [ "error", "always" ],
    "import/extensions": [ "error", "never" ],
    "arrow-parens": [ "error", "as-needed" ],
    "no-use-before-define": [ "off" ],
    "implicit-arrow-linebreak": [ "off" ],
    "curly": [ "error", "multi" ],
    "eol-last": [ "error", "never" ],
    "no-async-promise-executor": [ "off" ],
    "default-case": [ "off" ],
    "no-unused-expressions": [ "off" ],
    "no-param-reassign": [ "error", { props: false } ],
    "new-cap": [ "off" ],
    "no-multi-assign": [ "off" ],
    "max-classes-per-file": [ "off" ],
    "operator-linebreak": [ "error", "before" ],
    "no-nested-ternary": [ "off" ],
    "no-shadow": [ "off" ],
    "no-await-in-loop": [ "off" ],
    "nonblock-statement-body-position": [ "error", "any" ],
    "no-restricted-syntax": [ "off" ],
    "no-loop-func": [ "off" ],
  },
};
