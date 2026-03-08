/**
 * Transliteration Service
 * Converts romanized Indian text back to native scripts (Hindi, Tamil, Telugu, Bengali)
 */

// Romanized to Telugu mapping
const teleguRomanizedMap = {
  // Common Telugu words and phrases
  'naa': 'నా',
  'na': 'న',
  'peru': 'పేరు',
  'pru': 'పేరు',
  'aravind': 'అరవింద్',
  'aravindh': 'అరవింద్',
  'name': 'పేరు',
  'my name': 'నా పేరు',
  'hello': 'హలో',
  'namaste': 'నమస్కారం',
  'thank you': 'ధన్యవాదాలు',
  'thanks': 'ధన్యవాదాలు',
  'yes': 'అవును',
  'no': 'లేదు',
  'how are you': 'మీరు ఎలా ఉన్నారు',
  'good morning': 'శుభోదయం',
  'good night': 'శుభ రాత్రి',
  'bye': 'బై',
  'ok': 'సరే',
  'okay': 'సరే',
  'please': 'దయచేసి',
  'sorry': 'క్షమించండి',
  'water': 'నీరు',
  'food': 'ఆహారం',
  'help': 'సహాయం',
};

// Romanized to Tamil mapping
const tamilRomanizedMap = {
  'en peyar': 'என் பெயர்',
  'en peyadhai': 'என் பெயர்',
  'naan': 'நான்',
  'vandakkam': 'வணக்கம்',
  'vanakkam': 'வணக்கம்',
  'thank you': 'நன்றி',
  'thanks': 'நன்றி',
  'yes': 'ஆம்',
  'no': 'இல்லை',
  'good morning': 'காலைநலம்',
  'good night': 'இரவு வணக்கம்',
  'bye': 'பிறகு சந்திப்போம்',
  'ok': 'சரி',
  'okay': 'சரி',
  'please': 'தயவுசெய்து',
  'sorry': 'மன்னிக்கவும்',
  'water': 'நீர்',
  'food': 'உணவு',
  'help': 'உதவி',
};

// Romanized to Bengali mapping
const bengaliRomanizedMap = {
  'amar nam': 'আমার নাম',
  'aami': 'আমি',
  'salaam': 'সালাম',
  'hello': 'হ্যালো',
  'thank you': 'ধন্যবাদ',
  'thanks': 'ধন্যবাদ',
  'yes': 'হ্যাঁ',
  'no': 'না',
  'good morning': 'শুভ সকাল',
  'good night': 'শুভ রাত্রি',
  'bye': 'বিদায়',
  'ok': 'ঠিক আছে',
  'okay': 'ঠিক আছে',
  'please': 'অনুগ্রহ করে',
  'sorry': 'দুঃখিত',
  'water': 'পানি',
  'food': 'খাবার',
  'help': 'সাহায্য',
};

// Romanized to Hindi mapping
const hindiRomanizedMap = {
  'mera naam': 'मेरा नाम',
  'main': 'मैं',
  'namaste': 'नमस्ते',
  'hello': 'नमस्ते',
  'thank you': 'धन्यवाद',
  'thanks': 'धन्यवाद',
  'yes': 'हाँ',
  'haan': 'हाँ',
  'no': 'नहीं',
  'good morning': 'सुप्रभात',
  'good night': 'शुभ रात्रि',
  'bye': 'अलविदा',
  'ok': 'ठीक है',
  'okay': 'ठीक है',
  'please': 'कृपया',
  'sorry': 'माफ करें',
  'water': 'पानी',
  'food': 'खाना',
  'help': 'मदद',
};

function transliterateRomanized(text, targetLanguage) {
  if (!text) return text;

  const lowerText = text.toLowerCase().trim();
  let romanizedMap = {};

  // Select appropriate mapping based on target language
  if (targetLanguage === 'te') {
    romanizedMap = teleguRomanizedMap;
  } else if (targetLanguage === 'ta') {
    romanizedMap = tamilRomanizedMap;
  } else if (targetLanguage === 'bn') {
    romanizedMap = bengaliRomanizedMap;
  } else if (targetLanguage === 'hi') {
    romanizedMap = hindiRomanizedMap;
  }

  if (Object.keys(romanizedMap).length === 0) {
    return text; // No transliteration available
  }

  // Sort by length (longest matches first) to avoid partial replacements
  const sortedKeys = Object.keys(romanizedMap).sort((a, b) => b.length - a.length);

  let result = text;
  let found = false;

  // Try to find and replace romanized phrases
  for (const romanized of sortedKeys) {
    const regex = new RegExp(`\\b${romanized}\\b`, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, romanizedMap[romanized]);
      found = true;
    }
  }

  console.log(`[Transliteration] "${text}" -> "${result}" (${targetLanguage})`);
  return found ? result : text;
}

module.exports = {
  transliterateRomanized,
};
