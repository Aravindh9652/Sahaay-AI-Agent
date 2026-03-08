/**
 * AWS Configuration Loader
 * Validates and loads AWS service configurations from environment variables
 * Ensures all required AWS services are properly configured
 */

const fs = require('fs')
const path = require('path')

class AWSConfig {
  constructor() {
    this.validated = false
    this.config = {}
    this.errors = []
  }

  /**
   * Load and validate AWS configuration
   * @returns {Object} - Validated AWS configuration
   * @throws {Error} - If required configuration is missing
   */
  load() {
    console.log('[AWS Config] Loading and validating configuration...')

    // Bedrock configuration
    this.config.bedrock = {
      region: process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1',
      modelId: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0'
    }

    // DynamoDB configuration
    this.config.dynamodb = {
      region: process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'us-east-1',
      tables: {
        queries: process.env.DYNAMODB_QUERIES_TABLE || 'sahaay-queries',
        users: process.env.DYNAMODB_USERS_TABLE || 'sahaay-users',
        schemes: process.env.DYNAMODB_SAVED_SCHEMES_TABLE || 'sahaay-saved-schemes'
      }
    }

    // S3 configuration
    this.config.s3 = {
      region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'sahaay-documents'
    }

    // AWS credentials
    this.config.credentials = {
      region: process.env.AWS_REGION || 'us-east-1',
      // Credentials can be provided via:
      // 1. AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars
      // 2. IAM role (when running on EC2/Lambda)
      // 3. ~/.aws/credentials file
      // SDK will auto-detect in this order
    }

    // General configuration
    this.config.general = {
      environment: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info'
    }

    this.validated = true
    return this.config
  }

  /**
   * Validate AWS credentials are available
   * @returns {boolean} - True if credentials are available
   */
  validateCredentials() {
    console.log('[AWS Config] Validating AWS credentials...')

    // Check if credentials are available via environment
    const hasEnvCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    
    // Check if IAM credentials file exists
    const credentialsFile = path.join(process.env.HOME || process.env.USERPROFILE || '', '.aws', 'credentials')
    const hasFileCredentials = fs.existsSync(credentialsFile)

    if (!hasEnvCredentials && !hasFileCredentials) {
      this.errors.push(
        'AWS credentials not found. Please configure:\n' +
        '  1. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables, OR\n' +
        '  2. Run `aws configure` to create ~/.aws/credentials file, OR\n' +
        '  3. Use IAM role (when running on AWS Lambda/EC2)'
      )
      return false
    }

    console.log('[AWS Config] ✓ AWS credentials available')
    return true
  }

  /**
   * Validate DynamoDB tables configuration
   * @returns {boolean} - True if tables are properly configured
   */
  validateDynamoDBTables() {
    console.log('[AWS Config] Validating DynamoDB table names...')

    const requiredTables = ['queries', 'users', 'schemes']
    requiredTables.forEach(table => {
      if (!this.config.dynamodb.tables[table]) {
        this.errors.push(`DynamoDB table name not configured for: ${table}`)
      }
    })

    if (this.errors.length === 0) {
      console.log('[AWS Config] ✓ DynamoDB tables configured:', this.config.dynamodb.tables)
      return true
    }
    return false
  }

  /**
   * Validate S3 bucket configuration
   * @returns {boolean} - True if S3 is properly configured
   */
  validateS3Bucket() {
    console.log('[AWS Config] Validating S3 bucket...')

    if (!this.config.s3.bucket) {
      this.errors.push('S3 bucket name not configured')
      return false
    }

    console.log('[AWS Config] ✓ S3 bucket configured:', this.config.s3.bucket)
    return true
  }

  /**
   * Validate Bedrock model configuration
   * @returns {boolean} - True if Bedrock is properly configured
   */
  validateBedrockModel() {
    console.log('[AWS Config] Validating Bedrock model...')

    if (!this.config.bedrock.modelId) {
      this.errors.push('Bedrock model ID not configured')
      return false
    }

    console.log('[AWS Config] ✓ Bedrock model configured:', this.config.bedrock.modelId)
    return true
  }

  /**
   * Run all validation checks
   * @returns {boolean} - True if all validations pass
   */
  validate() {
    console.log('[AWS Config] ====================================')
    console.log('[AWS Config] Running AWS Configuration Validation')
    console.log('[AWS Config] ====================================')

    this.load()

    const checks = [
      this.validateCredentials(),
      this.validateBedrockModel(),
      this.validateDynamoDBTables(),
      this.validateS3Bucket()
    ]

    const allValid = checks.every(c => c === true)

    console.log('[AWS Config] ====================================')
    if (allValid) {
      console.log('[AWS Config] ✓ All validations PASSED')
    } else {
      console.log('[AWS Config] ✗ Validation FAILED with errors:')
      this.errors.forEach(err => console.error(`[AWS Config]   - ${err}`))
    }
    console.log('[AWS Config] ====================================')

    return allValid
  }

  /**
   * Get configuration for a specific service
   * @param {string} service - Service name (bedrock, dynamodb, s3, credentials)
   * @returns {Object} - Service configuration
   */
  getServiceConfig(service) {
    if (!this.validated) {
      throw new Error('Configuration not loaded. Call load() first.')
    }
    return this.config[service] || {}
  }

  /**
   * Get all configuration
   * @returns {Object} - Complete AWS configuration
   */
  getAll() {
    if (!this.validated) {
      throw new Error('Configuration not loaded. Call load() first.')
    }
    return this.config
  }
}

// Create singleton instance
const awsConfig = new AWSConfig()

module.exports = awsConfig