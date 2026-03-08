/**
 * AWS Bedrock Client
 * Handles invocation of Amazon Nova Lite model for generative AI responses
 * Supports multilingual queries for government scheme assistance
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime')
const { logBedrockCall } = require('./cloudwatchLogger')

// Amazon Nova Lite — auto-enabled, no marketplace subscription needed
const DEFAULT_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0'

// Initialize Bedrock runtime client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1'
})

/**
 * Build request body based on model provider
 */
function buildRequestBody(prompt, modelId, temperature, maxTokens) {
  if (modelId.startsWith('anthropic.')) {
    return {
      anthropic_version: 'bedrock-2023-06-01',
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [{ role: 'user', content: prompt }]
    }
  }
  if (modelId.startsWith('amazon.titan')) {
    // Amazon Titan format
    return {
      inputText: prompt,
      textGenerationConfig: { temperature, maxTokenCount: maxTokens }
    }
  }
  // Amazon Nova format
  return {
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { temperature, max_new_tokens: maxTokens }
  }
}

/**
 * Parse response based on model provider
 */
function parseResponse(responseBody, modelId) {
  if (modelId.startsWith('anthropic.')) {
    return responseBody.content?.[0]?.text || ''
  }
  if (modelId.startsWith('amazon.titan')) {
    return responseBody.results?.[0]?.outputText || ''
  }
  // Amazon Nova format
  return responseBody.output?.message?.content?.[0]?.text || ''
}

/**
 * Invoke Bedrock model (supports Amazon Nova and Claude)
 * @param {string} prompt - User query or system prompt
 * @param {Object} options - Model options (temperature, max_tokens, etc.)
 * @returns {Promise<string>} - Generated response text
 */
async function invokeBedrockModel(prompt, options = {}) {
  const startTime = Date.now()
  
  try {
    const {
      temperature = 0.7,
      maxTokens = 1024,
      modelId = DEFAULT_MODEL_ID
    } = options

    const requestBody = buildRequestBody(prompt, modelId, temperature, maxTokens)

    const command = new InvokeModelCommand({
      modelId: modelId,
      body: JSON.stringify(requestBody),
      contentType: 'application/json',
      accept: 'application/json'
    })

    console.log(`[Bedrock] Invoking model: ${modelId}`)
    const response = await bedrockClient.send(command)

    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    const generatedText = parseResponse(responseBody, modelId)
    const responseTime = Date.now() - startTime

    console.log(`[Bedrock] Response received (${generatedText.length} chars)`)
    
    logBedrockCall(prompt.substring(0, 100), modelId, maxTokens, responseTime)
    
    return generatedText

  } catch (error) {
    console.error('[Bedrock] Error invoking model:', error.message)
    const responseTime = Date.now() - startTime
    logBedrockCall(prompt.substring(0, 100), DEFAULT_MODEL_ID, 0, responseTime)
    throw new Error(`Bedrock invocation failed: ${error.message}`)
  }
}

/**
 * Generate context-aware government scheme explanation
 * @param {string} query - User query about schemes
 * @param {string} context - Retrieved scheme information from S3/DynamoDB
 * @returns {Promise<string>} - Generated explanation with steps
 */
async function generateSchemeExplanation(query, context) {
  const systemPrompt = `You are SAHAAY, a multilingual AI assistant helping Indian citizens understand government schemes.

Your task: Explain government schemes clearly, provide eligibility criteria, and step-by-step application guidance.

Context about the scheme:
${context}

Now answer the user's question about the scheme. Be helpful, clear, and action-oriented.`

  return invokeBedrockModel(systemPrompt)
}

/**
 * Recognize user intent from query (understanding what they're looking for)
 * @param {string} query - User's input question
 * @returns {Promise<Object>} - Intent classification: {intent, keywords, language}
 */
async function recognizeIntent(query) {
  const prompt = `Analyze this user query and classify the intent. Respond with JSON only.

Query: "${query}"

Response format (JSON only):
{
  "intent": "one of: scheme_search, eligibility_check, application_help, general_info, complaint",
  "keywords": ["list", "of", "relevant", "keywords"],
  "language": "detected language code (en, hi, ta, te, bn, etc.)",
  "confidence": 0.0 to 1.0
}`

  try {
    const response = await invokeBedrockModel(prompt)
    // Extract JSON from response (Bedrock may include extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: 'general_info', keywords: [], language: 'en', confidence: 0.5 }
  } catch (error) {
    console.error('[Bedrock] Intent recognition failed:', error)
    return { intent: 'general_info', keywords: [], language: 'en', confidence: 0.0 }
  }
}

/**
 * Translate response to target language using Bedrock
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} - Translated text
 */
async function translateWithBedrock(text, targetLanguage) {
  const prompt = `Translate the following text to ${targetLanguage}. Respond with ONLY the translated text, no explanation.

Text: "${text}"`

  return invokeBedrockModel(prompt, { maxTokens: 500 })
}

module.exports = {
  invokeBedrockModel,
  generateSchemeExplanation,
  recognizeIntent,
  translateWithBedrock,
  bedrockClient
}