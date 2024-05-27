const { promisify } = require('util')
const request = require('request')

const requestPromisified = promisify(request)

/**
 * Get config
 * @param {SDKContext} context
 * @returns {Promise<{drawings}>}
 */
module.exports = async (context) => {
  if (!context.config.configEndpoint && !context.config.redirects) {
    return { config: [] }
  }

  // Static config
  if (!context.config.configEndpoint) {
    return { config: context.config.redirects || [] }
  }

  // Dynamic config
  const { ttl, config } = await context.storage.extension.get('config') || {}
  if (ttl && ttl > Date.now() && config) {
    return { config }
  }

  try {
    const { body } = await requestPromisified({
      uri: context.config.configEndpoint,
      json: true,
      timeout: 2000
    })

    if (!Array.isArray(body.redirects)) {
      context.log.warn(body, 'Endpoint response is malformed')
      await context.storage.extension.set('config', {
        ttl: Date.now() + context.config.configTTL * 1000,
        config: []
      })
      return {
        config: []
      }
    }

    await context.storage.extension.set('config', {
      ttl: Date.now() + context.config.configTTL * 1000,
      config: body.redirects
    })
    return { config: body.redirects }
  } catch (err) {
    context.log.error(err, 'Endpoint error')
    return {
      config: []
    }
  }
}
