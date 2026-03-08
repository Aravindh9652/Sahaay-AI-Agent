// Mock transcription service for local testing
// This provides a quick transcription using common words/patterns

const commonWords = {
  en: ['hello', 'hi', 'hey', 'yes', 'no', 'thank', 'thanks', 'please', 'sorry', 'what', 'how', 'where', 'when', 'who', 'why', 'okay', 'ok', 'understood'],
  hi: ['नमस्ते', 'हाँ', 'नहीं', 'धन्यवाद', 'कृपया', 'क्षमा', 'क्या', 'कैसे', 'कहाँ', 'कब', 'कौन', 'ठीक'],
  ta: ['vanakkam', 'ayya', 'illai', 'nandri', 'thayavukkal', 'enna', 'eppadi', 'yethu', 'yethi', 'yaar'],
  te: ['namaskaram', 'avuna', 'ledu', 'dhanyavadamulu', 'kshaminchandi', 'endi', 'ekkada', 'eppudu', 'yari'],
  bn: ['nomoshkar', 'hya', 'na', 'dhonnobad', 'onugroho', 'ke', 'kathe', 'kothay', 'kkhon', 'ke']
};

async function mockTranscribeAudio(base64Data, language) {
  // Simulate some processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a simple test transcript
  const langCode = language === 'auto' ? 'en' : language;
  const words = commonWords[langCode] || commonWords['en'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  
  // Return detected speech (for testing purposes)
  return `*Audio received* (${Math.random().toString(36).substring(7).toUpperCase()}) - Please speak clearly for better recognition`;
}

module.exports = {
  mockTranscribeAudio
};
