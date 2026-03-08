const express = require('express');
const router = express.Router();
const { mockTranscribeAudio } = require('../services/mockTranscribe');
const { transliterateRomanized } = require('../services/transliterator');
const { logApiCall } = require('../aws/cloudwatchLogger');

// Accept romanized text and transliterate to native script
router.post('/transliterate', async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    if (!language) return res.status(400).json({ error: 'No language provided' });
    
    console.log(`[Transliterate] Input: "${text}", Language: ${language}`);
    
    // Transliterate romanized text to native script
    const transliterated = transliterateRomanized(text, language);
    
    res.json({ 
      original: text,
      transliterated: transliterated,
      language: language
    });
    logApiCall('/api/translate/transliterate', 'POST', 'success', 0, null);
  } catch (err) {
    console.error('[Transliterate] Error:', err.message);
    logApiCall('/api/translate/transliterate', 'POST', 'failed', 0, null);
    res.status(500).json({ error: err.message });
  }
});

// accept JSON { audio: '<base64>', language: 'hi' }
router.post('/speech', async (req, res) => {
  try {
    const { audio, language } = req.body;
    if (!audio) return res.status(400).json({ error: 'No audio provided' });
    
    console.log(`[Speech] Received audio (${audio.length} bytes) for language: ${language}`);
    
    // Try AWS Transcribe first
    let transcript;
    let provider = 'aws';
    
    try {
      const { transcribeAudio } = require('../aws/transcribeClient');
      transcript = await transcribeAudio(audio, language);
      console.log(`[Speech] AWS Transcribe successful: "${transcript}"`);
    } catch (awsErr) {
      console.warn(`[Speech] AWS Transcribe failed (${awsErr.message}), using mock transcription`);
      provider = 'mock';
      // Fallback to mock transcription for testing
      transcript = await mockTranscribeAudio(audio, language);
    }
    
    res.json({ transcript, provider });
    logApiCall('/api/translate/speech', 'POST', 'success', 0, null);
  } catch (err) {
    console.error('[Speech] Critical error:', err.message);
    logApiCall('/api/translate/speech', 'POST', 'failed', 0, null);
    res.status(500).json({ error: err.message });
  }
});

// Detect language from text (AUTO-DETECTION)
router.post('/detect-language', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    
    console.log(`[Language Detection] Detecting language for: "${text}"`);
    
    const franc = require('franc-min');
    
    // First, check if text contains native script characters (native Indian scripts)
    const nativeScriptPatterns = {
      'hi': /[\u0900-\u097F]/,  // Devanagari (Hindi)
      'ta': /[\u0B80-\u0BFF]/,  // Tamil
      'te': /[\u0C00-\u0C7F]/,  // Telugu
      'bn': /[\u0980-\u09FF]/,  // Bengali
    };
    
    for (const [lang, pattern] of Object.entries(nativeScriptPatterns)) {
      if (pattern.test(text)) {
        console.log(`[Language Detection] Detected native script for: ${lang}`);
        return res.json({ language: lang, method: 'native-script' });
      }
    }
    
    // If no native script found, use franc for romanized text detection
    const detectedLang = franc(text);
    
    // Map franc language codes to our language codes
    const langMap = {
      'eng': 'en',
      'hin': 'hi',
      'tam': 'ta',
      'tel': 'te',
      'ben': 'bn'
    };
    
    const mappedLang = langMap[detectedLang] || detectedLang;
    
    console.log(`[Language Detection] Detected by franc: ${detectedLang} -> ${mappedLang}`);
    
    // Additional: Check for common romanized patterns for Indian languages
    const romanizedPatterns = {
      'hi': /\b(naa|mera|hai|hoon|aap|kya|kaise|shukriya|dhanyavaad)\b/i,
      'ta': /\b(en|naan|anna|amma|peyar|yaar|solli|sollren|parunga)\b/i,
      'te': /\b(naa|peru|emandi|cheppu|bagunnaru|meeku|memu|vokkade)\b/i,
      'bn': /\b(amar|tomar|naam|tumi|ami|ache|ki|ekhan|kemon)\b/i,
    };
    
    // Check for romanized patterns
    for (const [lang, pattern] of Object.entries(romanizedPatterns)) {
      if (pattern.test(text)) {
        console.log(`[Language Detection] Detected romanized pattern for: ${lang}`);
        return res.json({ language: lang, method: 'romanized-pattern' });
      }
    }
    
    console.log(`[Language Detection] Using franc detection: ${mappedLang}`);
    res.json({
      language: mappedLang,
      langCode: detectedLang,
      method: 'franc',
      confidence: 'medium'
    });
  } catch (err) {
    console.error('[Language Detection] Error:', err.message);
    // Default to English if detection fails
    res.json({ language: 'en', error: err.message, method: 'fallback' });
  }
});

module.exports = router;
