module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    'browser': true
  },
  rules: {
    'no-constant-condition': ["error", { checkLoops: false }]
  },
  globals: {
    WeakMap: false
  }
};
