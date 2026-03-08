const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const aiProvider = require('./services/aiProvider')

// Initialize DynamoDB for user authentication
const { ensureUsersTableExists, ensureQueriesTableExists } = require('./aws/dynamodbSetup')
const { logTranslateOperation, logApiCall } = require('./aws/cloudwatchLogger')

// AWS Integration modules - OPTIONAL
let ragEngine, s3Client, dynamodbClient
try {
  ragEngine = require('./aws/ragEngine')
  s3Client = require('./aws/s3Client')
  dynamodbClient = require('./aws/dynamodbClient')
  console.log('[AWS] Integration modules loaded successfully')
} catch (err) {
  console.log('[AWS] AWS modules not available - using DynamoDB for auth only')
  // AWS modules are optional - we'll use DynamoDB for user authentication
}

dotenv.config()

const app = express()
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://d3gd5027gtzr4j.cloudfront.net'],
  credentials: true
}))
app.use(express.json())

// ==================== INITIALIZE DYNAMODB FOR USERS ====================
async function initializeDynamoDB() {
  try {
    console.log('[DynamoDB] Initializing user authentication table...')
    await ensureUsersTableExists()
    console.log('[DynamoDB] User table initialized successfully')
    await ensureQueriesTableExists()
    console.log('[DynamoDB] Queries table initialized successfully')
  } catch (err) {
    console.warn('[DynamoDB] Could not initialize table:', err.message)
    console.warn('[DynamoDB] Make sure AWS credentials are configured or use local DynamoDB')
  }
}

// ==================== INITIALIZE DEMO USER IN DYNAMODB ====================
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { saveUser, findUserByEmail } = require('./services/dynamodbUserStore')

async function ensureDemoUser() {
  try {
    console.log('[Init] Checking for demo user in DynamoDB...')
    
    // Check if demo user exists in DynamoDB
    const demoExists = await findUserByEmail('demo@sahaay.com')
    if (demoExists) {
      console.log('[Init] ✅ Demo user already exists in DynamoDB')
      console.log('[Init] Login with: demo@sahaay.com / demo123')
      return
    }
    
    console.log('[Init] Creating demo user in DynamoDB...')
    const hash = await bcrypt.hash('demo123', 10)
    const nowISO = new Date().toISOString()
    const demoUser = {
      userId: 'demo_user_001', // DynamoDB uses userId, not id
      name: 'Demo User',
      email: 'demo@sahaay.com',
      passwordHash: hash,
      verified: true,
      createdAt: nowISO,
      lastLogin: nowISO,
      profile: {
        name: 'Demo User',
        email: 'demo@sahaay.com',
        phone: '+91-9999999999',
        location: 'India',
        language: 'en',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_user_001',
        bio: 'Welcome to SAHAAY! Explore government schemes and services.',
        skills: ['Research', 'Learning'],
        interests: ['Government Schemes', 'Education', 'Healthcare'],
        joinedDate: nowISO,
        isActive: true
      },
      progress: { education: {}, market: {}, civic: {}, translate: { history: [] } },
      bookmarks: { market: [], education: [], civic: [] },
      activity: [{ type: 'signup', description: 'Demo account created', timestamp: nowISO }]
    }
    
    // Save to DynamoDB
    await saveUser(demoUser)
    console.log('[Init] ✅ Demo user created in DynamoDB successfully!')
    console.log('[Init] Login with: demo@sahaay.com / demo123')
  } catch (err) {
    console.error('[Init] ❌ Failed to create demo user in DynamoDB:', err.message)
    console.error('[Init] Error details:', err)
  }
}

// Initialize demo user after DynamoDB tables are ready
async function initializeAll() {
  await initializeDynamoDB()
  await ensureDemoUser()
}

initializeAll()

// ==================== HEALTH CHECK ENDPOINTS ====================
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'SAHAAY server running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// ==================== AUTHENTICATION ROUTES ====================
app.use('/api/auth', require('./routes/auth'))

// ==================== NEW AI-POWERED ROUTES ====================
app.use('/api/ai', require('./routes/ai'))

// ==================== HACKATHON TEST ROUTES ====================
// AWS service demo endpoints for judges
app.use('/api/test', require('./routes/test'))

// ==================== LEGACY AI ROUTES ====================
// Keep for backward compatibility with existing clients
app.post('/api/ai/query', async (req, res) => {
  const { query, provider, options } = req.body || {}
  if (!query) return res.status(400).json({ error: 'Missing query' })
  // default to bedrock if enabled
  const selectedProvider = provider || (process.env.USE_BEDROCK === 'true' ? 'bedrock' : 'openai')
  try {
    const r = await aiProvider.handleQuery({ query, provider: selectedProvider, options })
    res.json({ ok: true, response: r })
  } catch (err) {
    console.error('AI query error:', err)
    res.status(500).json({ error: 'AI error' })
  }
})

