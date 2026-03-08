/**
 * Lambda Function Wrappers
 * Converts Express route handlers to Lambda-compatible format
 * Handles API Gateway event/response transformation
 */

/**
 * Wrap Express middleware for Lambda execution
 * Converts API Gateway events to Express request/response objects
 * @param {Function} handler - Express route handler
 * @returns {Function} Lambda handler function
 */
function expressToLambda(handler) {
  return async (event, context) => {
    // Parse API Gateway event into Express-like request
    const req = {
      body: event.body ? JSON.parse(event.body) : {},
      headers: event.headers || {},
      pathParameters: event.pathParameters || {},
      queryStringParameters: event.queryStringParameters || {},
      method: event.httpMethod
    }

    // Create Response object
    let statusCode = 200
    let responseBody = {}

    const res = {
      status: (code) => {
        statusCode = code
        return res
      },
      json: (data) => {
        responseBody = data
        return res
      },
      send: (data) => {
        responseBody = data
        return res
      }
    }

    try {
      await handler(req, res)
      
      return {
        statusCode,
        body: JSON.stringify(responseBody),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    } catch (error) {
      console.error('[Lambda] Error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: { 'Content-Type': 'application/json' }
      }
    }
  }
}

/**
 * Authentication Lambda Handler
 * Entry point for all auth-related API calls via API Gateway
 */
async function authLambdaHandler(event, context) {
  const path = event.path || event.resource
  const method = event.httpMethod

  console.log(`[Lambda Auth] ${method} ${path}`)

  // Route to appropriate handler
  if (path === '/auth/login' && method === 'POST') {
    return loginHandler(event)
  } else if (path === '/auth/signup' && method === 'POST') {
    return signupHandler(event)
  } else if (path === '/auth/profile' && method === 'GET') {
    return profileHandler(event)
  } else if (path === '/auth/verify' && method === 'POST') {
    return verifyHandler(event)
  } else if (path === '/auth/progress' && method === 'PUT') {
    return progressHandler(event)
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' })
  }
}

/**
 * AI Recommendations Lambda Handler
 * Entry point for AI-powered recommendations
 */
async function aiLambdaHandler(event, context) {
  const path = event.path
  const method = event.httpMethod

  console.log(`[Lambda AI] ${method} ${path}`)

  // Route to appropriate AI service
  if (path === '/ai/scheme-recommendations' && method === 'POST') {
    return schemeRecommendationsHandler(event)
  } else if (path === '/ai/course-recommendations' && method === 'POST') {
    return courseRecommendationsHandler(event)
  } else if (path === '/ai/job-matching' && method === 'POST') {
    return jobMatchingHandler(event)
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'AI endpoint not found' })
  }
}

/**
 * Resources Lambda Handler
 * Entry point for resource discovery endpoints
 */
async function resourcesLambdaHandler(event, context) {
  const path = event.path
  const method = event.httpMethod

  console.log(`[Lambda Resources] ${method} ${path}`)

  if (path === '/resources/nearby' && method === 'POST') {
    return nearbyResourcesHandler(event)
  } else if (path === '/resources/search' && method === 'GET') {
    return searchResourcesHandler(event)
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Resources endpoint not found' })
  }
}

// Placeholder handler functions (implement these with actual logic)
async function loginHandler(event) {
  // Auth logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, message: 'Login via Lambda' })
  }
}

async function signupHandler(event) {
  // Signup logic
  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}

async function profileHandler(event) {
  // Get profile from DynamoDB
  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}

async function verifyHandler(event) {
  // Verify JWT
  return { statusCode: 200, body: JSON.stringify({ ok: true, verified: true }) }
}

async function progressHandler(event) {
  // Update user progress
  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}

async function schemeRecommendationsHandler(event) {
  const body = event.body ? JSON.parse(event.body) : {}
  const profile = body || {}
  try {
    const bedrock = require('./bedrockClient')
    const recs = await bedrock.getSchemeRecommendations(profile)
    return { statusCode: 200, body: JSON.stringify({ recommendations: recs }) }
  } catch (err) {
    console.error('[Lambda] schemeRecommendations error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

async function courseRecommendationsHandler(event) {
  const { learningGoal, currentLevel } = event.body ? JSON.parse(event.body) : {}
  try {
    const bedrock = require('./bedrockClient')
    const recs = await bedrock.getCourseRecommendations(learningGoal, currentLevel)
    return { statusCode: 200, body: JSON.stringify({ recommendations: recs }) }
  } catch (err) {
    console.error('[Lambda] courseRecommendations error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

async function jobMatchingHandler(event) {
  const profile = event.body ? JSON.parse(event.body) : {}
  try {
    const bedrock = require('./bedrockClient')
    const matches = await bedrock.matchJobOpportunities(profile)
    return { statusCode: 200, body: JSON.stringify({ matches }) }
  } catch (err) {
    console.error('[Lambda] jobMatching error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

async function nearbyResourcesHandler(event) {
  // Find nearby resources
  return { statusCode: 200, body: JSON.stringify({ resources: [] }) }
}

async function searchResourcesHandler(event) {
  // Search resources
  return { statusCode: 200, body: JSON.stringify({ results: [] }) }
}

/**
 * Create API Gateway Lambda integration response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @param {Object} headers - Custom headers
 * @returns {Object} Formatted Lambda response
 */
function lambdaResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      ...headers
    },
    body: JSON.stringify(body)
  }
}

/**
 * Extract and verify JWT from Lambda event
 * @param {Object} event - API Gateway event
 * @returns {string|null} JWT token or null
 */
function getTokenFromEvent(event) {
  const authHeader = event.headers?.Authorization || event.headers?.authorization
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null
}

module.exports = {
  expressToLambda,
  authLambdaHandler,
  aiLambdaHandler,
  resourcesLambdaHandler,
  lambdaResponse,
  getTokenFromEvent
}
