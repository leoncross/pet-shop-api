module.exports = {
  roots: ['./tests'],
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.ts',
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // collectCoverage: true,
  // coverageDirectory: '<rootDir>/coverage',
  // coverageReporters: ['text', 'lcov'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',  // adjust the path if needed
    },
  },
};