// ==================== TRANSLATION ROUTES ====================

// speech-to-text using AWS Transcribe (requires TRANSCRIBE_BUCKET env var)
app.use('/api/translate', require('./routes/recognition'));

app.post('/api/translate/translate', async (req, res) => {
  const { text, target, source, useAI } = req.body
  if (!text || !target) return res.status(400).json({ error: 'Missing text or target language' })

  // Log incoming request
  console.log(`[Translation Request] Text: "${text}", Source: ${source}, Target: ${target}`)

  // Check if input is romanized Indian script (for Tamil, Telugu, Bengali, Hindi)
  const isRomanized = /^[a-zA-Z\s]+$/.test(text.trim())
  const indianLanguages = ['hi', 'ta', 'te', 'bn']
  
  let processedText = text
  let actualSource = source
  
  // If source is Telugu/Tamil/Hindi/Bengali and input is romanized, transliterate first
  if (isRomanized && indianLanguages.includes(source) && source !== 'auto') {
    console.log(`[Translation] Input appears to be romanized ${source}, attempting transliteration...`)
    
    try {
      // Call transliteration endpoint
      const translitRes = await fetch('http://localhost:5000/api/translate/transliterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, language: source })
      })
      const translitData = await translitRes.json()
      
      if (translitData.transliterated) {
        processedText = translitData.transliterated
        console.log(`[Translation] Transliterated: "${text}" -> "${processedText}"`)
      }
    } catch (err) {
      console.warn('[Translation] Transliteration failed:', err.message)
    }
  }

  // Try AWS Translate first (Option A - AWS native)
  let translateModule
  try {
    translateModule = require('./aws/translateClient')
  } catch (err) {
    // AWS modules not available
  }

  if (translateModule) {
    try {
      const result = await translateModule.translateText(processedText, target, actualSource || 'auto')
      console.log(`[Translation] AWS Translate: "${processedText}" -> "${result.translated}" (${target})`)
      return res.json({ translated: result.translated, language: target, provider: 'aws-translate' })
    } catch (err) {
      console.warn('[Translation] AWS Translate failed, falling back to AI:', err.message)
      // Fall through to AI
    }
  }

  // If useAI is enabled and Bedrock is available, use it for fallback
  if (useAI) {
    try {
      const bedrockClient = require('./aws/bedrockClient')
      const translated = await bedrockClient.translateWithBedrock(processedText, target)
      console.log(`[Translation AI] "${processedText}" -> "${translated}" (${target})`)
      logTranslateOperation(processedText, source || 'auto', target, 'bedrock', 'success')
      return res.json({ translated, language: target, provider: 'bedrock' })
    } catch (err) {
      console.warn('[Translation AI] Bedrock translation failed, falling back to dictionary:', err.message)
      logTranslateOperation(processedText, source || 'auto', target, 'bedrock', 'failed')
    }
  }

  const dictionary = {
    'hi': {
      'hello': 'नमस्ते', 'hi': 'नमस्ते', 'hey': 'अरे',
      'goodbye': 'अलविदा', 'bye': 'अलविदा',
      'thank you': 'धन्यवाद', 'thanks': 'धन्यवाद',
      'yes': 'हाँ', 'ok': 'ठीक है', 'okay': 'ठीक है',
      'no': 'नहीं', 'nope': 'नहीं',
      'good morning': 'सुप्रभात', 'morning': 'सुप्रभात',
      'good afternoon': 'नमस्ते', 'afternoon': 'दोपहर',
      'good evening': 'शुभ संध्या', 'evening': 'शाम',
      'good night': 'शुभ रात्रि', 'night': 'रात',
      'how are you': 'आप कैसे हैं', 'how': 'कैसे', 'are': 'हैं', 'you': 'आप',
      'what is your name': 'आपका नाम क्या है', 'what is your name?': 'आपका नाम क्या है',
      'my name is': 'मेरा नाम है', 'your name': 'आपका नाम',
      'i am fine': 'मैं ठीक हूँ', 'fine': 'ठीक',
      'good': 'अच्छा', 'bad': 'बुरा', 'love': 'प्यार',
      'water': 'पानी', 'food': 'खाना', 'help': 'मदद',
      'friend': 'दोस्त', 'family': 'परिवार', 'home': 'घर',
      'listen': 'सुनिए', 'speak': 'बोलिए', 'translate': 'अनुवाद करें',
      'please': 'कृपया', 'sorry': 'माफ करें', 'excuse me': 'माफ करें'
    },
    'ta': {
      'hello': 'வணக்கம்', 'hi': 'வணக்கம்', 'hey': 'ஆய்',
      'goodbye': 'பிறகு சந்திப்போம்', 'bye': 'பிறகு சந்திப்போம்',
      'thank you': 'நன்றி', 'thanks': 'நன்றி',
      'yes': 'ஆம்', 'ok': 'சரி', 'okay': 'சரி',
      'no': 'இல்லை', 'nope': 'இல்லை',
      'good morning': 'காலைநலம்', 'morning': 'காலை',
      'good afternoon': 'பிற்பகல் வணக்கம்', 'afternoon': 'பிற்பகல்',
      'good evening': 'மாலை வணக்கம்', 'evening': 'மாலை',
      'good night': 'இரவு வணக்கம்', 'night': 'இரவு',
      'how are you': 'நீ எப்படி இருக்கிறாய்', 'how': 'எப்படி', 'are': 'இருக்கிறாய்', 'you': 'நீ',
      'what is your name': 'உனது பெயர் என்ன', 'what is your name?': 'உனது பெயர் என்ன',
      'my name is': 'என் பெயர்', 'your name': 'உனது பெயர்',
      'i am fine': 'நான் நன்றாக இருக்கிறேன்', 'fine': 'நன்றாக',
      'good': 'நல்ல', 'bad': 'கெட்ட', 'love': 'அன்பு',
      'water': 'நீர்', 'food': 'உணவு', 'help': 'உதவி',
      'friend': 'நண்பன்', 'family': 'குடும்பம்', 'home': 'வீடு',
      'listen': 'கேளுங்கள்', 'speak': 'பேசுங்கள்', 'translate': 'மொழிபெயர்ப்பு செய்யுங்கள்',
      'please': 'தயவுசெய்து', 'sorry': 'மன்னிக்கவும்', 'excuse me': 'மன்னிக்கவும்'
    },
    'te': {
      'hello': 'హలో', 'hi': 'హలో', 'hey': 'ఓయ్',
      'goodbye': 'సరే', 'bye': 'దీక్ష',
      'thank you': 'ధన్యవాదాలు', 'thanks': 'ధన్యవాదాలు',
      'yes': 'అవును', 'ok': 'సరే', 'okay': 'సరే',
      'no': 'లేదు', 'nope': 'లేదు',
      'good morning': 'శుభోదయం', 'shubodayam': 'శుభోదయం', 'morning': 'ఉదయం',
      'good afternoon': 'శుభ మధ్యాహ్నం', 'afternoon': 'మధ్యాహ్నం',
      'good evening': 'శుభ సంధ్య', 'evening': 'సంధ్య',
      'good night': 'శుభ రాత్రి', 'night': 'రాత్రి',
      'how are you': 'మీరు ఎలా ఉన్నారు', 'how': 'ఎలా', 'are': 'ఉన్నారు', 'you': 'మీరు',
      'what is your name': 'నీ పేరు ఏంటీ', 'what is your name?': 'నీ పేరు ఏంటీ',
      'my name is': 'నా పేరు', 'your name': 'నీ పేరు',
      'i am fine': 'నేను బాగున్నాను', 'fine': 'బాగు',
      'good': 'మంచి', 'bad': 'చెడ్డ', 'love': 'ప్రేమ',
      'water': 'నీరు', 'food': 'ఆహారం', 'help': 'సహాయం',
      'friend': 'స్నేహితుడు', 'family': 'కుటుంబం', 'home': 'ఇల్లు',
      'listen': 'వినండి', 'speak': 'మాట్లాడండి', 'translate': 'అనువాదం చేయండి',
      'please': 'దయచేసి', 'sorry': 'క్షమించండి', 'excuse me': 'క్షమించండి'
    },
    'bn': {
      'hello': 'হ্যালো', 'hi': 'হ্যালো', 'hey': 'ওয়েই',
      'goodbye': 'বিদায়', 'bye': 'পুনরায় দেখা হবে',
      'thank you': 'ধন্যবাদ', 'thanks': 'ধন্যবাদ',
      'yes': 'হ্যাঁ', 'ok': 'ঠিক আছে', 'okay': 'ঠিক আছে',
      'no': 'না', 'nope': 'না',
      'good morning': 'শুভ সকাল', 'morning': 'সকাল',
      'good afternoon': 'শুভ অপরাহ্ন', 'afternoon': 'অপরাহ্ন',
      'good evening': 'শুভ সন্ধ্যা', 'evening': 'সন্ধ্যা',
      'good night': 'শুভ রাত্রি', 'night': 'রাত',
      'how are you': 'আপনি কেমন আছেন', 'how': 'কেমন', 'are': 'আছেন', 'you': 'আপনি',
      'what is your name': 'আপনার নাম কী', 'what is your name?': 'আপনার নাম কী',
      'my name is': 'আমার নাম', 'your name': 'আপনার নাম',
      'i am fine': 'আমি ভালো আছি', 'fine': 'ভালো',
      'good': 'ভাল', 'bad': 'খারাপ', 'love': 'ভালোবাসা',
      'water': 'পানি', 'food': 'খাবার', 'help': 'সাহায্য',
      'friend': 'বন্ধু', 'family': 'পরিবার', 'home': 'বাড়ি',
      'listen': 'শুনুন', 'speak': 'কথা বলুন', 'translate': 'অনুবাদ করুন',
      'please': 'অনুগ্রহ করে', 'sorry': 'দুঃখিত', 'excuse me': 'ক্ষমা করুন'
    }
  }

  try {
    const lowerText = text.toLowerCase().trim()
    console.log(`[Translation] Input: "${text}" (${lowerText}), Target: ${target}`)

    // Handle romanized Indian language input
    const romanizedIndianPhrases = {
      // Telugu romanized phrases
      'naa peru': 'my name',
      'naa pru': 'my name',
      'nenu': 'i',
      'na': 'my',
      'peru': 'name',
      'enu': 'what',
      'ela': 'how',
      'levu': 'is not',
      // Tamil romanized
      'en peyar': 'my name',
      'en puyal': 'my name',
      // Bengali romanized
      'amar nam': 'my name',
      // Hindi romanized
      'mera naam': 'my name'
    }
    
    // Try to solve romanized Indian language phrases
    if (isRomanized && actualSource !== 'en') {
      // Check if first words match romanized dictionary
      const words = lowerText.split(/\s+/)
      let romanizedTranslation = null
      
      // Try phrase matching
      for (const [romanized, meaning] of Object.entries(romanizedIndianPhrases)) {
        if (lowerText.includes(romanized)) {
          romanizedTranslation = lowerText.replace(new RegExp(romanized, 'gi'), meaning)
          console.log(`[Translation] Romanized phrase detected: "${romanized}" -> "${meaning}"`)
          break
        }
        // Also check word by word
        if (words.some(w => w === romanized)) {
          console.log(`[Translation] Found romanized word: "${romanized}"`)
          romanizedTranslation = lowerText.replace(romanized, meaning)
          break
        }
      }
      
      // If we found a romanized match, use that as basis for translation
      if (romanizedTranslation) {
        lowerText = romanizedTranslation
      }
    }

    // Try exact match in dictionary first
    if (dictionary[target] && dictionary[target][lowerText]) {
      const result = dictionary[target][lowerText]
      console.log(`[Translation] Exact match found: "${result}"`)
      return res.json({ translated: result, language: target })
    }

    // Try partial dictionary match
    if (dictionary[target]) {
      for (let key in dictionary[target]) {
        if (lowerText.includes(key) || key.includes(lowerText)) {
          const result = dictionary[target][key]
          console.log(`[Translation] Partial match found: "${key}" -> "${result}"`)
          return res.json({ translated: result, language: target })
        }
      }
    }

    // Final fallback - return the original text
    console.log(`[Translation] No match found, returning original text`)
    return res.json({ translated: text, language: target })

  } catch (err) {
    console.error('[Translation] Endpoint error:', err.message)
    res.json({ translated: text, language: target })
  }
})

