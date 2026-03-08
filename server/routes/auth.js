const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// CloudWatch Logging for AWS Hackathon demo
const { logAuthEvent, logUserActivity } = require('../aws/cloudwatchLogger')

// DynamoDB user storage (persistent cloud database)
const { 
  findUserByEmail, 
  getUserById, 
  saveUser, 
  updateLastLogin,
  emailExists 
} = require('../services/dynamodbUserStore')

// helpers to sign jwt
function signToken(user){
  const secret = process.env.JWT_SECRET || 'dev-secret'
  return jwt.sign({ id: user.userId, email: user.email, name: user.name }, secret, { expiresIn: '7d' })
}

// Middleware to verify JWT token
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

// Signup - with DynamoDB persistence
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, location, language } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing name, email, or password' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    // Check if email already exists in DynamoDB
    console.log(`[Auth] Checking if email exists: ${email}`);
    const existing = await findUserByEmail(email)
    if (existing) {
      console.log(`[Auth] Email already registered: ${email}`);
      return res.status(400).json({ error: 'Email already registered', userExists: true })
    }

    // Hash password and create user
    const hash = await bcrypt.hash(password, 10)
    const userId = crypto.randomUUID() // Use UUID for better uniqueness

    const nowISO = new Date().toISOString()
    const user = {
      userId, // Required for DynamoDB
      name,
      email,
      passwordHash: hash,
      verified: false,
      createdAt: nowISO,
      lastLogin: nowISO,
      profile: {
        name,
        email,
        phone: phone || '',
        location: location || '',
        language: language || 'en',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        bio: '',
        skills: [],
        interests: [],
        joinedDate: nowISO,
        isActive: true
      },
      progress: {
        education: {},
        market: {},
        civic: {},
        translate: { history: [] }
      },
      bookmarks: {
        market: [],
        education: [],
        civic: []
      },
      activity: [
        { type: 'signup', description: 'Account created successfully', timestamp: nowISO }
      ]
    }

    // Save to DynamoDB
    console.log(`[Auth] Creating new user: ${email}`);
    await saveUser(user)

    console.log(`[Auth] User created in DynamoDB: ${email}`)
    const token = signToken(user)

    // Log to CloudWatch for AWS Hackathon demo
    logAuthEvent('signup', email, 'success', { 
      userId, 
      name, 
      location: location || 'Not provided',
      language: language || 'en'
    })

    res.json({ ok: true, user: { id: userId, name, email }, token })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

