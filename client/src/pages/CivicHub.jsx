import React, { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

// Mock government schemes database with verified apply URLs
const civicInitiatives = [
  {
    id: 1,
    name: 'PM Kisan Samman Nidhi',
    category: 'Agriculture',
    icon: '🌾',
    color: '#10b981',
    status: 'Active',
    beneficiaries: '12.5 Crore',
    amount: '₹2000/month',
    description: 'Direct income support to farmer families',
    eligibility: 'Farmers with landholding up to 2 hectares',
    benefits: 'Quarterly cash transfer of ₹2000',
    applyUrl: 'https://pmkisan.gov.in/'
  },
  {
    id: 2,
    name: 'Ayushman Bharat',
    category: 'Healthcare',
    icon: '🏥',
    color: '#ef4444',
    status: 'Active',
    beneficiaries: '50+ Crore',
    amount: '₹5 Lakhs/year',
    description: 'Health insurance for vulnerable families',
    eligibility: 'Families below certain income threshold',
    benefits: 'Free hospitalization up to ₹5 lakhs',
    applyUrl: 'https://abdm.gov.in/'
  },
  {
    id: 3,
    name: 'Skill India',
    category: 'Education',
    icon: '📚',
    color: '#3b82f6',
    status: 'Active',
    beneficiaries: '40 Lakhs',
    amount: 'Free Training',
    description: 'Vocational training and skill development',
    eligibility: 'Youth aged 15-45 years',
    benefits: 'Free skill training in various trades',
    applyUrl: 'https://www.skillindiadigital.gov.in/'
  },
  {
    id: 4,
    name: 'Swachh Bharat',
    category: 'Infrastructure',
    icon: '🧹',
    color: '#f59e0b',
    status: 'Active',
    beneficiaries: '110 Crore',
    amount: 'Varies',
    description: 'Sanitation and clean water initiatives',
    eligibility: 'All households and public spaces',
    benefits: 'Improved sanitation infrastructure',
    applyUrl: 'https://swachhbharatmission.ddws.gov.in/'
  },
  {
    id: 5,
    name: 'Startup India',
    category: 'Business',
    icon: '🚀',
    color: '#8b5cf6',
    status: 'Active',
    beneficiaries: '89,000+',
    amount: '₹10k-10Cr',
    description: 'Support for startups and entrepreneurs',
    eligibility: 'Registered Indian startups',
    benefits: 'Funding, tax benefits, and mentorship',
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 6,
    name: 'Digital India',
    category: 'Technology',
    icon: '💻',
    color: '#06b6d4',
    status: 'Active',
    beneficiaries: '500+ Million',
    amount: 'Infrastructure',
    description: 'Digital transformation and connectivity',
    eligibility: 'All citizens and businesses',
    benefits: 'Digital infrastructure and services',
    applyUrl: 'https://www.digitalindia.gov.in/'
  }
]

export default function CivicHub({ user }) {
  const { t, language } = useLanguage()

  const [filter, setFilter] = useState('All')
  const [selectedInitiative, setSelectedInitiative] = useState(null)
  const [bookmarked, setBookmarked] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [aiQuery, setAiQuery] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const chatEndRef = React.useRef(null)

  const askAI = async () => {
    if (!aiQuery.trim()) return
    const question = aiQuery.trim()
    setAiQuery('')
    setAiLoading(true)
    setChatHistory(prev => [...prev, { role: 'user', text: question }])
    try {
      const res = await fetch('/api/test/bedrock?prompt=' + encodeURIComponent(
        `You are SAHAAY AI assistant helping Indian citizens find government schemes. Answer this question concisely in 3-4 sentences: ${question}`
      ))
      const data = await res.json()
      setChatHistory(prev => [...prev, { role: 'ai', text: data.response || data.error || 'No response' }])
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error connecting to AI. Please try again.' }])
    }
    setAiLoading(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const getToken = () => {
    try {
      const raw = localStorage.getItem('sahaay_token')
      const parsed = raw ? JSON.parse(raw) : null
      return parsed?.token || null
    } catch {
      return null
    }
  }

  useEffect(() => {
    const loadBookmarks = async () => {
      const token = getToken()
      if (!token) return

      try {
        const res = await fetch('/api/auth/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok || !data?.bookmarks?.civic) return

        const initial = {}
        data.bookmarks.civic.forEach((id) => {
          initial[id] = true
        })
        setBookmarked(initial)
      } catch (error) {
        console.error('Failed to load civic bookmarks:', error)
      }
    }

    loadBookmarks()
  }, [])

  const getToken = () => {
    try {
      const raw = localStorage.getItem('sahaay_token')
      const parsed = raw ? JSON.parse(raw) : null
      return parsed?.token || null
    } catch {
      return null
    }
  }

  useEffect(() => {
    const loadBookmarks = async () => {
      const token = getToken()
      if (!token) return

      try {
        const res = await fetch('/api/auth/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok || !data?.bookmarks?.civic) return

        const initial = {}
        data.bookmarks.civic.forEach((id) => {
          initial[id] = true
        })
        setBookmarked(initial)
      } catch (error) {
        console.error('Failed to load civic bookmarks:', error)
      }
    }

    loadBookmarks()
  }, [])

  const categories = ['All', ...new Set(civicInitiatives.map(init => init.category))]
  const likedCount = civicInitiatives.filter(init => bookmarked[init.id]).length

  const filtered = civicInitiatives.filter(init => {
    const matchCategory = filter === 'All' || filter === 'Liked' || init.category === filter
    const matchLiked = filter !== 'Liked' || Boolean(bookmarked[init.id])
    const matchSearch = searchQuery === '' || init.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchLiked && matchSearch
  })

  const toggleBookmark = async (id) => {
    const token = getToken()
    const currentlyLiked = Boolean(bookmarked[id])

    setBookmarked((previous) => ({ ...previous, [id]: !currentlyLiked }))

    if (!token) return

    try {
      const response = await fetch('/api/auth/bookmarks', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'civic',
          itemId: id,
          action: currentlyLiked ? 'remove' : 'add'
        })
      })

      if (!response.ok) {
        setBookmarked((previous) => ({ ...previous, [id]: currentlyLiked }))
      }
    } catch (error) {
      setBookmarked((previous) => ({ ...previous, [id]: currentlyLiked }))
      console.error('Failed to update civic bookmark:', error)
    }
  }

  const logActivity = async (payload) => {
    const token = getToken()
    if (!token) return

    try {
      await fetch('/api/auth/activity', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Failed to log civic activity:', error)
    }
  }

  const handleApplyScheme = (initiative) => {
    window.open(initiative.applyUrl, '_blank', 'noopener,noreferrer')
    logActivity({
      type: 'recent_access',
      description: `Applied for scheme: ${initiative.name}`,
      metadata: {
        category: 'civic',
        itemId: initiative.id,
        itemTitle: initiative.name,
        action: 'apply_scheme'
      }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          zIndex: 2
        }}>
          <button
            onClick={() => setFilter(filter === 'Liked' ? 'All' : 'Liked')}
            style={{
              padding: '10px 16px',
              background: filter === 'Liked' ? '#ef4444' : '#fff',
              color: filter === 'Liked' ? 'white' : '#ef4444',
              border: '2px solid #ef4444',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'all 0.3s'
            }}
          >
            {filter === 'Liked' ? `❤️ Showing Liked (${likedCount})` : `🤍 Liked Schemes (${likedCount})`}
          </button>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '50px',
          marginTop: '56px',
          animation: 'slideInDown 0.6s ease-out'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            margin: '0 0 10px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>Government Schemes</h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: '0.95',
            margin: 0
          }}>Discover schemes & benefits tailored for you</p>
        </div>

        {/* Search Section */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#667eea', margin: '0 0 20px 0' }}>🔍 Find Schemes</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Search or browse government schemes that are available for you.
          </p>

          <input
            type="text"
            placeholder="Search for schemes (e.g., 'PM Kisan', 'health insurance')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 15px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem',
              marginBottom: '20px'
            }}
          />
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '10px 20px',
                background: filter === cat ? 'white' : 'rgba(255,255,255,0.2)',
                color: filter === cat ? '#667eea' : 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                fontSize: '0.95rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scheme Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {filtered.map((initiative, idx) => (
            <div
              key={initiative.id}
              onClick={() => setSelectedInitiative(initiative)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '25px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: selectedInitiative?.id === initiative.id ? '0 10px 30px rgba(0,0,0,0.3)' : '0 5px 15px rgba(0,0,0,0.1)',
                transform: selectedInitiative?.id === initiative.id ? 'scale(1.02)' : 'scale(1)',
                borderLeft: `4px solid ${initiative.color}`,
                animation: `slideInUp 0.5s ease-out ${idx * 0.1}s both`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ fontSize: '2.5rem' }}>{initiative.icon}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleBookmark(initiative.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {bookmarked[initiative.id] ? '❤️' : '🤍'}
                </button>
              </div>

              <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                {initiative.name}
              </h3>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <span style={{
                  background: initiative.color + '20',
                  color: initiative.color,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  {initiative.category}
                </span>
                <span style={{
                  background: '#10b98120',
                  color: '#10b981',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  {initiative.status}
                </span>
              </div>

              <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {initiative.description}
              </p>

              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '15px',
                fontSize: '0.9rem'
              }}>
                <div style={{ margin: '8px 0', color: '#666' }}>
                  <strong style={{ color: '#333' }}>Amount:</strong> {initiative.amount}
                </div>
                <div style={{ margin: '8px 0', color: '#666' }}>
                  <strong style={{ color: '#333' }}>Beneficiaries:</strong> {initiative.beneficiaries}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center',
            color: '#555',
            marginBottom: '40px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            {filter === 'Liked'
              ? 'No liked schemes yet. Tap the heart icon on any scheme to save it here.'
              : 'No schemes match your current search/filter.'}
          </div>
        )}

        {/* Detail Modal */}
        {selectedInitiative && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }} onClick={() => setSelectedInitiative(null)}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              animation: 'scaleIn 0.3s ease-out'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.8rem' }}>
                    {selectedInitiative.icon} {selectedInitiative.name}
                  </h2>
                  <p style={{ margin: 0, color: selectedInitiative.color, fontWeight: '600' }}>
                    {selectedInitiative.category}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInitiative(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#667eea', marginTop: 0 }}>Description</h3>
                <p style={{ color: '#666', lineHeight: '1.8' }}>{selectedInitiative.description}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#667eea' }}>Eligibility</h3>
                <p style={{ color: '#666', lineHeight: '1.8' }}>{selectedInitiative.eligibility}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#667eea' }}>Benefits</h3>
                <p style={{ color: '#666', lineHeight: '1.8' }}>{selectedInitiative.benefits}</p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px',
                background: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <div>
                  <strong style={{ color: '#333' }}>Benefit Amount</strong>
                  <p style={{ margin: '5px 0 0 0', color: selectedInitiative.color }}>{selectedInitiative.amount}</p>
                </div>
                <div>
                  <strong style={{ color: '#333' }}>Beneficiaries</strong>
                  <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedInitiative.beneficiaries}</p>
                </div>
              </div>

              <button
                onClick={() => handleApplyScheme(selectedInitiative)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                Apply Now 🔗
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Floating Button & Panel */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
        {showAI && (
          <div style={{
            position: 'absolute', bottom: '70px', right: '0', width: '380px',
            background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden', animation: 'scaleIn 0.3s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '16px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>🤖 AI Scheme Advisor</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {chatHistory.length > 0 && <button onClick={() => setChatHistory([])} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}>Clear</button>}
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Powered by Amazon Bedrock</span>
              </div>
            </div>
            <div style={{ padding: '0' }}>
              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '16px 16px 8px' }}>
                {chatHistory.length === 0 && (
                  <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', margin: '20px 0' }}>
                    Ask me about government schemes, eligibility, or benefits!
                  </p>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      maxWidth: '85%', padding: '10px 14px', borderRadius: '14px',
                      fontSize: '0.85rem', lineHeight: '1.5',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f4ff',
                      color: msg.role === 'user' ? 'white' : '#333',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '14px',
                      borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '14px'
                    }}>
                      {msg.role === 'ai' && <span style={{ fontSize: '0.7rem', color: '#667eea', fontWeight: '600', display: 'block', marginBottom: '4px' }}>🤖 Nova Lite</span>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ background: '#f0f4ff', padding: '10px 14px', borderRadius: '14px', fontSize: '0.85rem', color: '#667eea' }}>
                      🤖 Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: '8px 16px 12px', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text" value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askAI()}
                    placeholder="e.g. Am I eligible for PM-KISAN?"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: '10px',
                      border: '2px solid #e5e7eb', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  <button onClick={askAI} disabled={aiLoading}
                    style={{
                      padding: '10px 16px', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
                      fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem'
                    }}>
                    {aiLoading ? '...' : '→'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['What is PM-KISAN?', 'Healthcare schemes', 'Startup funding'].map(q => (
                    <button key={q} onClick={() => { setAiQuery(q); }} style={{
                      padding: '4px 10px', borderRadius: '8px', border: '1px solid #667eea40',
                      background: '#667eea10', color: '#667eea', fontSize: '0.75rem',
                      cursor: 'pointer', fontWeight: '500'
                    }}>{q}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <button onClick={() => setShowAI(!showAI)} style={{
          padding: showAI ? '0' : '0 18px 0 14px', width: showAI ? '56px' : 'auto', height: '56px',
          borderRadius: showAI ? '50%' : '28px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white', border: 'none', fontSize: showAI ? '24px' : '15px', cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(102,126,234,0.5)', transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          {showAI ? '✕' : <><span style={{ fontSize: '24px' }}>🤖</span> AI Assistant</>}
        </button>
      </div>

      <style>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
