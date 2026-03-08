import React, { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { getApiBaseUrl } from '../utils/apiConfig'

const opportunities = [
  { id: 1, title: 'Junior Developer', company: 'TechStart India', status: 'Open', category: 'Jobs', salary: '₹3-5 LPA', location: 'Bangalore', coords: { lat: 12.9716, lng: 77.5946 }, deadline: 'Mar 25', views: 2450, description: 'Join our growing team as a Junior Developer', icon: '💻', careerUrl: 'https://www.linkedin.com/jobs/search/?keywords=junior%20developer%20bangalore' },
  { id: 2, title: 'Content Writing Intern', company: 'Digital Solutions', status: 'Open', category: 'Internships', salary: 'Paid', location: 'Remote', coords: { lat: 28.6139, lng: 77.2090 }, deadline: 'Mar 20', views: 1820, description: 'Create engaging content for our blog', icon: '✍️', careerUrl: 'https://www.linkedin.com/jobs/search/?keywords=content%20writing%20internship' },
  { id: 3, title: 'Women Entrepreneurship Expo', company: 'Government of India', status: 'ClosingSoon', category: 'Grants', salary: '₹1-5 Lakhs', location: 'New Delhi', coords: { lat: 28.6139, lng: 77.2090 }, deadline: 'Mar 15', views: 5200, description: 'Financial support for women entrepreneurs', icon: '💼', careerUrl: 'https://wep.gov.in/' },
  { id: 4, title: 'Tech Education Grant', company: 'Multiple Partners', status: 'Open', category: 'Scholarships', salary: 'Full Tuition', location: 'India', coords: { lat: 20.5937, lng: 78.9629 }, deadline: 'Mar 29', views: 3150, description: 'Merit-based scholarship for tech education', icon: '🎓', careerUrl: 'https://www.indiascienceandtechnology.gov.in/funding-opportunities/startups/multiplier-grants-scheme-mgs' },
  { id: 5, title: 'Digital Marketing Executive', company: 'E-Commerce Co', status: 'Open', category: 'Jobs', salary: '₹2.5-4 LPA', location: 'Delhi', coords: { lat: 28.7041, lng: 77.1025 }, deadline: 'Mar 23', views: 1950, description: 'Drive digital marketing campaigns', icon: '📱', careerUrl: 'https://www.linkedin.com/jobs/search/?keywords=marketing%20executive%20delhi' },
  { id: 6, title: 'UI/UX Design Internship', company: 'Creative Studios', status: 'Open', category: 'Internships', salary: '₹15k/month', location: 'Mumbai', coords: { lat: 19.0760, lng: 72.8777 }, deadline: 'Mar 22', views: 1340, description: 'Design beautiful user experiences', icon: '🎨', careerUrl: 'https://www.linkedin.com/jobs/search/?keywords=ux%20design%20internship%20mumbai' },
  { id: 7, title: 'Agriculture Startup Support', company: 'Innovation Fund', status: 'ClosingSoon', category: 'Grants', salary: '₹2-10 Lakhs', location: 'Pan India', coords: { lat: 20.5937, lng: 78.9629 }, deadline: 'Mar 14', views: 890, description: 'Support for agricultural technology projects', icon: '🌾', careerUrl: 'https://www.startupindia.gov.in/' },
  { id: 8, title: 'Data Science Program', company: 'Tech Institute', status: 'Open', category: 'Scholarships', salary: 'Certification', location: 'Online', coords: { lat: 28.6139, lng: 77.2090 }, deadline: 'Mar 30', views: 4100, description: 'Industry-recognized data science certification', icon: '📊', careerUrl: 'https://collegevidya.com/university/data-science-tech-institute-online/' }
]

export default function Market(){
  const { t } = useLanguage()
  const [filter, setFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [bookmarked, setBookmarked] = useState({})
  const [viewMode, setViewMode] = useState('grid')
  const [selectedOpp, setSelectedOpp] = useState(null)
  const [aiQuery, setAiQuery] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const chatEndRef = React.useRef(null)

  const getToken = () => {
    try {
      const raw = localStorage.getItem('sahaay_token')
      const parsed = raw ? JSON.parse(raw) : null
      return parsed?.token || null
    } catch {
      return null
    }
  }

  const askAI = async () => {
    if (!aiQuery.trim()) return
    const question = aiQuery.trim()
    setAiQuery('')
    setAiLoading(true)
    setChatHistory(prev => [...prev, { role: 'user', text: question }])
    
    const token = getToken()
    const user = JSON.parse(localStorage.getItem('sahaay_user') || '{}')
    
    try {
      const API_BASE_URL = getApiBaseUrl()
      console.log('[AI] Sending request to:', `${API_BASE_URL}/api/aws/query`)
      
      const res = await fetch(`${API_BASE_URL}/api/aws/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id || 'anonymous',
          query: `You are SAHAAY AI career advisor. Answer this job/career question: ${question}`,
          language: 'en'
        })
      })
      
      console.log('[AI] Response status:', res.status)
      const data = await res.json()
      console.log('[AI] Response data:', data)
      
      const aiResponse = data?.data?.answer || data?.error || 'No response from AI'
      setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }])
    } catch (err) {
      console.error('[AI] Error:', err)
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error connecting to AI. Please try again.' }])
    }
    setAiLoading(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // ...existing code...

  useEffect(() => {
    const loadBookmarks = async () => {
      const token = getToken()
      if (!token) return

      try {
        const res = await fetch('/api/auth/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok || !data?.bookmarks?.market) return

        const initial = {}
        data.bookmarks.market.forEach((id) => {
          initial[id] = true
        })
        setBookmarked(initial)
      } catch (error) {
        console.error('Failed to load market bookmarks:', error)
      }
    }

    loadBookmarks()
  }, [])

  // ...existing code...

  useEffect(() => {
    const loadBookmarks = async () => {
      const token = getToken()
      if (!token) return

      try {
        const API_BASE_URL = getApiBaseUrl()
        
        const res = await fetch(`${API_BASE_URL}/api/auth/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok || !data?.bookmarks?.market) return

        const initial = {}
        data.bookmarks.market.forEach((id) => {
          initial[id] = true
        })
        setBookmarked(initial)
      } catch (error) {
        console.error('Failed to load market bookmarks:', error)
      }
    }

    loadBookmarks()
  }, [])

  const filtered = opportunities.filter(opp => {
    const matchesStatus = filter === 'All' || filter === 'Liked' || opp.status === filter
    const matchesLiked = filter !== 'Liked' || Boolean(bookmarked[opp.id])
    const matchesCategory = categoryFilter === 'All' || opp.category === categoryFilter
    const matchesSearch = opp.title.toLowerCase().includes(search.toLowerCase()) || 
                         opp.company.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesLiked && matchesCategory && matchesSearch
  })

  const likedCount = opportunities.filter((opp) => bookmarked[opp.id]).length

  const toggleBookmark = async (id) => {
    const token = getToken();
    const currentlyLiked = Boolean(bookmarked[id]);

    setBookmarked((previous) => ({ ...previous, [id]: !currentlyLiked }));

    if (!token) return;

    try {
      const API_BASE_URL = getApiBaseUrl()
      
      const response = await fetch(`${API_BASE_URL}/api/auth/bookmarks`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'market',
          itemId: id,
          action: currentlyLiked ? 'remove' : 'add'
        })
      });

      if (!response.ok) {
        setBookmarked((previous) => ({ ...previous, [id]: currentlyLiked }));
      }
    } catch (error) {
      setBookmarked((previous) => ({ ...previous, [id]: currentlyLiked }));
      console.error('Failed to update market bookmark:', error);
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return '#10b981'
      case 'ClosingSoon': return '#f59e0b'
      case 'Closed': return '#6b7280'
      default: return '#667eea'
    }
  }

  const getCategoryIcon = (category) => {
    const icons = { 'Jobs': '💼', 'Internships': '👨‍💼', 'Grants': '💰', 'Scholarships': '🎓' }
    return icons[category] || '📌'
  }

  const marketStyles = `
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

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', padding: '40px 20px', position: 'relative', overflow: 'hidden'}}>
      <style>{marketStyles}</style>

      {/* Floating background elements */}
      <div style={{
        position: 'fixed',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(240,147,251,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '5%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      <div style={{maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1}}>
        <div style={{ position: 'absolute', top: '0', right: '0', zIndex: 2 }}>
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
            {filter === 'Liked' ? `❤️ Showing Liked (${likedCount})` : `🤍 Liked Opportunities (${likedCount})`}
          </button>
        </div>

        {/* Hero Section */}
        <div style={{
          animation: 'slideInDown 0.8s ease-out forwards',
          marginBottom: '40px',
          marginTop: '56px'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
             {t('marketTitle') || 'Opportunities Hub'}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.8'
          }}>
            {t('marketSubtitle') || 'Discover jobs, internships, grants, and scholarships tailored for you'}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          marginBottom: '32px',
          animation: 'slideInUp 0.6s ease-out 0.2s forwards',
          opacity: 0
        }}>
          <input
            type="text"
            placeholder="🔍 Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '600px',
              display: 'block',
              margin: '0 auto',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: '15px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15), 0 10px 30px rgba(0,0,0,0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.3)'
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* Filters Section */}
        <div style={{
          marginBottom: '40px',
          animation: 'slideInUp 0.6s ease-out 0.3s forwards',
          opacity: 0
        }}>
          {/* Status Filter */}
          <div style={{marginBottom: '20px'}}>
            <p style={{color: 'white', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>📊 Status</p>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              {['All', 'Open', 'ClosingSoon'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: filter === status
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: filter === status ? '0 8px 25px rgba(102,126,234,0.4)' : 'none',
                    willChange: 'transform, box-shadow'
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== status) {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 25px rgba(255,255,255,0.2)'
                      e.target.style.borderColor = 'rgba(255,255,255,0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== status) {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                      e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  {status === 'ClosingSoon' ? '⏰ Closing Soon' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <p style={{color: 'white', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>📁 Category</p>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              {['All', 'Jobs', 'Internships', 'Grants', 'Scholarships'].map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: categoryFilter === category
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: categoryFilter === category ? '0 8px 25px rgba(102,126,234,0.4)' : 'none',
                    willChange: 'transform, box-shadow'
                  }}
                  onMouseEnter={(e) => {
                    if (categoryFilter !== category) {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 8px 25px rgba(255,255,255,0.2)'
                      e.target.style.borderColor = 'rgba(255,255,255,0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (categoryFilter !== category) {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = 'none'
                      e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  {getCategoryIcon(category)} {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div style={{
          display: viewMode === 'grid' 
            ? 'grid'
            : 'block',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {filtered.map((opp, index) => (
            <div
              key={opp.id}
              style={{
                animation: `scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 * index}s forwards`,
                opacity: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(102, 126, 234, 0.15)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform, box-shadow, border-color'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 40px 80px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)'
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)'
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.15)'
              }}
            >
              {/* Top colored line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${getStatusColor(opp.status)}, ${getStatusColor(opp.status)}cc)`
              }}></div>

              {/* Header */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', marginTop: '8px'}}>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1}}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #667eea15, #667eea05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    flexShrink: 0
                  }}>
                    {opp.icon}
                  </div>
                  <div style={{flex: 1}}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      lineHeight: '1.3'
                    }}>
                      {opp.title}
                    </h3>
                    <p style={{
                      margin: '0',
                      color: '#6b7280',
                      fontSize: '0.9rem'
                    }}>
                      {opp.company}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(opp.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '22px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.2) rotate(10deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) rotate(0deg)';
                  }}
                >
                  {bookmarked[opp.id] ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Description */}
              <p style={{
                margin: '0 0 16px 0',
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {opp.description}
              </p>

              {/* Meta Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '0.85rem',
                color: '#6b7280'
              }}>
                <span>📍 {opp.location}</span>
                <span>•</span>
                <span>👁️ {opp.views} views</span>
              </div>

              {/* Status & Deadline */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <span style={{
                  color: getStatusColor(opp.status),
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  background: `${getStatusColor(opp.status)}15`,
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  {opp.status === 'ClosingSoon' ? '⏰ ' : '✓ '}{opp.status}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#667eea'
                }}>
                  Closes: {opp.deadline}
                </span>
              </div>

              {/* Salary/Prize */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea15, #667eea05)',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  Expected
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {opp.salary}
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setSelectedOpp(opp)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 25px rgba(102,126,234,0.4)',
                  willChange: 'transform, box-shadow'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(102,126,234,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 25px rgba(102,126,234,0.4)'
                }}
              >
                Learn More & Apply →
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            animation: 'fadeIn 0.6s ease-out forwards'
          }}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🔍</div>
            <h3 style={{color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px'}}>No opportunities found</h3>
            <p style={{color: 'rgba(255,255,255,0.9)'}}>
              {filter === 'Liked' ? 'No liked opportunities yet. Tap the heart icon on any item to save it here.' : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }} onClick={() => setSelectedOpp(null)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            animation: 'scaleIn 0.3s ease-out',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedOpp(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(102, 126, 234, 0.2)'
                e.target.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(102, 126, 234, 0.1)'
                e.target.style.transform = 'scale(1)'
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea20, #667eea10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {selectedOpp.icon}
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: '800', color: '#1f2937' }}>
                  {selectedOpp.title}
                </h2>
                <p style={{ margin: 0, color: '#667eea', fontWeight: '600' }}>
                  {selectedOpp.company}
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

            {/* Category & Location */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: '#667eea15',
                color: '#667eea',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {getCategoryIcon(selectedOpp.category)} {selectedOpp.category}
              </span>
              <span style={{
                background: getStatusColor(selectedOpp.status) + '15',
                color: getStatusColor(selectedOpp.status),
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {selectedOpp.status === 'ClosingSoon' ? '⏰ ' : '✓ '}{selectedOpp.status}
              </span>
              <span style={{
                background: '#6b728015',
                color: '#6b7280',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                📍 {selectedOpp.location}
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#667eea', marginTop: 0, marginBottom: '12px' }}>About This Opportunity</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.8', margin: 0 }}>
                {selectedOpp.description}
              </p>
            </div>

            {/* Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div>
                <strong style={{ color: '#6b7280', fontSize: '0.85rem' }}>Expected Salary/Prize</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#667eea' }}>
                  {selectedOpp.salary}
                </p>
              </div>
              <div>
                <strong style={{ color: '#6b7280', fontSize: '0.85rem' }}>Deadline</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#667eea' }}>
                  {selectedOpp.deadline}
                </p>
              </div>
              <div>
                <strong style={{ color: '#6b7280', fontSize: '0.85rem' }}>Views</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#667eea' }}>
                  {selectedOpp.views.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Location Map */}
            {selectedOpp.location !== 'Online' && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#667eea', marginTop: 0, marginBottom: '12px' }}>📍 Location</h3>
                <div style={{
                  width: '100%',
                  height: '250px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb'
                }}>
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(selectedOpp.location)}&output=embed`}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <a 
                  href={`https://www.google.com/maps/?q=${encodeURIComponent(selectedOpp.location)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '12px',
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: '600',
                    padding: '8px 12px',
                    background: '#667eea15',
                    borderRadius: '6px',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea25'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#667eea15'
                  }}
                >
                  🗺️ Open in Google Maps
                </a>
              </div>
            )}

            {/* Apply Button */}
            <a href={selectedOpp.careerUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
              <button
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 8px 25px rgba(102,126,234,0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(102,126,234,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 25px rgba(102,126,234,0.4)'
                }}
              >
                🚀 Apply Now on {selectedOpp.company} Website
              </button>
            </a>
          </div>
        </div>
      )}

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
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>🤖 AI Career Advisor</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {chatHistory.length > 0 && <button onClick={() => setChatHistory([])} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}>Clear</button>}
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Powered by Amazon Bedrock</span>
              </div>
            </div>
            <div style={{ padding: '0' }}>
              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '16px 16px 8px' }}>
                {chatHistory.length === 0 && (
                  <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', margin: '20px 0' }}>
                    Ask me about jobs, internships, grants, or career advice!
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
                    placeholder="e.g. How to prepare for tech interviews?"
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
                  {['Interview tips', 'Scholarship eligibility', 'Remote jobs India'].map(q => (
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
    </div>
  )
}
