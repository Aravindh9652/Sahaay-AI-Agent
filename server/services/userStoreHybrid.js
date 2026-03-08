/**
 * Hybrid User Storage Service
 * Primary: AWS DynamoDB
 * Fallback: Local JSON file (if DynamoDB unavailable)
 * Intelligently switches between modes based on availability
 */

const path = require('path')
const fs = require('fs').promises

let storageMode = 'unknown'
let dynamodbClient = null

// Try to load DynamoDB client
try {
  dynamodbClient = require('./aws/dynamodbClient')
  storageMode = 'dynamodb'
  console.log('[UserStore] DynamoDB mode enabled')
} catch (err) {
  console.log('[UserStore] DynamoDB unavailable, using local JSON fallback')
  storageMode = 'local'
}

const DATA_DIR = path.join(__dirname, '../data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (err) {
    console.error('[UserStore] Error creating data directory:', err.message)
  }
}

/**
 * Load users from storage (DynamoDB or local JSON)
 */
async function loadUsers() {
  if (storageMode === 'dynamodb' && dynamodbClient) {
    try {
      const users = await dynamodbClient.getAllUsers()
      const usersObj = {}
      users.forEach(user => {
        usersObj[user.id] = user
      })
      return usersObj
    } catch (err) {
      console.error('[UserStore] DynamoDB load failed, falling back to local:', err.message)
      storageMode = 'local'
    }
  }

  // Local JSON fallback
  try {
    await ensureDataDir()
    const content = await fs.readFile(USERS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {} // Empty store
    }
    console.error('[UserStore] Error loading users:', err.message)
    return {}
  }
}

/**
 * Save users to storage
 */
async function saveUsers(users) {
  if (storageMode === 'dynamodb' && dynamodbClient) {
    try {
      for (const [id, user] of Object.entries(users)) {
        await dynamodbClient.saveUser(user)
      }
      console.log('[UserStore] Users saved to DynamoDB')
      return
    } catch (err) {
      console.error('[UserStore] DynamoDB save failed, falling back to local:', err.message)
      storageMode = 'local'
    }
  }

  // Local JSON fallback
  try {
    await ensureDataDir()
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
    console.log('[UserStore] Users saved to local JSON')
  } catch (err) {
    console.error('[UserStore] Error saving users:', err.message)
  }
}

/**
 * Save single user
 */
async function saveUser(user) {
  if (storageMode === 'dynamodb' && dynamodbClient) {
    try {
      await dynamodbClient.saveUser(user)
      return user
    } catch (err) {
      console.error('[UserStore] DynamoDB save failed, falling back to local:', err.message)
      storageMode = 'local'
    }
  }

  // Local JSON fallback
  const users = await loadUsers()
  users[user.id] = user
  await saveUsers(users)
  return user
}

/**
 * Get single user by ID
 */
async function getUser(userId) {
  if (storageMode === 'dynamodb' && dynamodbClient) {
    try {
      return await dynamodbClient.getUser(userId)
    } catch (err) {
      console.error('[UserStore] DynamoDB get failed, falling back to local:', err.message)
      storageMode = 'local'
    }
  }

  // Local JSON fallback
  const users = await loadUsers()
  return users[userId] || null
}

/**
 * Find user by email
 */
async function findUserByEmail(email) {
  if (storageMode === 'dynamodb' && dynamodbClient) {
    try {
      return await dynamodbClient.getUserByEmail(email)
    } catch (err) {
      console.error('[UserStore] DynamoDB query failed, falling back to local:', err.message)
      storageMode = 'local'
    }
  }

  // Local JSON fallback
  const users = await loadUsers()
  return Object.values(users).find(u => u.email === email) || null
}

/**
 * Update user data
 */
async function updateUser(userId, updates) {
  if (storageMode === 'dynamodb' && dynamodbClient) {
    try {
      return await dynamodbClient.updateUser(userId, updates)
    } catch (err) {
      console.error('[UserStore] DynamoDB update failed, falling back to local:', err.message)
      storageMode = 'local'
    }
  }

  // Local JSON fallback
  const users = await loadUsers()
  if (users[userId]) {
    users[userId] = {
      ...users[userId],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await saveUsers(users)
    return users[userId]
  }
  return null
}

/**
 * Get user by ID (alternative to getUser)
 */
async function getUserById(userId) {
  return await getUser(userId)
}

/**
 * Check if email already exists
 */
async function emailExists(email) {
  const user = await findUserByEmail(email)
  return user !== null
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(userId, timestamp) {
  if (storageMode === 'dynamodb' && dynamodbClient) {
    try {
      return await dynamodbClient.updateLastLogin(userId, timestamp)
    } catch (err) {
      console.error('[UserStore] DynamoDB update failed, falling back to local:', err.message)
      storageMode = 'local'
    }
  }

  // Local JSON fallback
  const users = await loadUsers()
  if (users[userId]) {
    users[userId].lastLogin = timestamp
    await saveUsers(users)
    return true
  }
  return false
}

/**
 * Get current storage mode
 */
function getStorageMode() {
  return storageMode
}

/**
 * Get storage statistics
 */
async function getStorageStats() {
  const users = await loadUsers()
  return {
    mode: storageMode,
    totalUsers: Object.keys(users).length,
    lastUpdated: new Date().toISOString()
  }
}

module.exports = {
  loadUsers,
  saveUsers,
  saveUser,
  getUser,
  getUserById,
  findUserByEmail,
  updateUser,
  updateLastLogin,
  emailExists,
  getStorageMode,
  getStorageStats
}
