// AWS Lambda handler for Authentication endpoints (signup/login/verify)
// This file can be deployed as a Lambda behind API Gateway (HTTP API).

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { loadUsers, saveUsers } = require('../services/userStore')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}

exports.handler = async function(event) {
  // event.path determines route
  const { httpMethod, path } = event
  const body = event.body ? JSON.parse(event.body) : {}

  try {
    if (path === '/signup' && httpMethod === 'POST') {
      const { name, email, password } = body
      if (!name || !email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) }
      }
      const users = await loadUsers()
      if (Object.values(users).find(u => u.email === email)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Email already registered' }) }
      }
      const hash = await bcrypt.hash(password, 10)
      const userId = crypto.randomBytes(8).toString('hex')
      const now = new Date().toISOString()
      const user = { id: userId, name, email, passwordHash: hash, verified: false, createdAt: now, lastLogin: now, profile: { name, email }, progress: {}, bookmarks: {}, activity: [] }
      users[userId] = user
      await saveUsers(users)
      const token = signToken(user)
      return { statusCode: 200, body: JSON.stringify({ ok: true, user: { id: user.id, name: user.name, email: user.email }, token }) }
    }

    if (path === '/login' && httpMethod === 'POST') {
      const { email, password } = body
      const users = await loadUsers()
      const user = Object.values(users).find(u => u.email === email)
      if (!user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) }
      const match = await bcrypt.compare(password, user.passwordHash)
      if (!match) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) }
      const token = signToken(user)
      return { statusCode: 200, body: JSON.stringify({ ok: true, user: { id: user.id, name: user.name, email: user.email }, token }) }
    }

    if (path === '/verify' && httpMethod === 'POST') {
      const auth = event.headers.Authorization || event.headers.authorization
      const token = auth && auth.split(' ')[1]
      if (!token) return { statusCode: 401, body: JSON.stringify({ verified: false }) }
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        return { statusCode: 200, body: JSON.stringify({ ok: true, verified: true, user: decoded }) }
      } catch (err) {
        return { statusCode: 200, body: JSON.stringify({ ok: true, verified: false }) }
      }
    }
  } catch (err) {
    console.error('Lambda auth error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) }
}
