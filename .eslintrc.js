module.exports = {
  env: {
    node: true,
  },
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  rules: {
    'class-methods-use-this': 'off',
    'no-restricted-syntax': ['error', 'ForInStatement'],
    'import/prefer-default-export': 'off',
    'max-len': ['error', { code: 140 }],
    '@typescript-eslint/no-explicit-any': 'error',
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  overrides: [{ files: '**/*.ts?(x)' }],
  ignorePatterns: ['.eslintrc.js', 'jest.config.js'],
}
