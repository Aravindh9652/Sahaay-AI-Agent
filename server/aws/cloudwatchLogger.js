/**
 * AWS CloudWatch Logger
 * Comprehensive logging for all AWS service interactions and user activities
 * Logs to CloudWatch for AWS Hackathon demo visibility
 */

const { CloudWatchLogsClient, CreateLogGroupCommand, CreateLogStreamCommand, PutLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs')

const cloudwatchClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

const LOG_GROUP = '/aws/sahaay/application'
const LOG_STREAM = `sahaay-${new Date().toISOString().split('T')[0]}`

let logStreamCreated = false

/**
 * Initialize log group and stream
 */
async function initializeLogStream() {
  if (logStreamCreated) return

  try {
    // Create log group
    await cloudwatchClient.send(new CreateLogGroupCommand({
      logGroupName: LOG_GROUP
    })).catch(() => {
      // Log group may already exist, that's fine
    })

    // Create log stream
    await cloudwatchClient.send(new CreateLogStreamCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM
    })).catch(() => {
      // Stream may already exist, that's fine
    })

    logStreamCreated = true
    console.log('[CloudWatch] Log stream initialized')
  } catch (err) {
    console.warn('[CloudWatch] Error initializing log stream:', err.message)
  }
}

/**
 * Log event to CloudWatch
 * @param {string} eventType - Type of event (AUTH, API, BEDROCK, etc.)
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 */
async function logToCloudWatch(eventType, message, metadata = {}) {
  try {
    await initializeLogStream()

    const timestamp = Date.now()
    const logMessage = `[${eventType}] ${message}`
    const fullMessage = metadata ? `${logMessage} | ${JSON.stringify(metadata)}` : logMessage

    // Also log to console
    console.log(`${fullMessage}`)

    // Send to CloudWatch (async, don't wait)
    cloudwatchClient.send(new PutLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      logEvents: [
        {
          timestamp: timestamp,
          message: fullMessage
        }
      ]
    })).catch(err => {
      console.warn('[CloudWatch] Error sending log:', err.message)
    })
  } catch (err) {
    console.error('[CloudWatch] Logging error:', err.message)
  }
}

/**
 * Log user authentication events
 */
async function logAuthEvent(action, email, status, details = {}) {
  const metadata = {
    action,
    email,
    status,
    timestamp: new Date().toISOString(),
    ...details
  }
  await logToCloudWatch('AUTH', `User ${action}: ${email}`, metadata)
}

/**
 * Log API calls
 */
async function logApiCall(endpoint, method, status, duration, userId = null) {
  const metadata = {
    endpoint,
    method,
    status,
    durationMs: duration,
    userId,
    timestamp: new Date().toISOString()
  }
  await logToCloudWatch('API', `${method} ${endpoint} - ${status}`, metadata)
}

/**
 * Log Bedrock API calls
 */
async function logBedrockCall(query, model, tokensUsed, responseTime) {
  const metadata = {
    model,
    tokensUsed,
    responseTimeMs: responseTime,
    queryLength: query.length,
    timestamp: new Date().toISOString()
  }
  await logToCloudWatch('BEDROCK', `Model invoked: ${model}`, metadata)
}

/**
 * Log DynamoDB operations
 */
async function logDynamoDBOperation(operation, table, status, itemCount = 0) {
  const metadata = {
    operation,
    table,
    status,
    itemCount,
    timestamp: new Date().toISOString()
  }
  await logToCloudWatch('DYNAMODB', `${operation} on ${table}`, metadata)
}

/**
 * Log S3 operations
 */
async function logS3Operation(operation, bucket, key, status) {
  const metadata = {
    operation,
    bucket,
    key,
    status,
    timestamp: new Date().toISOString()
  }
  await logToCloudWatch('S3', `${operation}: ${key}`, metadata)
}

/**
 * Log Transcribe operations
 */
async function logTranscribeOperation(jobName, status, language, confidence) {
  const metadata = {
    jobName,
    status,
    language,
    confidence,
    timestamp: new Date().toISOString()
  }
  await logToCloudWatch('TRANSCRIBE', `Transcription Job: ${jobName}`, metadata)
}

/**
 * Log AWS Translate operations
 */
async function logTranslateOperation(text, sourceLanguage, targetLanguage, provider, status) {
  const metadata = {
    sourceLanguage,
    targetLanguage,
    provider,
    status,
    textLength: text.length,
    timestamp: new Date().toISOString()
  }
  await logToCloudWatch('TRANSLATE', `${sourceLanguage} → ${targetLanguage} (${provider})`, metadata)
}

/**
 * Log user activity (bookmarks, searches, etc.)
 */
async function logUserActivity(userId, activityType, description, metadata = {}) {
  const logMetadata = {
    userId,
    activityType,
    description,
    timestamp: new Date().toISOString(),
    ...metadata
  }
  await logToCloudWatch('USER_ACTIVITY', `${activityType}: ${description}`, logMetadata)
}

module.exports = {
  logToCloudWatch,
  logAuthEvent,
  logApiCall,
  logBedrockCall,
  logDynamoDBOperation,
  logS3Operation,
  logTranscribeOperation,
  logTranslateOperation,
  logUserActivity
}
