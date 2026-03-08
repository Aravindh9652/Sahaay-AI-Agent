const express = require('express')
const router = express.Router()

// import generic AI provider
const { handleQuery } = require('../services/aiProvider')
const { logApiCall } = require('../aws/cloudwatchLogger')

// optional AWS Bedrock helper
let bedrockClient = null
try {
  bedrockClient = require('../aws/bedrockClient')
} catch (e) {
  // not available
}

// Middleware to verify JWT token (duplicate from auth.js)
const jwt = require('jsonwebtoken')
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// helper to run bedrock or fallback
async function runBedrockFunction(func, ...args) {
  if (!bedrockClient || typeof func !== 'function') {
    const query = `Bedrock not configured; cannot perform AI operation.`
    return { provider: 'fallback', answer: query }
  }
  try {
    const result = await func(...args)
    return { provider: 'bedrock', result }
  } catch (err) {
    console.error('Bedrock function error:', err)
    return { provider: 'bedrock', error: err.message }
  }
}

// Scheme recommendations
router.post('/scheme-recommendations', authenticateToken, async (req, res) => {
  try {
    const profile = req.body || {}
    let output
    if (bedrockClient && bedrockClient.getSchemeRecommendations) {
      output = await bedrockClient.getSchemeRecommendations(profile)
    } else {
      const prompt = `Recommend 3-5 government schemes based on this profile: ${JSON.stringify(profile)}`
      output = await handleQuery({ query: prompt })
    }
    res.json({ ok: true, recommendations: output })
    logApiCall('/api/ai/scheme-recommendations', 'POST', 'success', 0, req.user?.id)
  } catch (error) {
    console.error('Scheme recommendation error:', error)
    logApiCall('/api/ai/scheme-recommendations', 'POST', 'failed', 0, req.user?.id)
    res.status(500).json({ error: error.message || 'Server error' })
  }
})

// Course recommendations
router.post('/course-recommendations', authenticateToken, async (req, res) => {
  try {
    const { learningGoal, currentLevel } = req.body || {}
    let output
    if (bedrockClient && bedrockClient.getCourseRecommendations) {
      output = await bedrockClient.getCourseRecommendations(learningGoal, currentLevel)
    } else {
      const prompt = `Recommend courses for goal: ${learningGoal}, level: ${currentLevel}`
      output = await handleQuery({ query: prompt })
    }
    res.json({ ok: true, recommendations: output })
    logApiCall('/api/ai/course-recommendations', 'POST', 'success', 0, req.user?.id)
  } catch (error) {
    console.error('Course recommendation error:', error)
    logApiCall('/api/ai/course-recommendations', 'POST', 'failed', 0, req.user?.id)
    res.status(500).json({ error: error.message || 'Server error' })
  }
})

// Job matching
router.post('/job-matching', authenticateToken, async (req, res) => {
  try {
    const profile = req.body || {}
    let output
    if (bedrockClient && bedrockClient.matchJobOpportunities) {
      output = await bedrockClient.matchJobOpportunities(profile)
    } else {
      const prompt = `Find jobs for: ${JSON.stringify(profile)}`
      output = await handleQuery({ query: prompt })
    }
    res.json({ ok: true, matches: output })
    logApiCall('/api/ai/job-matching', 'POST', 'success', 0, req.user?.id)
  } catch (error) {
    console.error('Job matching error:', error)
    logApiCall('/api/ai/job-matching', 'POST', 'failed', 0, req.user?.id)
    res.status(500).json({ error: error.message || 'Server error' })
  }
})

// Analyze resources
router.post('/analyze-resources', authenticateToken, async (req, res) => {
  try {
    const { nearbyResources, learningGoal } = req.body || {}
    let output
    if (bedrockClient && bedrockClient.analyzeResourcesWithAI) {
      output = await bedrockClient.analyzeResourcesWithAI(nearbyResources, learningGoal)
    } else {
      const prompt = `Analyze these resources: ${JSON.stringify(nearbyResources)} for goal ${learningGoal}`
      output = await handleQuery({ query: prompt })
    }
    res.json({ ok: true, insights: output })
    logApiCall('/api/ai/analyze-resources', 'POST', 'success', 0, req.user?.id)
  } catch (error) {
    console.error('Analyze resources error:', error)
    logApiCall('/api/ai/analyze-resources', 'POST', 'failed', 0, req.user?.id)
    res.status(500).json({ error: error.message || 'Server error' })
  }
})

module.exports = router
