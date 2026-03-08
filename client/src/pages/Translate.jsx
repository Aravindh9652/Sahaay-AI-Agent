import React, {useState, useRef, useEffect, useCallback} from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { getApiBaseUrl } from '../utils/apiConfig'

const languages = [
  {code: 'en', name: 'English'},
  {code: 'hi', name: 'हिंदी (Hindi)'},
  {code: 'ta', name: 'Tamil'},
  {code: 'te', name: 'Telugu'},
  {code: 'bn', name: 'Bengali'}
]

export default function Translate(){
  const { t } = useLanguage()
  const [text, setText] = useState('')
  const [target, setTarget] = useState('hi')
  const [source, setSource] = useState('auto')

  const [result, setResult] = useState('')
  const [detected, setDetected] = useState('')
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const browserSpeechRef = useRef(null)
  const [useBrowserSpeech, setUseBrowserSpeech] = useState(true)
  const [micAvailable, setMicAvailable] = useState(false)

  // Setup browser speech - moved to startVoice for better control
  // (keeping this commented for reference)
  // const setupBrowserSpeech = useCallback(() => { ... }, [source])

  // Initialize MediaRecorder on component mount
  useEffect(() => {
    const initMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
        
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        setMicAvailable(true);
        setUseBrowserSpeech(false); // Use MediaRecorder if available
        
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        }
        
        mr.onstop = async () => {
          try {
            console.log('Recording stopped. Audio chunks count:', audioChunksRef.current.length);
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            console.log('Blob size:', blob.size, 'bytes');
            audioChunksRef.current = [];
            
            if (blob.size === 0) {
              console.warn('No audio data recorded!');
              alert('No audio recorded. Please try again and speak clearly.');
              return;
            }
            
            const base64 = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(',')[1]);
              reader.readAsDataURL(blob);
            });
            
            console.log('Base64 audio length:', base64.length);
            console.log('Sending audio to server...');
            setLoading(true);
            
            const resp = await fetch('/api/translate/speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64, language: source })
            });
            
            console.log('Response status:', resp.status);
            const data = await resp.json();
            console.log('Response data:', data);
            setLoading(false);
            
            if (data.transcript) {
              console.log('✓ Transcription result:', data.transcript);
              setText(data.transcript);
            } else if (data.error) {
              console.error('✗ Server error:', data.error);
              alert('Transcription failed: ' + data.error);
            }
          } catch (err) {
            setLoading(false);
            console.error('✗ Server request failed:', err.message);
            // Fallback to browser speech for next attempt
            alert('Server transcription unavailable. Please ensure the backend is running.\n\nUsing browser speech recognition instead.');
            setUseBrowserSpeech(true);
          }
        }
      } catch (err) {
        console.warn('Microphone not available, using browser speech recognition:', err.message);
        setMicAvailable(false);
        setUseBrowserSpeech(true);
      }
    }
    
    initMicrophone();
  }, [])

  const startVoice = async () => {
    const langMap = { en: 'English', hi: 'हिंदी (Hindi)', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', auto: 'Auto-detect' };
    const selectedLang = langMap[source] || 'English';
    
    console.log(`🎤 SPEAK button clicked - Recognizing in: ${selectedLang}`);
    
    // Create recognition with current language
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;  // Show real-time results
    
    // Set language correctly with all supported languages
    const langCodeMap = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', auto: 'en-US' };
    recognition.lang = langCodeMap[source] || 'en-US';
    
    // For non-English languages, provide better support
    if (source !== 'en' && source !== 'auto') {
      recognition.maxAlternatives = 5;  // Get multiple alternatives for better accuracy
    }
    
    console.log(`🎤 Language set to: ${recognition.lang}`);
    console.log(`🎤 Please speak in: ${selectedLang}`);
    
    recognition.onstart = () => {
      console.log(`✓ Listening for ${selectedLang}...`);
      setRecording(true);
    }
    
    recognition.onend = () => {
      console.log('✓ Recording ended');
      setRecording(false);
      // Also stop MediaRecorder when speech recognition ends
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        console.log('⏹ MediaRecorder auto-stopped with speech recognition');
      }
    }
    
    recognition.onresult = async (event) => {
      let transcript = '';
      let isFinal = false;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        transcript += transcriptSegment;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }
      
      // Show interim results as user speaks
      if (!isFinal) {
        console.log(`🎤 Interim (${selectedLang}): ${transcript}`);
      } else {
        console.log(`✓ Final recognized (${selectedLang}): ${transcript}`);
        
        // AUTO-DETECT language if source is 'auto' (not selected)
        if (source === 'auto' || !source) {
          console.log(`🔍 Auto-detecting language from text...`);
          try {
            const detectRes = await fetch('http://localhost:5000/api/translate/detect-language', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: transcript })
            });
            const detectData = await detectRes.json();
            const detectedLang = detectData.language || 'en';
            
            console.log(`✓ Auto-detected language: ${detectedLang} (Method: ${detectData.method})`);
            
            // If detected language is not English, transliterate romanized text
            if (detectedLang !== 'en' && /^[a-zA-Z\s]+$/.test(transcript)) {
              console.log(`🔄 Transliterating romanized text to ${detectedLang} script...`);
              try {
                const translitRes = await fetch('http://localhost:5000/api/translate/transliterate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: transcript, language: detectedLang })
                });
                const translitData = await translitRes.json();
                if (translitData.transliterated) {
                  console.log(`✓ Transliterated: "${translitData.transliterated}"`);
                  transcript = translitData.transliterated;
                }
              } catch (err) {
                console.warn(`⚠ Transliteration failed: ${err.message}`);
              }
            }
          } catch (err) {
            console.warn(`⚠ Language detection failed: ${err.message}, defaulting to English`);
          }
        } 
        // If language is selected and not English, transliterate romanized text to native script
        else if (source !== 'en' && /^[a-zA-Z\s]+$/.test(transcript)) {
          console.log(`🔄 Transliterating romanized text to ${selectedLang} script...`);
          try {
            const translitRes = await fetch('http://localhost:5000/api/translate/transliterate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: transcript, language: source })
            });
            const translitData = await translitRes.json();
            if (translitData.transliterated) {
              console.log(`✓ Transliterated to ${selectedLang}: ${translitData.transliterated}`);
              transcript = translitData.transliterated;
            }
          } catch (err) {
            console.warn(`⚠ Transliteration failed: ${err.message}`);
            // Continue with romanized text if transliteration fails
          }
        }
      }
      
      setText(transcript);
    }
    
    recognition.onerror = (event) => {
      console.error(`✗ Error: ${event.error}`);
      setRecording(false);
      if (event.error === 'no-speech') {
        alert(`No speech detected. Please speak in ${selectedLang} clearly and try again.`);
      } else if (event.error === 'network') {
        alert(`Network error. Please check your internet connection.`);
      } else {
        alert(`Speech error: ${event.error}`);
      }
    }
    
    browserSpeechRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
    }

    // Start a fresh MediaRecorder to capture audio for AWS Transcribe
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mr.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(t => t.stop());
        
        const blob = new Blob(chunks, { type: 'audio/webm' });
        console.log('🎤 AWS Transcribe: Audio blob size:', blob.size, 'bytes, chunks:', chunks.length);
        
        if (blob.size < 1000) {
          console.warn('⚠ Audio too small for AWS Transcribe, skipping upload');
          return;
        }
        
        const base64 = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
        
        // Send to server → S3 → AWS Transcribe (background, don't block UI)
        console.log('🎤 Sending audio to AWS Transcribe via S3...');
        fetch('/api/translate/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64, language: source })
        }).then(r => r.json()).then(data => {
          console.log('✓ AWS Transcribe result:', data);
        }).catch(err => {
          console.warn('⚠ AWS Transcribe upload failed:', err.message);
        });
      };
      
      mediaRecorderRef.current = mr;
      mr.start(250); // Capture data every 250ms for reliable audio chunks
      console.log('🎤 MediaRecorder started for AWS Transcribe (250ms timeslice)');
    } catch (err) {
      console.warn('⚠ Could not start MediaRecorder for AWS Transcribe:', err.message);
    }
  }

  const stopVoice = () => {
    console.log('⏹ Stop button clicked');
    if (browserSpeechRef.current) {
      browserSpeechRef.current.stop();
      setRecording(false);
    }
    // Stop MediaRecorder to trigger upload to AWS Transcribe
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('⏹ MediaRecorder stopped - uploading to AWS Transcribe');
    }
  }

  const openKeyboard = () => {
    // open Google Input Tools for the selected source language, default to hindi if auto
    const langMap = { hi: 'hi', ta: 'ta', te: 'te', bn: 'bn', en: 'en' }
    let code = source === 'auto' ? 'en' : (langMap[source] || 'en')
    const url = `https://www.google.com/inputtools/try/?lang=${code}`
    window.open(url, '_blank')
  }

  const translate = async () => {
    if (!text) return
    setLoading(true)
    try {
      const API_BASE_URL = getApiBaseUrl()
      const res = await fetch(`${API_BASE_URL}/api/translate/translate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text, target, source, useAI: true})
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      const data = await res.json()
      
      // Handle the response
      if (data.translated) {
        setResult(data.translated)
        if (data.detected) setDetected(data.detected)
      } else if (data.error) {
        setResult(`Error: ${data.error}`)
      } else {
        setResult(`Could not translate: ${text}`)
      }
    } catch (err) {
      console.error('Translation error:', err)
      setResult(`${text} (${target})`)
    } finally {
      setLoading(false)
    }
  }

  const speakTranslation = () => {
    if (!result) return;
    
    const langMap = {
      'en': 'English',
      'hi': 'Hindi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'bn': 'Bengali'
    };

    console.log(`🔊 Speaking: "${result}" in ${langMap[target]}`);
    
    // Use browser's Web Speech API - this works reliably
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      // Wait a bit for cancel to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(result);
        
        // Language codes for Indian languages
        const langCodes = {
          'en': 'en-US',
          'hi': 'hi-IN',
          'ta': 'ta-IN',
          'te': 'te-IN',
          'bn': 'bn-IN'
        };
        
        utterance.lang = langCodes[target] || 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          console.log(`🔊 Started speaking in ${langMap[target]}`);
        };
        
        utterance.onend = () => {
          console.log(`🔊 Finished speaking`);
        };
        
        utterance.onerror = (event) => {
          console.error('🔊 Speech error:', event.error);
          
          // If language not available, try English as fallback
          if (event.error === 'language-unavailable' && target !== 'en') {
            console.log(`🔊 ${langMap[target]} not available, trying English...`);
            const fallbackUtterance = new SpeechSynthesisUtterance(result);
            fallbackUtterance.lang = 'en-US';
            fallbackUtterance.rate = 0.85;
            window.speechSynthesis.speak(fallbackUtterance);
          }
        };
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
        
      }, 100);
      
    } else {
      alert('🔊 Text-to-speech not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', padding: '20px 0'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '16px',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {t('translateTitle')}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {t('translateSubtitle')}
          </p>
        </div>

        {/* Translation Card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '40px',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          margin: '0 auto 40px auto'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              💬
            </div>
            <h3 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              {t('textTranslation')}
            </h3>
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151'
            }}>
              {t('message')}
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              placeholder="Type in English, हिंदी, தமிழ், తెలుగు, or বাংলা..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                resize: 'vertical',
                transition: 'border-color 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ec4899'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <div style={{display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center'}}>
              <button
                className={`btn ${recording ? 'btn-primary' : 'btn-secondary'}`}
                onClick={recording ? stopVoice : startVoice}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: recording ? '#ec4899' : '#f3f4f6',
                  color: recording ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {recording ? `🎤 ${t('listening')}` : `🎤 ${t('speak')}`}  {source !== 'auto' && <span style={{marginLeft:'8px',fontSize:'0.9rem',color:'#6b7280'}}>({languages.find(l=>l.code===source)?.name})</span>}
              </button>

              {/* virtual keyboard helper */}
              <button
                onClick={() => openKeyboard()}
                title="Open virtual keyboard for selected language"
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  fontSize: '18px'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#ec4899'}
                onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                ⌨️
              </button>

              <button
                onClick={() => setText('')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#ec4899'}
                onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {t('clear')}
              </button>
            </div>
          </div>

          <div style={{display: 'flex', gap: '12px', alignItems: 'end', marginBottom: '20px'}}>
            <div style={{flex: 1}}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Source
              </label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ec4899'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="auto">Auto-detect</option>
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            <div style={{flex: 1}}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                {t('translateTo')}
              </label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ec4899'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', background: 'linear-gradient(135deg, #f0f9ff, #fdf2f8)', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e7ff'}}>
            <span style={{fontSize: '18px'}}>⚡</span>
            <span style={{fontWeight: '600', color: '#374151', fontSize: '14px'}}>
              Powered by AWS Translate + Nova Lite AI fallback
            </span>
          </div>

          <button
            onClick={translate}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
              opacity: loading || !text ? 0.6 : 1
            }}
            disabled={loading || !text}
            onMouseEnter={(e) => {
              if (!loading && text) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && text) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)'
              }
            }}
          >
            {loading ? t('translating') : t('translate')}
          </button>

          {result && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                color: '#166534',
                fontSize: '1.2rem'
              }}>
                {t('translation')}
              </h4>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '18px',
                color: '#15803d',
                fontWeight: '500',
                lineHeight: '1.5'
              }}>
                {result}
              </p>
              {detected && (
                <p style={{
                  margin: '8px 0 12px 0',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Detected: {detected}
                </p>
              )}
              <button
                onClick={speakTranslation}
                style={{
                  padding: '8px 16px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                🔊 {t('listen')}
              </button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'
          }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                💬
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {t('languages')}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '0.9rem'
                }}>
                  {languages.map(l => l.name).join(', ')}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)'
            e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'
          }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ✓
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {t('features')}
                </h3>
                <ul style={{
                  color: '#6b7280',
                  paddingLeft: '20px',
                  margin: '8px 0 0 0',
                  lineHeight: '1.6'
                }}>
                  <li>Voice input & output</li>
                  <li>Low-bandwidth mode</li>
                  <li>Offline dictionary</li>
                  <li>Literacy-friendly UI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
