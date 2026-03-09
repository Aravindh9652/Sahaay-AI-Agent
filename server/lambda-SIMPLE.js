/**
 * SIMPLE WORKING VERSION - No DynamoDB, just local auth
 */

const serverlessExpress = require('@vendia/serverless-express')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000', 'https://sahaay-ai-agent.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}))
app.use(express.json())
app.options('*', cors())

// SIMPLE IN-MEMORY USER STORE (works without DynamoDB)
const users = {
  'demo@sahaay.com': {
    userId: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@sahaay.com',
    passwordHash: bcrypt.hashSync('demo123', 10),
    profile: { name: 'Demo User', email: 'demo@sahaay.com' }
  }
}

function signToken(user) {
  return jwt.sign({ id: user.userId, email: user.email, name: user.name }, 'dev-secret', { expiresIn: '7d' })
}

// === AUTH ROUTES ===
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

    const user = users[email]
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken(user)
    res.json({ ok: true, user: { id: user.userId, name: user.name, email: user.email }, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    if (users[email]) return res.status(400).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const userId = crypto.randomUUID()
    
    users[email] = {
      userId,
      name,
      email,
      passwordHash: hash,
      profile: { name, email }
    }

    const token = signToken(users[email])
    res.json({ ok: true, user: { id: userId, name, email }, token })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ ok: false, error: 'No token' })

  jwt.verify(token, 'dev-secret', (err, user) => {
    if (err) return res.status(401).json({ ok: false, error: 'Invalid token' })
    res.json({ ok: true, verified: true, user: { id: user.id, email: user.email, name: user.name } })
  })
})

// === TTS ENDPOINT (WORKING FOR ALL LANGUAGES) ===
app.post('/api/translate/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body
    if (!text) return res.status(400).json({ error: 'Missing text parameter' })

    const langMap = { 'en': 'en', 'hi': 'hi', 'ta': 'ta', 'te': 'te', 'bn': 'bn' }
    const langCode = langMap[language] || language

    const encodedText = encodeURIComponent(text)
    const ttsUrl = `https://translate.google.com/translate_tts?client=tw-ob&q=${encodedText}&tl=${langCode}`

    const https = require('https')
    
    https.get(ttsUrl, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/'
      }
    }, (audioRes) => {
      if (audioRes.statusCode !== 200) {
        return res.status(500).json({ error: 'Failed to generate audio' })
      }

      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      
      audioRes.pipe(res)  // STREAMING - works for all languages!
    }).on('error', (err) => {
      res.status(500).json({ error: 'Failed to generate speech: ' + err.message })
    })

  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate speech' })
  }
})

// === TRANSLATION ENDPOINT ===
app.post('/api/translate/translate', async (req, res) => {
  try {
    const { text, target, source = 'auto' } = req.body
    if (!text || !target) return res.status(400).json({ error: 'Missing text or target language' })

    try {
      const { translateText } = require('./aws/translateClient')
      const result = await translateText(text, target, source)
      return res.json({
        translated: result.translated,
        language: result.targetLanguage,
        detected: result.sourceLanguage,
        provider: 'aws-translate'
      })
    } catch (translateError) {
      try {
        const { translateWithBedrock } = require('./aws/bedrockClient')
        const translatedText = await translateWithBedrock(text, target)
        const cleanedTranslation = translatedText.trim().replace(/^["']|["']$/g, '').replace(/^Translation in .*?:\s*/i, '').replace(/^Translation:\s*/i, '')
        return res.json({
          translated: cleanedTranslation,
          language: target,
          provider: 'bedrock-nova-lite'
        })
      } catch (bedrockError) {
        return res.json({
          translated: `${text} (${target})`,
          language: target,
          provider: 'fallback'
        })
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Translation failed' })
  }
})

// === HEALTH CHECK ===
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'SAHAAY Lambda server running', timestamp: new Date().toISOString() })
})

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'SAHAAY AWS-integrated server', version: '1.0.0' })
})

// === RAG QUERY ENDPOINT ===
app.post('/api/aws/query', async (req, res) => {
  try {
    const { userId, query, language = 'en' } = req.body
    if (!userId || !query) {
      return res.status(400).json({ error: 'Missing required fields: userId, query' })
    }

    try {
      const { invokeBedrockModel } = require('./aws/bedrockClient')
      const systemPrompt = `You are SAHAAY AI Assistant, helping Indian citizens with education, career, and government schemes.

User question: ${query}

Provide a helpful, concise answer in 3-4 sentences. Be specific and actionable.

Answer:`

      const aiResponse = await invokeBedrockModel(systemPrompt, {
        temperature: 0.7,
        maxTokens: 500,
        modelId: 'amazon.nova-lite-v1:0'
      })

      res.json({
        ok: true,
        data: {
          answer: aiResponse.trim(),
          query: query,
          userId: userId,
          source: 'bedrock-ai'
        }
      })
    } catch (bedrockError) {
      const lowerQuery = query.toLowerCase()
      let answer = ''
      
      if (lowerQuery.includes('course') || lowerQuery.includes('learn')) {
        answer = `For learning: NPTEL (14,000+ courses), Khan Academy (K-12), Coursera (university courses), SWAYAM (government MOOCs). All offer free certificates.`
      } else if (lowerQuery.includes('job') || lowerQuery.includes('career')) {
        answer = `Job search: Use Naukri.com, LinkedIn, Indeed India. Update profile, network actively, tailor resume, prepare for interviews.`
      } else {
        answer = `I can help with: 📚 Education & courses, 💼 Career & jobs, 📝 Resume & interviews, 🎓 Certifications, 🏛️ Government schemes. What interests you?`
      }
      
      res.json({
        ok: true,
        data: { answer, query, userId, source: 'fallback' }
      })
    }
  } catch (error) {
    res.status(500).json({ error: 'Query processing failed', message: error.message })
  }
})

// === ERROR HANDLERS ===
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path })
})

app.use((error, req, res, next) => {
  console.error('[Lambda] Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error', message: error.message })
})

// === EXPORT LAMBDA HANDLER ===
module.exports.handler = serverlessExpress({ app })
module.exports.app = app

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`SAHAAY Server running on http://localhost:${PORT}`)
  })
}
