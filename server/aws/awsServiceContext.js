
/**
 * AWS Service Context
 * Provides information about available AWS services and endpoints
 * Used by frontend to determine what features are available
 */

const AWSServiceUtils = require('./awsServiceUtils')
const awsConfig = require('../config/awsConfig')

class AWSServiceContext {
  constructor() {
    this.initialized = false
    this.serviceStatus = {}
  }

  /**
   * Initialize AWS service context
   * @returns {Promise<Object>} - Service context information
   */
  async initialize() {
    console.log('[AWS Service Context] Initializing...')

    try {
      // Validate AWS configuration
      awsConfig.validate()

      // Get health status
      const health = await AWSServiceUtils.healthCheck()

      this.serviceStatus = {
        initialized: true,
        timestamp: new Date().toISOString(),
        health,
        services: {
          bedrock: {
            enabled: health.checks.bedrock === 'ok',
            model: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0',
            capabilities: ['multilingual-queries', 'intent-recognition', 'scheme-explanation']
          },
          dynamodb: {
            enabled: health.checks.dynamodb === 'ok',
            tables: awsConfig.config.dynamodb.tables,
            capabilities: ['query-history', 'user-profiles', 'saved-schemes']
          },
          s3: {
            enabled: health.checks.s3 === 'ok',
            bucket: process.env.AWS_S3_BUCKET || 'sahaay-documents',
            capabilities: ['document-storage', 'keyword-search', 'signed-downloads']
          },
          rag: {
            enabled: health.checks.bedrock === 'ok' && health.checks.dynamodb === 'ok' && health.checks.s3 === 'ok',
            capabilities: ['retrieval-augmented-generation', 'multilingual-support', 'query-caching']
          }
        },
        endpoints: {
          query: '/api/aws/query',
          multilingualQuery: '/api/aws/query/multilingual',
          health: '/api/aws/health',
          info: '/api/aws/info'
        }
      }

      this.initialized = true
      console.log('[AWS Service Context] ✓ Initialized successfully')

      return this.serviceStatus
    } catch (error) {
      console.error('[AWS Service Context] ✗ Initialization failed:', error.message)
      throw error
    }
  }

  /**
   * Get service context information
   * This is what the frontend receives
   * @returns {Object} - Service context for client
   */
  getContext() {
    if (!this.initialized) {
      throw new Error('Service context not initialized')
    }

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      aws: this.serviceStatus
    }
  }

  /**
   * Check if a specific service is available
   * @param {string} service - Service name
   * @returns {boolean} - True if service is available
   */
  isServiceAvailable(service) {
    return this.serviceStatus.services[service]?.enabled ?? false
  }

  /**
   * Get available features
   * @returns {Array<string>} - List of available features
   */
  getAvailableFeatures() {
    const features = []

    if (this.isServiceAvailable('bedrock')) {
      features.push('ai-conversations')
      features.push('multilingual-support')
    }

    if (this.isServiceAvailable('dynamodb')) {
      features.push('query-history')
      features.push('user-preferences')
      features.push('saved-schemes')
    }

    if (this.isServiceAvailable('s3')) {
      features.push('document-search')
      features.push('scheme-details')
    }

    if (this.isServiceAvailable('rag')) {
      features.push('intelligent-retrieval')
      features.push('ai-powered-answers')
    }

    return features
  }

  /**
   * Get recommended language support
   * @returns {Array<string>} - List of supported languages
   */
  getLanguages() {
    return ['en', 'hi', 'ta', 'te', 'bn']
  }

  /**
   * Get API endpoint information
   * @returns {Object} - API endpoints and usage
   */
  getAPIEndpoints() {
    return {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
      endpoints: [
        {
          method: 'POST',
          path: '/api/aws/query',
          description: 'Government scheme query (English)',
          body: {
            userId: 'string (required)',
            query: 'string (required)',
            language: 'string (optional, default: en)',
            context: 'object (optional)'
          },
          example: {
            userId: 'user_123',
            query: 'What schemes are available for farmers?',
            language: 'en'
          }
        },
        {
          method: 'POST',
          path: '/api/aws/query/multilingual',
          description: 'Query in any language, get response in target language',
          body: {
            userId: 'string (required)',
            query: 'string (required)',
            targetLanguage: 'string (optional, default: en)'
          },
          example: {
            userId: 'user_123',
            query: 'किसानों के लिए कौन सी योजनाएं उपलब्ध हैं?',
            targetLanguage: 'hi'
          }
        },
        {
          method: 'GET',
          path: '/api/aws/health',
          description: 'Health check for all AWS services',
          response: {
            ok: 'boolean',
            checks: 'object with service status',
            timestamp: 'ISO string'
          }
        },
        {
          method: 'GET',
          path: '/api/aws/info',
          description: 'Service information and configuration',
          response: {
            service: 'string',
            version: 'string',
            features: 'object',
            aws: 'object with AWS service info'
          }
        }
      ]
    }
  }
}

// Create singleton instance
const serviceContext = new AWSServiceContext()

module.exports = serviceContext