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
      info: 'GET /api/aws/info',
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      verify: 'GET /api/auth/verify'
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      bedrockModel: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0',
      s3Bucket: process.env.AWS_S3_BUCKET || 'sahaay-documents'
    },
    timestamp: new Date().toISOString()
  })
})

// === Authentication Endpoints ===
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { loadUsers, saveUsers } = require('./services/userStore')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const users = await loadUsers()
    if (Object.values(users).find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    const hash = await bcrypt.hash(password, 10)
    const userId = crypto.randomBytes(8).toString('hex')
    const now = new Date().toISOString()
    const user = { 
      id: userId, 
      name, 
      email, 
      passwordHash: hash, 
      verified: false, 
      createdAt: now, 
      lastLogin: now, 
      profile: { name, email }, 
      progress: {}, 
      bookmarks: {}, 
      activity: [] 
    }
    users[userId] = user
    await saveUsers(users)
    const token = signToken(user)
    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, token })
  } catch (error) {
    console.error('[Lambda] Signup error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const users = await loadUsers()
    const user = Object.values(users).find(u => u.email === email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken(user)
    res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, token })
  } catch (error) {
    console.error('[Lambda] Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/auth/verify
app.get('/api/auth/verify', (req, res) => {
  try {
    const auth = req.headers.authorization
    const token = auth && auth.split(' ')[1]
    if (!token) return res.json({ verified: false })
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      res.json({ ok: true, verified: true, user: decoded })
    } catch (err) {
      res.json({ ok: true, verified: false })
    }
  } catch (error) {
    console.error('[Lambda] Verify error:', error)
    res.status(500).json({ error: error.message })
  }
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