// ==================== TEXT-TO-SPEECH ENDPOINT ====================

// POST /api/translate/tts - Convert text to speech audio (all languages)
app.post('/api/translate/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body
    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' })
    }

    // Language code mapping
    const langMap = {
      'en': 'en',
      'hi': 'hi',
      'ta': 'ta',
      'te': 'te',
      'bn': 'bn'
    }

    const langCode = langMap[language] || language

    console.log(`[TTS] Generating speech for "${text}" in language: ${langCode}`)

    // Use Google Translate TTS API directly
    const encodedText = encodeURIComponent(text)
    const ttsUrl = `https://translate.google.com/translate_tts?client=tw-ob&q=${encodedText}&tl=${langCode}`

    // Fetch the audio from Google's API
    const https = require('https')
    
    return new Promise((resolve, reject) => {
      https.get(ttsUrl, { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (audioRes) => {
        console.log(`[TTS] Got audio response with status: ${audioRes.statusCode}`)
        
        if (audioRes.statusCode !== 200) {
          console.error(`[TTS] Failed to fetch audio: ${audioRes.statusCode}`)
          res.status(500).json({ error: 'Failed to generate audio' })
          return
        }

        // Set proper headers for audio response
        res.setHeader('Content-Type', 'audio/mpeg')
        res.setHeader('Content-Disposition', `attachment; filename="speech.mp3"`)
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Cache-Control', 'public, max-age=3600')

        // Pipe the audio stream directly to response
        audioRes.pipe(res)

        console.log(`[TTS] Audio streamed successfully for "${text}" (${langCode})`)
      }).on('error', (err) => {
        console.error('[TTS] Error fetching audio from Google:', err.message)
        res.status(500).json({ error: 'Failed to generate speech: ' + err.message })
        reject(err)
      })
    })

  } catch (err) {
    console.error('[TTS] Error:', err.message)
    res.status(500).json({ error: err.message || 'Failed to generate speech' })
  }
})

