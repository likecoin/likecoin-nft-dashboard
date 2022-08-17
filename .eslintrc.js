module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'airbnb-base',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    'array-bracket-newline': [
      'warn',
      { minItems: 2 },
    ],
    'array-element-newline': [
      'warn',
      'always',
    ],
    'comma-dangle': [
      'warn',
      'always-multiline',
    ],
    'import/extensions': 'off',
    'no-shadow': 'off',
  },
};
