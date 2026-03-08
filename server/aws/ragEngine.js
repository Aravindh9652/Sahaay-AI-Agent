/**
 * RAG Engine (Retrieval-Augmented Generation)
 * Orchestrates the flow:
 * 1. Retrieve relevant scheme documents from S3
 * 2. Augment userquery with context
 * 3. Generate response using Bedrock
 * 4. Store interaction in DynamoDB
 */

const bedrockClient = require('./bedrockClient')
const { storeQuery, getQueryHistory } = require('./dynamodbClient')
const s3Client = require('./s3Client')

/**
 * Main RAG pipeline for government scheme queries
 * @param {Object} input - {userId, query, language, context}
 * @returns {Promise<Object>} - {answer, sources, queryId}
 */
async function processQuery(input) {
  const { userId, query, language = 'en', context = null } = input

  try {
    console.log(`[RAG] Processing query for user ${userId}: "${query}"`)

    // Step 1: Recognize intent from user query
    console.log('[RAG] Step 1: Intent Recognition')
    let intent = null
    try {
      intent = await bedrockClient.recognizeIntent(query)
      console.log(`[RAG] Intent recognized: ${intent.intent} (confidence: ${intent.confidence})`)
    } catch (error) {
      console.warn('[RAG] Intent recognition failed, treating as general_info')
      intent = { intent: 'general_info', keywords: [], language: language, confidence: 0 }
    }

    // Step 2: Retrieve relevant schemes from S3 based on keywords
    console.log('[RAG] Step 2: Document Retrieval from S3')
    let schemeDocuments = {}
    try {
      if (intent.keywords && intent.keywords.length > 0) {
        // Search for schemes matching the keywords
        const searchPromise = intent.keywords.map(keyword =>
          s3Client.searchSchemesByKeyword(keyword).catch(() => [])
        )
        const searchResults = await Promise.all(searchPromise)
        const uniqueSchemeIds = [...new Set(
          searchResults
            .flat()
            .map(s => s.schemeId)
            .slice(0, 3) // Top 3 results
        )]

        if (uniqueSchemeIds.length > 0) {
          schemeDocuments = await s3Client.getSchemeDocuments(uniqueSchemeIds)
          console.log(`[RAG] Retrieved ${Object.keys(schemeDocuments).length} scheme documents`)
        }
      }
    } catch (error) {
      console.warn('[RAG] Document retrieval partial failure:', error.message)
    }

    // Step 3: Build augmented context
    console.log('[RAG] Step 3: Building Augmented Context')
    const augmentedContext = buildAugmentedContext(query, schemeDocuments, context)
    console.log(`[RAG] Context built (${augmentedContext.length} chars)`)

    // Step 4: Generate response using Bedrock
    console.log('[RAG] Step 4: Generating Response with Bedrock')
    let response = ''
    try {
      response = await bedrockClient.generateSchemeExplanation(query, augmentedContext)
      console.log(`[RAG] Response generated (${response.length} chars)`)
    } catch (error) {
      console.warn('[RAG] Bedrock generation failed:', error.message)
      response = `I apologize, but I couldn't generate a detailed response at this moment. Here's what I know: ${
        augmentedContext.substring(0, 300)
      }...`
    }

    // Step 5: Store interaction in DynamoDB
    console.log('[RAG] Step 5: Storing Interaction in DynamoDB')
    let queryRecord = null
    try {
      queryRecord = await storeQuery(userId, query, response, language)
    } catch (error) {
      console.warn('[RAG] Failed to store query in DynamoDB:', error.message)
    }

    // Step 6: Extract sources (retrieved scheme documents)
    const sources = Object.keys(schemeDocuments)
      .filter(id => schemeDocuments[id] !== null)
      .map(id => ({
        schemeId: id,
        relevance: 'high'
      }))

    const result = {
      answer: response,
      sources: sources,
      queryId: queryRecord?.queryId || null,
      intent: intent.intent,
      language: language,
      timestamp: new Date().toISOString()
    }

    console.log(`[RAG] Query processing complete. Sources: ${sources.length}`)
    return result

  } catch (error) {
    console.error('[RAG] Pipeline error:', error.message)
    throw error
  }
}

/**
 * Build augmented context from retrieved documents
 * Combines user query context with scheme information
 * @param {string} query - User query
 * @param {Object} schemeDocuments - {schemeId: content}
 * @param {string} additionalContext - Extra context (optional)
 * @returns {string} - Formatted context for Bedrock prompt
 */
function buildAugmentedContext(query, schemeDocuments, additionalContext = null) {
  let context = `User Query: "${query}"\n\n`

  if (additionalContext) {
    context += `Additional Context:\n${additionalContext}\n\n`
  }

  context += `Relevant Government Schemes:\n`

  const schemeEntries = Object.entries(schemeDocuments)
    .filter(([, content]) => content !== null)
    .slice(0, 3) // Use top 3 documents

  if (schemeEntries.length === 0) {
    context += 'No specific scheme documents available. Provide general guidance.\n'
  } else {
    schemeEntries.forEach(([schemeId, content]) => {
      // Truncate very long documents to first 500 chars
      const truncated = content.length > 500
        ? content.substring(0, 500) + '...'
        : content

      context += `\n[Scheme: ${schemeId}]\n${truncated}\n`
    })
  }

  return context
}

/**
 * Retrieve user's query history for follow-up conversations
 * Useful for context-aware responses
 * @param {string} userId - User identifier
 * @param {number} limit - Number of previous queries
 * @returns {Promise<Array>} - Query history
 */
async function getUserContext(userId, limit = 5) {
  try {
    const history = await getQueryHistory(userId, limit)
    console.log(`[RAG] Retrieved ${history.length} previous queries for context`)
    return history
  } catch (error) {
    console.warn('[RAG] Failed to retrieve user context:', error.message)
    return []
  }
}

/**
 * Process multilingual query with automatic translation
 * @param {Object} input - {userId, query, targetLanguage}
 * @returns {Promise<Object>} - {answer, sources, originalQuery, translatedQuery}
 */
async function processMultilingualQuery(input) {
  const { userId, query, targetLanguage = 'en' } = input

  try {
    console.log(`[RAG] Processing multilingual query for ${targetLanguage}`)

    // Generate response (and store in original language)
    const result = await processQuery({ userId, query, language: 'auto' })

    // Translate response to target language if needed
    let translatedAnswer = result.answer
    if (targetLanguage !== 'en') {
      try {
        translatedAnswer = await bedrockClient.translateWithBedrock(result.answer, targetLanguage)
        console.log(`[RAG] Response translated to ${targetLanguage}`)
      } catch (error) {
        console.warn(`[RAG] Translation to ${targetLanguage} failed:`, error.message)
      }
    }

    return {
      ...result,
      answer: translatedAnswer,
      targetLanguage: targetLanguage
    }

  } catch (error) {
    console.error('[RAG] Multilingual processing error:', error.message)
    throw error
  }
}

/**
 * Health check for RAG pipeline components
 */
async function healthCheck() {
  console.log('[RAG] Running health check...')
  const checks = {
    s3: await s3Client.checkBucketHealth().catch(() => false),
    bedrock: 'configured', // Would need actual health endpoint
    dynamodb: 'configured'
  }

  const allHealthy = checks.s3 === true

  console.log('[RAG] Health check results:', checks)
  return { healthy: allHealthy, checks }
}

module.exports = {
  processQuery,
  processMultilingualQuery,
  getUserContext,
  buildAugmentedContext,
  healthCheck
}