// ==================== AWS RAG ENDPOINTS (PRIMARY) ====================

// POST /api/aws/query - Government scheme queries with Claude 3 Haiku + RAG
app.post('/api/aws/query', async (req, res) => {
  try {
    const { userId, query, language = 'en', context } = req.body

    if (!userId || !query) {
      return res.status(400).json({
        error: 'Missing required fields: userId, query',
        code: 'INVALID_REQUEST'
      })
    }

    console.log(`[AWS RAG] Processing query from ${userId}: "${query.substring(0, 50)}..."`)

    // Process through RAG pipeline
    const result = await ragEngine.processQuery({
      userId,
      query,
      language,
      context
    })

    res.json({
      ok: true,
      data: result
    })

  } catch (error) {
    console.error('[AWS RAG] Query error:', error)
    res.status(500).json({
      error: 'Query processing failed',
      message: error.message,
      code: 'RAG_ERROR'
    })
  }
})

// POST /api/aws/query/multilingual - Multilingual queries
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
    console.error('[AWS RAG] Multilingual error:', error)
    res.status(500).json({
      error: 'Multilingual query failed',
      message: error.message
    })
  }
})

// GET /api/aws/health - Health check for all AWS services
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

// GET /api/aws/info - Service information and configuration
app.get('/api/aws/info', (req, res) => {
  res.json({
    service: 'SAHAAY AWS Civic AI Assistant',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    deployment: 'AWS Lambda + Express',
    features: {
      bedrock: 'Amazon Nova Lite for multilingual conversational AI',
      dynamodb: 'User queries and session storage with TTL',
      s3: 'Government scheme documents and metadata',
      rag: 'Retrieval-Augmented Generation pipeline',
      multilingual: 'Hindi, Tamil, Telugu, Bengali, English (5 languages)'
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      bedrockModel: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0',
      s3Bucket: process.env.AWS_S3_BUCKET || 'sahaay-documents',
      dynamodbTables: {
        queries: process.env.DYNAMODB_QUERIES_TABLE || 'sahaay-queries',
        users: process.env.DYNAMODB_USERS_TABLE || 'sahaay-users',
        schemes: process.env.DYNAMODB_SAVED_SCHEMES_TABLE || 'sahaay-saved-schemes'
      }
    }
  })
})

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  })
})

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                SAHAAY AWS SERVER STARTED               ║
╠════════════════════════════════════════════════════════╣
║ Server:         http://localhost:${PORT}                   
║ Environment:    ${process.env.NODE_ENV || 'development'}
║ AWS Region:     ${process.env.AWS_REGION || 'us-east-1'}
║ Bedrock Model:  Claude 3 Haiku                        
║ Database:       DynamoDB (3 tables)                   
║ Storage:        S3 (${process.env.AWS_S3_BUCKET || 'sahaay-documents'})
╠════════════════════════════════════════════════════════╣
║ Available Endpoints:                                   
║  POST   /api/aws/query            (Query assistant)   
║  POST   /api/aws/query/multilingual (Multilingual)    
║  GET    /api/aws/health           (Health check)
║  GET    /api/aws/info             (Service info)
║  POST   /api/auth/*               (Authentication)    
║  POST   /api/translate/translate   (Translation)      
╚════════════════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, gracefully shutting down...')
  server.close(() => {
    console.log('[SERVER] Server closed')
    process.exit(0)
  })
})

module.exports = app

// AWS Lambda handler for serverless deployment
const serverlessExpress = require('@vendia/serverless-express');
exports.handler = serverlessExpress({ app });
