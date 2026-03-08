
import React, { useState, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { getApiBaseUrl } from '../utils/apiConfig'

const courses = [
  { id: 1, title: 'Digital Skills 101', category: 'Tech', level: 'Beginner', duration: '3:56:43 Hrs', icon: '💻', color: '#3b82f6', enrolled: 1250, progress: 65, description: 'Master fundamental digital literacy', youtubePlaylistId: 'PLms624yjnnfZJySkguNQUWFfnOcJaz3pf', youtubeUrl: 'https://youtube.com/playlist?list=PLms624yjnnfZJySkguNQUWFfnOcJaz3pf&si=Wrv-J0ySbjwRGayq' },
  { id: 2, title: 'Basic Accounting for Farmers', category: 'Business', level: 'Intermediate', duration: '6:18:18 Hrs', icon: '📊', color: '#10b981', enrolled: 890, progress: 0, description: 'Financial basics for agricultural entrepreneurs', youtubePlaylistId: 'PLRmZEHdEjVHDZJm2A6FKPVBqZx2iC6YhZ', youtubeUrl: 'https://youtube.com/playlist?list=PLRmZEHdEjVHDZJm2A6FKPVBqZx2iC6YhZ&si=AJrGLXPXTzwfqyMN' },
  { id: 3, title: 'Safety & Privacy', category: 'Tech', level: 'Beginner', duration: '24:28:14 Hrs', icon: '🔒', color: '#f59e0b', enrolled: 2100, progress: 45, description: 'Protect yourself online with best practices', youtubePlaylistId: 'PLyqSpQzTE6M-jkJEzbS5oHJUp2GWPsq6e', youtubeUrl: 'https://youtube.com/playlist?list=PLyqSpQzTE6M-jkJEzbS5oHJUp2GWPsq6e&si=ETQsN0XGvuqRpXki' },
  { id: 4, title: 'Market Trends Analysis', category: 'Business', level: 'Advanced', duration: '30:23:34 Hrs', icon: '📈', color: '#8b5cf6', enrolled: 420, progress: 0, description: 'Analyze market data and make informed decisions', youtubePlaylistId: 'PL_Bj8MwxMrhpVCGjA2wuMjAntQ1lmQYKF', youtubeUrl: 'https://youtube.com/playlist?list=PL_Bj8MwxMrhpVCGjA2wuMjAntQ1lmQYKF&si=8nN_DQp5vGKNvyxo' },
  { id: 5, title: 'Resume Writing', category: 'Career', level: 'Beginner', duration: '0:56:32 Hrs', icon: '📄', color: '#ef4444', enrolled: 1560, progress: 80, description: 'Create a winning professional resume', youtubePlaylistId: 'PLQTtMm0DzuqxNZGVLkPEo64wE5GcN-nUM', youtubeUrl: 'https://youtube.com/playlist?list=PLQTtMm0DzuqxNZGVLkPEo64wE5GcN-nUM&si=8Hohl3NK3tZ1MC_M' },
  { id: 6, title: 'Interview Preparation', category: 'Career', level: 'Intermediate', duration: '6:42:52 Hrs', icon: '🎯', color: '#06b6d4', enrolled: 980, progress: 0, description: 'Ace your next job interview with confidence', youtubePlaylistId: 'PL1LKqasc92SjIGbIVoMOhC26P7OISx4tM', youtubeUrl: 'https://youtube.com/playlist?list=PL1LKqasc92SjIGbIVoMOhC26P7OISx4tM&si=5j93jfHwZQO0Zzr-' },
  { id: 7, title: 'E-commerce Basics', category: 'Business', level: 'Beginner', duration: '26:50:47 Hrs', icon: '🛒', color: '#ec4899', enrolled: 750, progress: 30, description: 'Start your online business journey', youtubePlaylistId: 'PL8SmFe2l7_h2xt07uuVw4USeoT2RgUmpE', youtubeUrl: 'https://youtube.com/playlist?list=PL8SmFe2l7_h2xt07uuVw4USeoT2RgUmpE&si=i0LlcXvkiqp3JaNr' },
  { id: 8, title: 'Content Creation Masterclass', category: 'Tech', level: 'Intermediate', duration: '5:10:53 Hrs', icon: '📸', color: '#14b8a6', enrolled: 650, progress: 0, description: 'Create engaging content for social media', youtubePlaylistId: 'PLW-zSkCnZ-gDgc_YNSC7uCaYNLoMwLPp8', youtubeUrl: 'https://youtube.com/playlist?list=PLW-zSkCnZ-gDgc_YNSC7uCaYNLoMwLPp8&si=zzXJrTZHMi9wY1Kc' }
]

const allResources = [
  { id: 1, type: 'Book', title: 'Digital India Handbook', author: 'Ministry of IT', icon: '📱', color: '#3b82f6', description: 'Digital transformation guide', website: 'https://www.digitalindia.gov.in' },
  { id: 2, type: 'Library', title: 'National Central Library', author: 'Government', icon: '📚', color: '#8b5cf6', hours: '10 AM - 8 PM', description: '2 million books collection', website: 'https://nationallibrary.gov.in' },
  { id: 3, type: 'Learning Center', title: 'IIT Delhi', author: 'Government', icon: '🎓', color: '#3b82f6', courses: 156, description: 'Premier engineering institute', website: 'https://home.iitd.ac.in' },
  { id: 4, type: 'Online Platform', title: 'NPTEL - Free Courses', author: 'IIT Madras', icon: '💻', color: '#667eea', courses: 14000, description: '14000+ engineering courses', website: 'https://nptel.ac.in' },
  { id: 5, type: 'Library', title: 'Agricultural Research Library', author: 'ICAR', icon: '🌾', color: '#10b981', hours: '9 AM - 5 PM', description: 'Agricultural research resources', website: 'https://icar.org.in' },
  { id: 6, type: 'Learning Center', title: 'Skill India Training', author: 'Government', icon: '🛠️', color: '#f59e0b', courses: 89, description: 'Vocational skill training', website: 'https://www.skillindiadigital.gov.in/home' },
  { id: 7, type: 'Library', title: 'Pune Library - Bhandarkar', author: 'Government', icon: '📚', color: '#8b5cf6', hours: '9 AM - 5:30 PM', description: 'Rare books & manuscripts', website: 'https://www.bori.ac.in' },
  { id: 8, type: 'Study Group Center', title: 'Anna Centenary Library', author: 'Government', icon: '👥', color: '#14b8a6', hours: '9 AM - 9 PM', description: 'Public study & research', website: 'https://www.annacentenarylibrary.org' },
  { id: 9, type: 'Online Platform', title: 'Khan Academy India', author: 'Khan Academy', icon: '📱', color: '#06b6d4', description: 'Free educational videos', website: 'https://www.khanacademy.org' },
  { id: 10, type: 'Learning Center', title: 'Mumbai Business Institute', author: 'Private', icon: '🏢', color: '#8b5cf6', courses: 42, description: 'Business education', website: 'https://www.mu.ac.in' },
  { id: 11, type: 'Government Scheme', title: 'PM Skill Development', author: 'Government', icon: '🏛️', color: '#ef4444', description: 'Free skill training', website: 'https://www.msde.gov.in/' },
  { id: 12, type: 'Library', title: 'Ernakulam Public Library OPAC', author: 'Municipal', icon: '📚', color: '#22c55e', hours: '10 AM - 8 PM', description: 'Ancient & digital resources', website: 'http://opac.ernakulampubliclibrary.com/' },
  { id: 13, type: 'Learning Center', title: 'Hyderabad University', author: 'Government', icon: '📚', color: '#667eea', courses: 210, description: 'University library', website: 'https://www.uohyd.ac.in' },
  { id: 14, type: 'Online Platform', title: 'Coursera for Development', author: 'Coursera', icon: '🌐', color: '#667eea', courses: 5000, description: 'Online courses', website: 'https://www.coursera.org' },
  { id: 15, type: 'Study Group Center', title: 'Bangalore Tech Community', author: 'Community', icon: '👥', color: '#667eea', hours: '6 PM - 9 PM', description: 'Tech study groups', website: 'https://www.meetup.com/find/?keywords=bangalore%20tech' }
]

export default function Education(){
  const { t } = useLanguage()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [bookmarked, setBookmarked] = useState({})
  const [hoveredCard, setHoveredCard] = useState(null)
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
          query: `You are SAHAAY AI learning advisor. Answer this education question: ${question}`,
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
        const API_BASE_URL = getApiBaseUrl()
        
        const res = await fetch(`${API_BASE_URL}/api/auth/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok || !data?.bookmarks?.education) return

        const initial = {}
        data.bookmarks.education.forEach((id) => {
          initial[id] = true
        })
        setBookmarked(initial)
      } catch (error) {
        console.error('Failed to load education bookmarks:', error)
      }
    }

    loadBookmarks()
  }, [])

  const filtered = courses.filter(course => {
    const matchesFilter = filter === 'All' || filter === 'Liked' || course.category === filter
    const matchesLiked = filter !== 'Liked' || Boolean(bookmarked[course.id])
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || 
                         course.description.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesLiked && matchesSearch
  })

  const likedCount = courses.filter((course) => bookmarked[course.id]).length

  const toggleBookmark = async (id) => {
    const token = getToken()
    const currentlyLiked = Boolean(bookmarked[id])

    setBookmarked((previous) => ({ ...previous, [id]: !currentlyLiked }))

    if (!token) return

    try {
      const API_BASE_URL = getApiBaseUrl()
      
      const response = await fetch(`${API_BASE_URL}/api/auth/bookmarks`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'education',
          itemId: id,
          action: currentlyLiked ? 'remove' : 'add'
        })
      })

      if (!response.ok) {
        setBookmarked((previous) => ({ ...previous, [id]: currentlyLiked }))
      }
    } catch (error) {
      setBookmarked((previous) => ({ ...previous, [id]: currentlyLiked }))
      console.error('Failed to update education bookmark:', error)
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
      console.error('Failed to log education activity:', error)
    }
  }

  const handleStartCourse = (course) => {
    window.open(course.youtubeUrl, '_blank', 'noopener,noreferrer')
    logActivity({
      type: 'recent_access',
      description: `Started course: ${course.title}`,
      metadata: {
        category: 'education',
        itemId: course.id,
        itemTitle: course.title,
        action: 'start_course'
      }
    })
  }

  const getLevelColor = (level) => {
    switch(level) {
      case 'Beginner': return '#10b981'
      case 'Intermediate': return '#f59e0b'
      case 'Advanced': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const educationStyles = `
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-12px);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', padding: '40px 20px', position: 'relative', overflow: 'hidden'}}>
      <style>{educationStyles}</style>

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

      <div style={{maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1}}>
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
            {filter === 'Liked' ? `❤️ Showing Liked (${likedCount})` : `🤍 Liked Courses (${likedCount})`}
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
             {t('educationTitle') || 'Learning Hub'}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.8'
          }}>
            {t('educationSubtitle') || 'Develop your skills with our comprehensive course library'}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          marginBottom: '40px',
          animation: 'slideInUp 0.6s ease-out 0.2s forwards',
          opacity: 0
        }}>
          <input
            type="text"
            placeholder="🔍 Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '500px',
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

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '40px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'slideInUp 0.6s ease-out 0.3s forwards',
          opacity: 0
        }}>
          {['All', 'Tech', 'Business', 'Career'].map((category, idx) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{
                padding: '11px 24px',
                borderRadius: '12px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: filter === category
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)',
                boxShadow: filter === category ? '0 8px 25px rgba(102,126,234,0.4)' : 'none',
                willChange: 'transform, box-shadow'
              }}
              onMouseEnter={(e) => {
                if (filter !== category) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(255,255,255,0.2)'
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)'
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== category) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {filtered.map((course, index) => (
            <div
              key={course.id}
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
                setHoveredCard(course.id)
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 40px 80px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.6)'
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
              }}
              onMouseLeave={(e) => {
                setHoveredCard(null)
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
                background: `linear-gradient(90deg, ${course.color}, ${course.color}cc)`
              }}></div>

              {/* Header */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', marginTop: '8px'}}>
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1}}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${course.color}20, ${course.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    flexShrink: 0,
                    animation: hoveredCard === course.id ? 'float 0.5s ease-out forwards' : 'none'
                  }}>
                    {course.icon}
                  </div>
                  <div style={{flex: 1}}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      lineHeight: '1.3'
                    }}>
                      {course.title}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      background: `linear-gradient(135deg, ${course.color}15, ${course.color}05)`,
                      color: course.color,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: `1px solid ${course.color}30`
                    }}>
                      {course.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(course.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '22px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.2) rotate(10deg)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) rotate(0deg)'
                  }}
                >
                  {bookmarked[course.id] ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Description */}
              <p style={{
                margin: '0 0 16px 0',
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {course.description}
              </p>

              {/* Meta Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.85rem'}}>
                  <span>👥</span>
                  <span><strong>{course.enrolled}</strong> enrolled</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.85rem'}}>
                  <span>⏱️</span>
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Level & Progress */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <span style={{
                  color: getLevelColor(course.level),
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  background: `${getLevelColor(course.level)}15`,
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  {course.level}
                </span>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleStartCourse(course)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`,
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 8px 25px ${course.color}40`,
                  willChange: 'transform, box-shadow'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = `0 12px 35px ${course.color}60`
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = `0 8px 25px ${course.color}40`
                }}
              >
                Start Learning ▶️
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
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🤔</div>
            <h3 style={{color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px'}}>No courses found</h3>
            <p style={{color: 'rgba(255,255,255,0.9)'}}>
              {filter === 'Liked' ? 'No liked courses yet. Tap the heart icon on any course to save it here.' : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}

        {/* Summary Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid rgba(102, 126, 234, 0.15)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          animation: 'slideInUp 0.8s ease-out 0.5s forwards',
          opacity: 0,
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            🎯 Ready to upskill?
          </h3>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            Choose from The above Courses and start your learning journey today. Each course is designed by industry experts to help you succeed.
          </p>
        </div>

        <div style={{ marginTop: '40px' }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: 'white',
            fontSize: '2rem',
            fontWeight: '800',
            textAlign: 'center'
          }}>
            📚 All Learning Resources
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            {allResources.map((resource, index) => (
              <div
                key={resource.id}
                style={{
                  animation: `scaleIn 0.4s ease-out ${0.04 * index}s forwards`,
                  opacity: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
                  borderRadius: '14px',
                  padding: '18px',
                  border: '1px solid rgba(102,126,234,0.15)',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(resource.website, '_blank', 'noopener,noreferrer')}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: `${resource.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '10px'
                }}>
                  {resource.icon}
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.02rem' }}>
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#1f2937', textDecoration: 'none' }}
                  >
                    {resource.title}
                  </a>
                </h3>
                <p style={{ margin: '0 0 8px 0', color: '#667eea', fontWeight: '600', fontSize: '0.85rem' }}>
                  {resource.type} • {resource.author}
                </p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  {resource.description}
                </p>
                <p style={{ margin: '10px 0 0 0', color: '#667eea', fontSize: '0.82rem', fontWeight: '600' }}>
                  Visit website ↗
                </p>
              </div>
            ))}
          </div>
        </div>
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
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>🤖 AI Learning Advisor</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {chatHistory.length > 0 && <button onClick={() => setChatHistory([])} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}>Clear</button>}
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Powered by Amazon Bedrock</span>
              </div>
            </div>
            <div style={{ padding: '0' }}>
              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '16px 16px 8px' }}>
                {chatHistory.length === 0 && (
                  <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', margin: '20px 0' }}>
                    Ask me about courses, learning paths, or skill recommendations!
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
                    placeholder="e.g. Best courses for data science?"
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
                  {['Best coding courses', 'Resume writing tips', 'Free certifications'].map(q => (
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
