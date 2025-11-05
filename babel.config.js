const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    isProd && ["transform-remove-console", { "exclude": ["error", "warn"] }]
  ].filter(Boolean)
};
