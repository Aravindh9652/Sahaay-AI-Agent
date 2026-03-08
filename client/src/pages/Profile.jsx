import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function Profile({ setUser }){
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [savedItems, setSavedItems] = useState({ market: [], education: [], civic: [] })
  const [savedView, setSavedView] = useState('all')
  const [showSavedItems, setShowSavedItems] = useState(false)

  const marketMap = {
    1: 'Junior Developer',
    2: 'Content Writing Intern',
    3: 'Women Entrepreneurship Expo',
    4: 'Tech Education Grant',
    5: 'Digital Marketing Executive',
    6: 'UI/UX Design Internship',
    7: 'Agriculture Startup Support',
    8: 'Data Science Program'
  }

  const educationMap = {
    1: 'Digital Skills 101',
    2: 'Basic Accounting for Farmers',
    3: 'Safety & Privacy',
    4: 'Market Trends Analysis',
    5: 'Resume Writing',
    6: 'Interview Preparation',
    7: 'E-commerce Basics',
    8: 'Content Creation Masterclass'
  }

  const civicMap = {
    1: 'PM Kisan Samman Nidhi',
    2: 'Ayushman Bharat',
    3: 'Skill India',
    4: 'Swachh Bharat',
    5: 'Startup India',
    6: 'Digital India'
  }

  const mapBookmarkIds = (ids, dictionary, prefix) =>
    (ids || []).map((id) => dictionary[id] || `${prefix} #${id}`)

  useEffect(() => {
    const raw = localStorage.getItem('sahaay_token')
    if (raw) {
      try {
        const u = JSON.parse(raw)
        setName(u.name || '')
        setEmail(u.email || '')

        if (u.token) {
          fetch('/api/auth/bookmarks', {
            headers: { Authorization: `Bearer ${u.token}` }
          })
            .then((res) => res.json())
            .then((data) => {
              if (!data?.bookmarks) return
              setSavedItems({
                market: mapBookmarkIds(data.bookmarks.market, marketMap, 'Reel'),
                education: mapBookmarkIds(data.bookmarks.education, educationMap, 'Course'),
                civic: mapBookmarkIds(data.bookmarks.civic, civicMap, 'Scheme')
              })
            })
            .catch((error) => {
              console.error('Failed to load saved items:', error)
            })
        }
      } catch (e) {}
    }
  }, [])

  const save = (e) => {
    e.preventDefault()
    const raw = localStorage.getItem('sahaay_token')
    let user = raw ? JSON.parse(raw) : {}
    user.name = name
    user.email = email
    localStorage.setItem('sahaay_token', JSON.stringify(user))
    if (setUser) setUser(user)
    setMessage('Saved')
    setTimeout(() => navigate('/dashboard'), 800)
  }

  const allSavedItems = [
    ...savedItems.market.map((item) => `🎬 ${item}`),
    ...savedItems.education.map((item) => `📚 ${item}`),
    ...savedItems.civic.map((item) => `🏛️ ${item}`)
  ]

  const counts = {
    all: allSavedItems.length,
    market: savedItems.market.length,
    education: savedItems.education.length,
    civic: savedItems.civic.length
  }

  return (
    <div className="form-container">
      <div className="card">
        <h2 style={{marginBottom: 24}}>{t('editProfile')}</h2>
        {message && <div style={{marginBottom:12, color:'#059669'}}>{message}</div>}
        <form onSubmit={save}>
          <div className="form-group">
            <label>{t('fullName')}</label>
            <input value={name} onChange={e=>setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t('email')}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">{t('editProfile')}</button>
        </form>

        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowSavedItems((prev) => !prev)}
          >
            {showSavedItems ? 'Hide Saved Items' : `Show Saved Items (${counts.all})`}
          </button>
        </div>

        {showSavedItems && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ marginBottom: 12, color: '#1f2937' }}>Saved Items</h3>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {[
              { key: 'all', label: `Show All (${counts.all})` },
              { key: 'market', label: `Reels (${counts.market})` },
              { key: 'education', label: `Courses (${counts.education})` },
              { key: 'civic', label: `Schemes (${counts.civic})` }
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSavedView(option.key)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  background: savedView === option.key ? '#4f46e5' : '#fff',
                  color: savedView === option.key ? '#fff' : '#334155',
                  fontWeight: 600
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {savedView === 'all' && (
            <div style={{ marginBottom: 12 }}>
              <strong>All Saved Things</strong>
              {allSavedItems.length === 0 ? (
                <p style={{ margin: '6px 0 0 0', color: '#6b7280' }}>No saved items yet.</p>
              ) : (
                <ul style={{ marginTop: 6 }}>
                  {allSavedItems.map((item, index) => (
                    <li key={`all-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div style={{ marginBottom: 12, display: savedView === 'market' ? 'block' : 'none' }}>
            <strong>🎬 Liked Reels</strong>
            {savedItems.market.length === 0 ? (
              <p style={{ margin: '6px 0 0 0', color: '#6b7280' }}>No saved reels yet.</p>
            ) : (
              <ul style={{ marginTop: 6 }}>
                {savedItems.market.map((item, index) => (
                  <li key={`market-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginBottom: 12, display: savedView === 'education' ? 'block' : 'none' }}>
            <strong>📚 Liked Courses</strong>
            {savedItems.education.length === 0 ? (
              <p style={{ margin: '6px 0 0 0', color: '#6b7280' }}>No saved courses yet.</p>
            ) : (
              <ul style={{ marginTop: 6 }}>
                {savedItems.education.map((item, index) => (
                  <li key={`education-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: savedView === 'civic' ? 'block' : 'none' }}>
            <strong>🏛️ Liked Schemes</strong>
            {savedItems.civic.length === 0 ? (
              <p style={{ margin: '6px 0 0 0', color: '#6b7280' }}>No saved schemes yet.</p>
            ) : (
              <ul style={{ marginTop: 6 }}>
                {savedItems.civic.map((item, index) => (
                  <li key={`civic-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
