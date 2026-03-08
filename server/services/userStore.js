const fs = require('fs')
const path = require('path')

// environment-controlled local store for development or when AWS credentials are missing
const USE_LOCAL = process.env.USE_LOCAL_STORE === 'true' ||
                  !process.env.AWS_ACCESS_KEY_ID ||
                  !process.env.AWS_SECRET_ACCESS_KEY

let s3Client, S3_BUCKET
if (!USE_LOCAL) {
  const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
  // create own S3 client since we only need basic object storage
  s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
  S3_BUCKET = process.env.AWS_S3_BUCKET || 'sahaay-documents'
}

const USERS_KEY = 'data/users.json' // store all users and related info
const LOCAL_PATH = path.join(__dirname, '../data/users.json')

// ensure local directory exists
if (USE_LOCAL) {
  const dir = path.dirname(LOCAL_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// load users JSON from S3 or local file, or return empty object
async function loadUsers() {
  if (USE_LOCAL) {
    try {
      if (!fs.existsSync(LOCAL_PATH)) return {}
      const data = fs.readFileSync(LOCAL_PATH, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      console.error('[userStore] loadUsers local error', err.message)
      return {}
    }
  }

  try {
    const { GetObjectCommand } = require('@aws-sdk/client-s3')
    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: USERS_KEY })
    const resp = await s3Client.send(command)
    const body = await streamToString(resp.Body)
    return JSON.parse(body)
  } catch (err) {
    if (err.name === 'NoSuchKey') return {};
    console.error('[userStore] loadUsers error', err.message)
    return {}
  }
}

async function saveUsers(users) {
  if (USE_LOCAL) {
    try {
      fs.writeFileSync(LOCAL_PATH, JSON.stringify(users, null, 2), 'utf-8')
      return
    } catch (err) {
      console.error('[userStore] saveUsers local error', err.message)
      throw err
    }
  }

  const { PutObjectCommand } = require('@aws-sdk/client-s3')
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: USERS_KEY,
    Body: JSON.stringify(users, null, 2),
    ContentType: 'application/json'
  })
  await s3Client.send(command)
}

// helper to convert stream to string
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  })
}

module.exports = { loadUsers, saveUsers }