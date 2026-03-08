const { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')

// Initialize DynamoDB client
const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

const docClient = DynamoDBDocumentClient.from(dynamodbClient)
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'sahaay-users'

/**
 * Find user by email using global secondary index
 */
async function findUserByEmail(email) {
  try {
    console.log(`[DynamoDB] Finding user by email: ${email}`)
    
    const result = await docClient.send(new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      Limit: 1
    }))

    if (result.Items && result.Items.length > 0) {
      console.log(`[DynamoDB] User found: ${email}`)
      return result.Items[0]
    }

    console.log(`[DynamoDB] User not found: ${email}`)
    return null
  } catch (error) {
    console.error('[DynamoDB] Error finding user by email:', error.message)
    throw error
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  try {
    console.log(`[DynamoDB] Getting user by ID: ${userId}`)
    
    const result = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId }
    }))

    if (result.Item) {
      console.log(`[DynamoDB] User found: ${userId}`)
      return result.Item
    }

    console.log(`[DynamoDB] User not found: ${userId}`)
    return null
  } catch (error) {
    console.error('[DynamoDB] Error getting user:', error.message)
    throw error
  }
}

/**
 * Save user (create or update)
 */
async function saveUser(user) {
  try {
    console.log(`[DynamoDB] Saving user: ${user.email}`)
    
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: user
    }))

    console.log(`[DynamoDB] User saved successfully: ${user.email}`)
    return user
  } catch (error) {
    console.error('[DynamoDB] Error saving user:', error.message)
    throw error
  }
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(userId, timestamp) {
  try {
    console.log(`[DynamoDB] Updating last login for: ${userId}`)
    
    await docClient.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET lastLogin = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': timestamp
      }
    }))

    console.log(`[DynamoDB] Last login updated: ${userId}`)
    return true
  } catch (error) {
    console.error('[DynamoDB] Error updating last login:', error.message)
    throw error
  }
}

/**
 * Check if email already exists
 */
async function emailExists(email) {
  try {
    const user = await findUserByEmail(email)
    return user !== null
  } catch (error) {
    console.error('[DynamoDB] Error checking email existence:', error.message)
    throw error
  }
}

module.exports = {
  findUserByEmail,
  getUserById,
  saveUser,
  updateLastLogin,
  emailExists
}
