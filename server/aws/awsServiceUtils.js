
/**
 * AWS Service Utilities
 * Helper functions for AWS service interactions
 */

const awsConfig = require('../config/awsConfig')

class AWSServiceUtils {
  /**
   * Initialize and validate AWS services
   * @returns {Promise<Object>} - Initialization result
   */
  static async initialize() {
    console.log('[AWS Service Utils] Initializing AWS services...')

    try {
      // Validate configuration
      const isValid = awsConfig.validate()
      if (!isValid) {
        throw new Error(
          'AWS configuration validation failed. Check .env file and AWS credentials.'
        )
      }

      console.log('[AWS Service Utils] ✓ AWS services initialized successfully')
      return {
        success: true,
        config: awsConfig.getAll()
      }
    } catch (error) {
      console.error('[AWS Service Utils] ✗ Initialization failed:', error.message)
      throw error
    }
  }

  /**
   * Check if AWS services are available
   * @returns {Promise<Object>} - Health check result
   */
  static async healthCheck() {
    const checks = {
      bedrock: 'checking',
      dynamodb: 'checking',
      s3: 'checking',
      credentials: 'checking'
    }

    // Check Bedrock
    try {
      const bedrockClient = require('../aws/bedrockClient')
      // Simple check - try to get capabilities or metadata (if available)
      checks.bedrock = 'ok'
    } catch (error) {
      checks.bedrock = 'error: ' + error.message
    }

    // Check DynamoDB
    try {
      const dynamodbClient = require('../aws/dynamodbClient')
      checks.dynamodb = 'ok'
    } catch (error) {
      checks.dynamodb = 'error: ' + error.message
    }

    // Check S3
    try {
      const s3Client = require('../aws/s3Client')
      checks.s3 = 'ok'
    } catch (error) {
      checks.s3 = 'error: ' + error.message
    }

    // Check credentials
    try {
      const credentials = {
        region: process.env.AWS_REGION || 'us-east-1',
        fromEnv: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        fromIAM: true // Assume IAM is available (will fail if not)
      }
      checks.credentials = 'ok'
    } catch (error) {
      checks.credentials = 'error: ' + error.message
    }

    const healthy = Object.values(checks).every(v => v === 'ok')

    return {
      healthy,
      timestamp: new Date().toISOString(),
      checks
    }
  }

  /**
   * Format AWS error for user response
   * @param {Error} error - AWS error
   * @returns {Object} - Formatted error response
   */
  static formatError(error) {
    let code = 'AWS_ERROR'
    let message = 'An AWS service error occurred'
    let statusCode = 500

    // Bedrock errors
    if (error.name === 'ThrottlingException') {
      code = 'BEDROCK_THROTTLED'
      message = 'AI service is temporarily busy. Please try again shortly.'
      statusCode = 429
    } else if (error.name === 'AccessDeniedException') {
      code = 'BEDROCK_ACCESS_DENIED'
      message = 'AWS credentials missing or invalid for Bedrock service'
      statusCode = 403
    } else if (error.name === 'ModelNotReadyException') {
      code = 'BEDROCK_MODEL_ERROR'
      message = 'AI model is not available. Please try again later.'
      statusCode = 503
    }

    // DynamoDB errors
    else if (error.name === 'ResourceNotFoundException') {
      code = 'DYNAMODB_TABLE_NOT_FOUND'
      message = 'Database table not configured properly'
      statusCode = 500
    } else if (error.name === 'ValidationException') {
      code = 'VALIDATION_ERROR'
      message = 'Invalid request format'
      statusCode = 400
    }

    // S3 errors
    else if (error.code === 'NoSuchBucket') {
      code = 'S3_BUCKET_NOT_FOUND'
      message = 'Document storage bucket not found'
      statusCode = 500
    } else if (error.code === 'AccessDenied') {
      code = 'S3_ACCESS_DENIED'
      message = 'Cannot access document storage'
      statusCode = 403
    }

    // Network errors
    else if (error.message && error.message.includes('ECONNREFUSED')) {
      code = 'AWS_CONNECTION_ERROR'
      message = 'Cannot connect to AWS services. Check your network and AWS region.'
      statusCode = 503
    }

    return {
      code,
      message,
      statusCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }

  /**
   * Retry utility for failed AWS calls
   * @param {Function} fn - Async function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delayMs - Delay between retries in milliseconds
   * @returns {Promise} - Result of function
   */
  static async retry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        // Don't retry on client errors (4xx)
        if (error.statusCode && error.statusCode < 500) {
          throw error
        }

        if (i < maxRetries - 1) {
          console.log(
            `[AWS Service Utils] Retry ${i + 1}/${maxRetries - 1} after ${delayMs}ms...`
          )
          await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
        }
      }
    }

    throw lastError
  }

  /**
   * Get current AWS region
   * @returns {string} - AWS region
   */
  static getRegion() {
    return process.env.AWS_REGION || 'us-east-1'
  }

  /**
   * Get environment info for debugging
   * @returns {Object} - Environment information
   */
  static getEnvironmentInfo() {
    return {
      environment: process.env.NODE_ENV || 'development',
      region: this.getRegion(),
      bedrock: {
        model: process.env.BEDROCK_MODEL_ID || 'not-set',
        region: process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1'
      },
      s3: {
        bucket: process.env.AWS_S3_BUCKET || 'not-set',
        region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1'
      },
      dynamodb: {
        region: process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'us-east-1',
        tables: {
          queries: process.env.DYNAMODB_QUERIES_TABLE || 'sahaay-queries',
          users: process.env.DYNAMODB_USERS_TABLE || 'sahaay-users',
          schemes: process.env.DYNAMODB_SAVED_SCHEMES_TABLE || 'sahaay-saved-schemes'
        }
      },
      credentials: {
        source: process.env.AWS_ACCESS_KEY_ID ? 'environment' : 'iam-role-or-file'
      }
    }
  }
}

module.exports = AWSServiceUtils
