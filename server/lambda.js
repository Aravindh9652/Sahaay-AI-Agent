/**
 * AWS Lambda Handler
 * Wraps Express app for serverless deployment
 * Uses serverless-http to convert Express to Lambda-compatible format
 * 
 * Deploy to AWS Lambda:
 * 1. Ensure package.json has serverless-http
 * 2. Set handler to: lambda.handler
 * 3. Configure environment variables
 */

const serverlessExpress = require('@vendia/serverless-express')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const ragEngine = require('./aws/ragEngine')

dotenv.config()

// Create Express app
const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000', 'https://d3gd5027gtzr4j.cloudfront.net'],
  credentials: true
}))
app.use(express.json())

// === AUTHENTICATION ROUTES ===
// Import and use auth routes for signup, login, profile management
app.use('/api/auth', require('./routes/auth'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'SAHAAY Lambda server running',
    timestamp: new Date().toISOString()
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'SAHAAY AWS-integrated server',
    version: '1.0.0',
    features: ['Bedrock AI', 'DynamoDB sessions', 'S3 documents', 'RAG pipeline']
  })
})

// === RAG Query Endpoint ===
// Main endpoint for government scheme queries with RAG
// POST /api/aws/query
app.post('/api/aws/query', async (req, res) => {
  try {
    const { userId, query, language = 'en', context } = req.body

    // Validate required fields
    if (!userId || !query) {
      return res.status(400).json({
        error: 'Missing required fields: userId, query',
        code: 'INVALID_REQUEST'
      })
    }

    console.log(`[Lambda] Received query from ${userId}`)

    // Process query through RAG pipeline
    const result = await ragEngine.processQuery({
      userId,
      query,
      language,
      context
    })

    // Return structured response
    res.json({
      ok: true,
      data: result
    })

  } catch (error) {
    console.error('[Lambda] Query processing error:', error)
    res.status(500).json({
      error: 'Query processing failed',
      message: error.message,
      code: 'RAG_ERROR'
    })
  }
})

// === Multilingual Query Endpoint ===
// POST /api/aws/query/multilingual
app.post('/api/aws/query/multilingual', async (req, res) => {
  try {
    const { userId, query, targetLanguage = 'en' } = req.body

    if (!userId || !query) {
      return res.status(400).json({
        error: 'Missing userId or query'
      })
    }

    const result = await ragEngine.processMultilingualQuery({
      userId,
      query,
      targetLanguage
    })

    res.json({
      ok: true,
      data: result
    })

  } catch (error) {
    console.error('[Lambda] Multilingual query error:', error)
    res.status(500).json({
      error: 'Multilingual query failed',
      message: error.message
    })
  }
})

// === Health Check Endpoint ===
// GET /api/aws/health
app.get('/api/aws/health', async (req, res) => {
  try {
    const health = await ragEngine.healthCheck()
    res.json({
      ok: health.healthy,
      checks: health.checks,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    })
  }
})

// === Status/Info Endpoint ===
// GET /api/aws/info
app.get('/api/aws/info', (req, res) => {
  res.json({
    service: 'SAHAAY AWS Civic AI Assistant',
    version: '1.0.0',
    deployment: 'AWS Lambda',
    features: {
      bedrock: 'Claude 3 Haiku for conversational AI',
      dynamodb: 'User queries and session storage',
      s3: 'Government scheme documents',
      rag: 'Retrieval-Augmented Generation pipeline',
      multilingual: 'Hindi, Tamil, Telugu, Bengali, English support'
    },
    endpoints: {
      query: 'POST /api/aws/query',
      multilingualQuery: 'POST /api/aws/query/multilingual',
      health: 'GET /api/aws/health',
      info: 'GET /api/aws/info'
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      bedrockModel: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0',
      s3Bucket: process.env.AWS_S3_BUCKET || 'sahaay-documents'
    },
    timestamp: new Date().toISOString()
  })
})

// === Error Handlers ===
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  })
})

app.use((error, req, res, next) => {
  console.error('[Lambda] Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  })
})

// === Export Lambda Handler ===
// This wraps the Express app for AWS Lambda invocation
// AWS Lambda will call this handler for each HTTP request
module.exports.handler = serverlessExpress({ app })

// === Local Development ===
// For local testing, export the Express app
module.exports.app = app

// If running locally (not via Lambda)
if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`SAHAAY Server running on http://localhost:${PORT}`)
    console.log('AWS Integration ready:')
    console.log('  - POST /api/aws/query - RAG query endpoint')
    console.log('  - POST /api/aws/query/multilingual - Multilingual queries')
    console.log('  - GET /api/aws/health - Health check')
    console.log('  - GET /api/aws/info - Service information')
  })
}