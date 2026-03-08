/**
 * AWS Service API Client
 * Frontend client for communicating with AWS-powered backend
 * Handles all API calls to /api/aws/* endpoints
 */

class AWSServiceClient {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL
    this.timeout = 30000 // 30 seconds
    this.retries = 2
  }

  /**
   * Make API request with retry logic
   * @private
   */
  async _request(method, endpoint, data = null, retryCount = 0) {
    try {
      const url = `${this.baseURL}${endpoint}`
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // Retry on network errors
      if (retryCount < this.retries && error.message.includes('fetch')) {
        console.warn(`[AWS Client] Retry ${retryCount + 1}/${this.retries}`, error.message)
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)))
        return this._request(method, endpoint, data, retryCount + 1)
      }

      throw error
    }
  }

  /**
   * Query government schemes
   * @param {string} userId - User ID
   * @param {string} query - User's question
   * @param {string} language - Language code (en, hi, ta, te, bn)
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} - Query result with answer and sources
   */
  async query(userId, query, language = 'en', context = null) {
    try {
      const result = await this._request('POST', '/api/aws/query', {
        userId,
        query,
        language,
        context
      })

      if (!result.ok) {
        throw new Error(result.error || 'Query failed')
      }

      return result.data
    } catch (error) {
      console.error('[AWS Client] Query error:', error)
      throw {
        code: 'QUERY_ERROR',
        message: 'Failed to process query',
        details: error.message
      }
    }
  }

  /**
   * Query in any language, get response in target language
   * @param {string} userId - User ID
   * @param {string} query - Query in any language
   * @param {string} targetLanguage - Target language for response
   * @returns {Promise<Object>} - Translated query result
   */
  async queryMultilingual(userId, query, targetLanguage = 'en') {
    try {
      const result = await this._request('POST', '/api/aws/query/multilingual', {
        userId,
        query,
        targetLanguage
      })

      if (!result.ok) {
        throw new Error(result.error || 'Multilingual query failed')
      }

      return result.data
    } catch (error) {
      console.error('[AWS Client] Multilingual query error:', error)
      throw {
        code: 'MULTILINGUAL_QUERY_ERROR',
        message: 'Failed to process multilingual query',
        details: error.message
      }
    }
  }

  /**
   * Check health of AWS services
   * @returns {Promise<Object>} - Health status
   */
  async health() {
    try {
      const result = await this._request('GET', '/api/aws/health')
      return result
    } catch (error) {
      console.error('[AWS Client] Health check failed:', error)
      throw {
        code: 'HEALTH_CHECK_ERROR',
        message: 'Failed to check service health',
        details: error.message
      }
    }
  }

  /**
   * Get service information
   * @returns {Promise<Object>} - Service information
   */
  async getServiceInfo() {
    try {
      const result = await this._request('GET', '/api/aws/info')
      return result
    } catch (error) {
      console.error('[AWS Client] Get service info failed:', error)
      throw {
        code: 'GET_INFO_ERROR',
        message: 'Failed to get service information',
        details: error.message
      }
    }
  }

  /**
   * Initialize service and check availability
   * @returns {Promise<Object>} - Initialization result
   */
  async initialize() {
    try {
      console.log('[AWS Client] Initializing...')

      // Check service health
      const health = await this.health()
      console.log('[AWS Client] Service health:', health)

      // Get service info
      const info = await this.getServiceInfo()
      console.log('[AWS Client] Service info:', info)

      if (!health.ok) {
        console.warn('[AWS Client] Some services are not healthy')
      }

      return {
        initialized: true,
        health,
        info
      }
    } catch (error) {
      console.error('[AWS Client] Initialization failed:', error)
      return {
        initialized: false,
        error
      }
    }
  }

  /**
   * Create a user-friendly error message from API error
   * @param {Object} error - Error object
   * @returns {string} - User-friendly error message
   */
  static getErrorMessage(error) {
    if (error.message === 'Failed to fetch') {
      return 'Network error. Please check your connection and try again.'
    }

    switch (error.code) {
      case 'QUERY_ERROR':
        return 'Failed to process your query. Please try again.'
      case 'MULTILINGUAL_QUERY_ERROR':
        return 'Failed to process multilingual query. Please try again.'
      case 'HEALTH_CHECK_ERROR':
        return 'Service is temporarily unavailable. Please try again later.'
      case 'GET_INFO_ERROR':
        return 'Failed to load service information. Please try again.'
      default:
        return error.message || 'An error occurred. Please try again.'
    }
  }

  /**
   * Set base URL for API requests
   * @param {string} url - Base URL
   */
  setBaseURL(url) {
    this.baseURL = url
  }

  /**
   * Set request timeout
   * @param {number} ms - Timeout in milliseconds
   */
  setTimeout(ms) {
    this.timeout = ms
  }

  /**
   * Set retry count
   * @param {number} count - Number of retries
   */
  setRetries(count) {
    this.retries = count
  }
}

// Export singleton for use throughout the app
const awsServiceClient = new AWSServiceClient('http://localhost:5000')

export default awsServiceClient
