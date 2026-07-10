/* eslint-env node */

const { minify } = require('terser')

module.exports = async function terserLoader(source) {
  const callback = this.async()

  try {
    const result = await minify(source, {
      compress: this.query.compress,
      mangle: this.query.mangle,
      sourceMap: false,
      format: {
        comments: false,
      },
    })

    callback(null, result.code)
  } catch (error) {
    callback(error)
  }
}
