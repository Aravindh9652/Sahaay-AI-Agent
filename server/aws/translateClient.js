/**
 * AWS Translate Client
 * Handles multilingual translation using Amazon Translate service
 * Supports bidirectional translation: Hindi, Tamil, Telugu, Bengali, English
 */

const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate')
const { logTranslateOperation } = require('./cloudwatchLogger')

// Initialize AWS Translate client
const translateClient = new TranslateClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

/**
 * Language code mappings for AWS Translate
 * AWS uses specific language codes; map local codes to AWS codes
 */
const languageCodeMap = {
  'en': 'en',
  'hi': 'hi',
  'ta': 'ta',
  'te': 'te',
  'bn': 'bn'
}

/**
 * Detect language of input text
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} - Language code
 */
async function detectLanguage(text) {
  try {
    const { ComprehendClient, DetectDominantLanguageCommand } = require('@aws-sdk/client-comprehend')
    const comprehend = new ComprehendClient({ region: process.env.AWS_REGION || 'us-east-1' })
    
    const cmd = new DetectDominantLanguageCommand({ Text: text })
    const result = await comprehend.send(cmd)
    
    const language = result.Languages?.[0]?.LanguageCode || 'en'
    console.log(`[Translate] Detected language: ${language}`)
    return language
  } catch (err) {
    console.warn('[Translate] Language detection failed, defaulting to English:', err.message)
    return 'en'
  }
}

/**
 * Translate text using AWS Translate
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code (en, hi, ta, te, bn)
 * @param {string} sourceLanguage - Source language code (optional, auto-detect if not provided)
 * @returns {Promise<Object>} - {translated, sourceLanguage, targetLanguage}
 */
async function translateText(text, targetLanguage, sourceLanguage = 'auto') {
  try {
    if (!text || !targetLanguage) {
      throw new Error('Missing required parameters: text and targetLanguage')
    }

    let detectedSource = sourceLanguage
    
    // Auto-detect source language if not provided
    if (sourceLanguage === 'auto' || sourceLanguage === 'Auto-detect') {
      detectedSource = await detectLanguage(text)
    }

    // Map language codes to AWS format
    const awsSource = languageCodeMap[detectedSource] || detectedSource
    const awsTarget = languageCodeMap[targetLanguage] || targetLanguage

    // Don't translate if source and target are the same
    if (awsSource === awsTarget) {
      console.log(`[Translate] Source and target languages are the same, returning original text`)
      return { translated: text, sourceLanguage: awsSource, targetLanguage: awsTarget }
    }

    console.log(`[Translate] Translating from ${awsSource} to ${awsTarget}: "${text.substring(0, 50)}..."`)

    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: awsSource,
      TargetLanguageCode: awsTarget
    })

    const response = await translateClient.send(command)
    const translated = response.TranslatedText

    console.log(`[Translate] Success: "${translated}"`)
    
    // Log to CloudWatch
    logTranslateOperation(text, awsSource, awsTarget, 'aws-translate', 'success')
    
    return { translated, sourceLanguage: awsSource, targetLanguage: awsTarget }

  } catch (err) {
    console.error('[Translate] AWS Translate error:', err.message)
    logTranslateOperation(text, sourceLanguage, targetLanguage, 'aws-translate', 'failed')
    throw new Error(`Translation failed: ${err.message}`)
  }
}

/**
 * Batch translate multiple texts
 * @param {Array<string>} texts - Array of texts to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<Array>} - Array of translated texts
 */
async function translateBatch(texts, targetLanguage) {
  try {
    const results = await Promise.all(
      texts.map(text => translateText(text, targetLanguage))
    )
    return results.map(r => r.translated)
  } catch (err) {
    console.error('[Translate] Batch translation error:', err.message)
    throw err
  }
}

module.exports = {
  translateText,
  translateBatch,
  detectLanguage,
  translateClient
}