// Login - with DynamoDB persistence
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

    console.log(`[Auth] Login attempt: ${email}`);

    // Find user in DynamoDB
    const user = await findUserByEmail(email)
    if (!user) {
      console.log(`[Auth] User not found: ${email}`);
      // Log failed login to CloudWatch
      logAuthEvent('login', email, 'failed', { reason: 'User not found' })
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      console.log(`[Auth] Invalid password for: ${email}`);
      // Log failed login to CloudWatch
      logAuthEvent('login', email, 'failed', { reason: 'Invalid password' })
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Update last login in DynamoDB
    const loginTime = new Date().toISOString()
    console.log(`[Auth] Login successful: ${email}`);
    await updateLastLogin(user.userId, loginTime)

    const token = signToken(user)
    
    // Log successful login to CloudWatch
    logAuthEvent('login', email, 'success', { 
      userId: user.userId,
      name: user.name
    })

    res.json({ ok: true, user: { id: user.userId, name: user.name, email: user.email }, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

// Get user profile from DynamoDB
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const u = await getUserById(req.user.id)
    if (!u || !u.profile) return res.status(404).json({ error: 'Profile not found' })
    res.json({ profile: u.profile })
  } catch (err) {
    console.error('Profile fetch error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user profile in DynamoDB
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, location, language, bio, skills, interests } = req.body
    
    // Get existing user
    const u = await getUserById(req.user.id)
    if (!u) return res.status(404).json({ error: 'Profile not found' })

    // Update profile fields
    const profile = u.profile || {}
    if (name) profile.name = name
    if (phone !== undefined) profile.phone = phone
    if (location !== undefined) profile.location = location
    if (language) profile.language = language
    if (bio !== undefined) profile.bio = bio
    if (skills) profile.skills = skills
    if (interests) profile.interests = interests

    u.profile = profile
    if (name) u.name = name

    u.activity = u.activity || []
    u.activity.push({ type: 'profile_update', description: 'Profile updated', timestamp: new Date().toISOString() })

    // Save back to DynamoDB
    await saveUser(u)
    
    // Log profile update to CloudWatch
    logUserActivity(req.user.id, 'profile_update', 'User updated profile', {
      updatedFields: Object.keys({name, phone, location, language, bio, skills, interests}).filter(k => arguments[k])
    })
    
    res.json({ ok: true, profile })
  } catch (err) {
    console.error('Profile update error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

// Get user progress from DynamoDB
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const u = await getUserById(req.user.id)
    const progress = (u && u.progress) || { education: {}, market: {}, civic: {}, translate: { history: [] } }
    res.json({ progress })
  } catch (err) {
    console.error('Progress fetch error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user progress in DynamoDB
router.put('/progress', authenticateToken, async (req, res) => {
  try {
    const { type, data } = req.body
    
    // Get existing user
    const u = await getUserById(req.user.id)
    if (!u) return res.status(404).json({ error: 'User not found' })
    
    u.progress = u.progress || { education: {}, market: {}, civic: {}, translate: { history: [] } }

    if (type === 'education') {
      u.progress.education = { ...u.progress.education, ...data }
    } else if (type === 'market') {
      u.progress.market = { ...u.progress.market, ...data }
    } else if (type === 'civic') {
      u.progress.civic = { ...u.progress.civic, ...data }
    } else if (type === 'translate') {
      u.progress.translate = { ...u.progress.translate, ...data }
    }

    u.activity = u.activity || []
    u.activity.push({ type: 'progress_update', description: `Updated ${type} progress`, timestamp: new Date().toISOString() })

    // Save back to DynamoDB
    await saveUser(u)

    // Log progress update to CloudWatch
    logUserActivity(req.user.id, 'progress_update', `Updated ${type} progress`, {
      category: type,
      dataUpdated: Object.keys(data).length
    })

    res.json({ ok: true, progress: u.progress })
  } catch (err) {
    console.error('Progress update error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

// Get user bookmarks from DynamoDB
router.get('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const u = await getUserById(req.user.id)
    const bookmarks = (u && u.bookmarks) || { market: [], education: [], civic: [] }
    res.json({ bookmarks })
  } catch (err) {
    console.error('Bookmarks fetch error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user bookmarks in DynamoDB
router.put('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { type, itemId, action } = req.body
    const u = await getUserById(req.user.id)
    if (!u) return res.status(404).json({ error: 'User not found' })
    
    u.bookmarks = u.bookmarks || { market: [], education: [], civic: [] }

    if (action === 'add') {
      if (!u.bookmarks[type].includes(itemId)) u.bookmarks[type].push(itemId)
    } else if (action === 'remove') {
      u.bookmarks[type] = u.bookmarks[type].filter(id => id !== itemId)
    }

    u.activity = u.activity || []
    u.activity.push({ type: 'bookmark', description: `${action === 'add' ? 'Added' : 'Removed'} ${type} bookmark`, timestamp: new Date().toISOString() })

    await saveUser(u)

    // Log bookmark action to CloudWatch
    logUserActivity(req.user.id, 'bookmark', `${action === 'add' ? 'Added' : 'Removed'} ${type} bookmark`, {
      type,
      itemId,
      action
    })

    res.json({ ok: true, bookmarks: u.bookmarks })
  } catch (err) {
    console.error('Bookmarks update error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

// Get user activity from DynamoDB
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const u = await getUserById(req.user.id)
    const activities = (u && u.activity) || []
    // sort descending
    activities.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp))
    res.json({ activity: activities.slice(0,50) })
  } catch (err) {
    console.error('Activity fetch error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Add custom activity event to DynamoDB
router.post('/activity', authenticateToken, async (req, res) => {
  try {
    const { type, description, metadata } = req.body || {}
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' })
    }

    const u = await getUserById(req.user.id)
    if (!u) {
      return res.status(404).json({ error: 'User not found' })
    }

    u.activity = u.activity || []
    u.activity.push({
      type: type || 'activity',
      description: description.trim(),
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    })

    await saveUser(u)

    // Log custom activity to CloudWatch
    logUserActivity(req.user.id, type || 'activity', description.trim(), metadata)

    res.json({ ok: true })
  } catch (err) {
    console.error('Add activity error:', err)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

// Verify token and user from DynamoDB
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const u = await getUserById(req.user.id)
    if (!u) {
      return res.status(401).json({ ok: false, error: 'User not found' })
    }
    res.json({ ok: true, verified: true, user: { id: u.userId, email: u.email, name: u.name } })
  } catch (err) {
    console.error('Verification error:', err)
    res.status(401).json({ ok: false, error: 'Token invalid' })
  }
})

// Secure forgot password flow - store reset tokens in DynamoDB instead of S3
// Generate and store reset token in memory (for development) or DynamoDB
const resetTokens = {} // In-memory store for demo (use DynamoDB in production)

// Generate and store reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })
    
    console.log(`[Auth] Forgot password request for: ${email}`)
    const user = await findUserByEmail(email)
    if (!user) {
      console.log(`[Auth] User not found: ${email}`)
      return res.status(404).json({ error: 'User not found' })
    }
    
    const token = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 1000 * 60 * 15 // 15 min expiry
    resetTokens[user.userId] = { token, expires, email: user.email }
    
    console.log(`[Auth] Reset token generated for: ${email}`)
    // For demo purposes, return token. In production, send via email
    res.json({ ok: true, message: 'Reset token generated. Check your email or use the token below.', token })
  } catch (err) {
    console.error('[Auth] Forgot password error:', err.message)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

// Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    
    console.log(`[Auth] Reset password request for: ${email}`)
    const user = await findUserByEmail(email)
    if (!user) {
      console.log(`[Auth] User not found: ${email}`)
      return res.status(404).json({ error: 'User not found' })
    }
    
    const tokenData = resetTokens[user.userId]
    if (!tokenData || tokenData.token !== token) {
      console.log(`[Auth] Invalid token for: ${email}`)
      return res.status(400).json({ error: 'Invalid token' })
    }
    
    if (Date.now() > tokenData.expires) {
      console.log(`[Auth] Token expired for: ${email}`)
      delete resetTokens[user.userId]
      return res.status(400).json({ error: 'Token expired. Request a new one.' })
    }
    
    // Update password
    const hash = await bcrypt.hash(newPassword, 10)
    user.passwordHash = hash
    await saveUser(user)
    delete resetTokens[user.userId]
    
    console.log(`[Auth] Password reset successful for: ${email}`)
    res.json({ ok: true, message: 'Password reset successful. You can now login.' })
  } catch (err) {
    console.error('[Auth] Reset password error:', err.message)
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

module.exports = router