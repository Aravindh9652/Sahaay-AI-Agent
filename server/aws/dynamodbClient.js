/**
 * AWS DynamoDB Client
 * Handles storing and retrieving user queries, responses, and session data
 * Tables: Users, QueryHistory, SavedSchemes
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb')
const { logDynamoDBOperation } = require('./cloudwatchLogger')

// Initialize DynamoDB client (AWS SDK v3)
const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

// Use DocumentClient for simplified API (automatic JSON conversion)
const docClient = DynamoDBDocumentClient.from(dynamodbClient)

// Table names from environment
const TABLES = {
  QUERIES: process.env.DYNAMODB_QUERIES_TABLE || 'sahaay-queries',
  USERS: process.env.DYNAMODB_USERS_TABLE || 'sahaay-users',
  SAVED_SCHEMES: process.env.DYNAMODB_SAVED_SCHEMES_TABLE || 'sahaay-saved-schemes'
}

/**
 * Store a user query and AI response in DynamoDB
 * @param {string} userId - User identifier
 * @param {string} query - User's question
 * @param {string} response - AI-generated response
 * @param {string} language - Language code (en, hi, ta, etc.)
 * @returns {Promise<Object>} - Stored record with timestamp
 */
async function storeQuery(userId, query, response, language = 'en') {
  try {
    const timestamp = new Date().toISOString()
    const queryId = `${userId}#${Date.now()}`

    const item = {
      queryId,
      userId,
      query,
      response,
      language,
      timestamp,
      ttl: Math.floor(Date.now() / 1000) + 7776000 // 90 days TTL
    }

    await docClient.send(new PutCommand({
      TableName: TABLES.QUERIES,
      Item: item
    }))

    console.log(`[DynamoDB] Stored query: ${queryId}`)
    
    // Log to CloudWatch for AWS Hackathon demo
    logDynamoDBOperation('PutQuery', TABLES.QUERIES, 'success', 1)
    
    return item

  } catch (error) {
    console.error('[DynamoDB] Error storing query:', error.message)
    logDynamoDBOperation('PutQuery', TABLES.QUERIES, 'failed', 0)
    throw error
  }
}

/**
 * Retrieve query history for a user
 * @param {string} userId - User identifier
 * @param {number} limit - Max number of records to retrieve
 * @returns {Promise<Array>} - List of user queries and responses
 */
async function getQueryHistory(userId, limit = 20) {
  try {
    const params = {
      TableName: TABLES.QUERIES,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false, // Reverse chronological order
      Limit: limit
    }

    const result = await docClient.send(new QueryCommand(params))
    const itemCount = result.Items?.length || 0

    console.log(`[DynamoDB] Retrieved ${itemCount} queries for user: ${userId}`)
    
    // Log to CloudWatch for AWS Hackathon demo
    logDynamoDBOperation('QueryHistory', TABLES.QUERIES, 'success', itemCount)
    
    return result.Items || []

  } catch (error) {
    console.error('[DynamoDB] Error retrieving query history:', error.message)
    logDynamoDBOperation('QueryHistory', TABLES.QUERIES, 'failed', 0)
    throw error
  }
}

/**
 * Store user profile/session data
 * @param {string} userId - User identifier
 * @param {Object} userData - User profile data {name, email, language, region}
 * @returns {Promise<Object>} - Stored user record
 */
async function storeUserProfile(userId, userData) {
  try {
    const item = {
      userId,
      ...userData,
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: item
    }))

    console.log(`[DynamoDB] Stored user profile: ${userId}`)
    return item

  } catch (error) {
    console.error('[DynamoDB] Error storing user profile:', error.message)
    throw error
  }
}

/**
 * Retrieve user profile
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} - User profile data
 */
async function getUserProfile(userId) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    }))

    console.log(`[DynamoDB] Retrieved user profile: ${userId}`)
    return result.Item || null

  } catch (error) {
    console.error('[DynamoDB] Error retrieving user profile:', error.message)
    throw error
  }
}

/**
 * Save a government scheme to user's saved list
 * @param {string} userId - User identifier
 * @param {Object} scheme - Scheme object {schemeId, name, description, link}
 * @returns {Promise<Object>} - Saved record
 */
async function saveSchemе(userId, scheme) {
  try {
    const timestamp = new Date().toISOString()
    const savedSchemeId = `${userId}#${scheme.schemeId}`

    const item = {
      savedSchemeId,
      userId,
      schemeId: scheme.schemeId,
      name: scheme.name,
      description: scheme.description,
      link: scheme.link,
      savedAt: timestamp
    }

    await docClient.send(new PutCommand({
      TableName: TABLES.SAVED_SCHEMES,
      Item: item
    }))

    console.log(`[DynamoDB] Saved scheme: ${savedSchemeId}`)
    return item

  } catch (error) {
    console.error('[DynamoDB] Error saving scheme:', error.message)
    throw error
  }
}

/**
 * Retrieve user's saved schemes
 * @param {string} userId - User identifier
 * @returns {Promise<Array>} - List of saved schemes
 */
async function getSavedSchemes(userId) {
  try {
    const params = {
      TableName: TABLES.SAVED_SCHEMES,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await docClient.send(new QueryCommand(params))

    console.log(`[DynamoDB] Retrieved ${result.Items?.length || 0} saved schemes for user: ${userId}`)
    return result.Items || []

  } catch (error) {
    console.error('[DynamoDB] Error retrieving saved schemes:', error.message)
    throw error
  }
}

/**
 * Update user's preferred language
 * @param {string} userId - User identifier
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function updateUserLanguagePreference(userId, language) {
  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: 'SET preferredLanguage = :lang, updatedAt = :now',
      ExpressionAttributeValues: {
        ':lang': language,
        ':now': new Date().toISOString()
      }
    }))

    console.log(`[DynamoDB] Updated language preference for ${userId}: ${language}`)
  } catch (error) {
    console.error('[DynamoDB] Error updating user language:', error.message)
    throw error
  }
}

module.exports = {
  docClient,
  dynamodbClient,
  storeQuery,
  getQueryHistory,
  storeUserProfile,
  getUserProfile,
  saveSchemе,
  getSavedSchemes,
  updateUserLanguagePreference,
  TABLES
}