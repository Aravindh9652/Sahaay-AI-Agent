/**
 * AWS Polly Client for Text-to-Speech
 * Supports Indian languages: Hindi, Tamil, Telugu, Bengali, English
 */

const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly')

// Initialize Polly client
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1'
})

/**
 * Voice mapping for Indian languages
 * Using neural voices for better quality where available
 * Polly supports: English, Hindi natively
 * For Tamil, Telugu, Bengali: Use transliteration to Hindi script + Aditi voice
 */
const VOICE_MAP = {
  'en': { VoiceId: 'Joanna', LanguageCode: 'en-US', Engine: 'neural' },      // English (US female, neural)
  'hi': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' },     // Hindi (female, bilingual)
  'ta': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' },     // Tamil → Hindi voice
  'te': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' },     // Telugu → Hindi voice
  'bn': { VoiceId: 'Aditi', LanguageCode: 'hi-IN', Engine: 'standard' }      // Bengali → Hindi voice
}

/**
 * Generate speech audio from text using AWS Polly
 * @param {string} text - Text to convert to speech
 * @param {string} languageCode - Language code (en, hi, ta, te, bn)
 * @returns {Promise<Buffer>} - Audio data as buffer
 */
async function synthesizeSpeech(text, languageCode = 'en') {
  try {
    const voice = VOICE_MAP[languageCode] || VOICE_MAP['en']
    
    console.log(`[Polly] Synthesizing speech for language: ${languageCode}, voice: ${voice.VoiceId}, engine: ${voice.Engine}`)
    
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voice.VoiceId,
      Engine: voice.Engine,
      LanguageCode: voice.LanguageCode,
      TextType: 'text'
    })
    
    const response = await pollyClient.send(command)
    
    // Convert audio stream to buffer
    const audioStream = response.AudioStream
    const chunks = []
    
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    
    const audioBuffer = Buffer.concat(chunks)
    console.log(`[Polly] Generated audio: ${audioBuffer.length} bytes`)
    
    return audioBuffer
    
  } catch (error) {
    console.error('[Polly] Error synthesizing speech:', error.message)
    throw new Error(`Polly TTS failed: ${error.message}`)
  }
}

module.exports = {
  synthesizeSpeech,
  pollyClient
}
