module.exports = {
  roots: ['./tests'],
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.ts',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',  // adjust the path if needed
    },
  },
};
