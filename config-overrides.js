const { override, addBabelPlugin } = require('customize-cra');

module.exports = override(
  process.env.NODE_ENV === 'production' &&
    addBabelPlugin(['transform-remove-console', { exclude: ['error', 'warn'] }])
);
