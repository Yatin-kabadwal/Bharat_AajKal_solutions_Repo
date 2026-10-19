const isProduction = process.env.NODE_ENV === 'production'

const config = {
  plugins: { '@tailwindcss/postcss': {} }
}

if (isProduction) {
  config.plugins.cssnano = {}
  config.plugins['postcss-variable-compress'] = {}
}

export default config
