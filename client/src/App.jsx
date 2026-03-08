import React, {useState, useEffect} from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CivicHub from './pages/CivicHub'
import Education from './pages/Education'
import Market from './pages/Market'
import Translate from './pages/Translate'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AIConsole from './routes/AIConsole'
import './App.css'

function AppContent(){
  const [user, setUser] = useState(null)
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const hideLanguageSelector = location.pathname === '/profile'

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = language
    document.documentElement.dir = ['he', 'ar'].includes(language) ? 'rtl' : 'ltr'
    document.body.lang = language
  }, [language])

  useEffect(() => {
    const stored = localStorage.getItem('sahaay_token')
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        // Immediately set user from stored token (trust it)
        setUser(userData)
        
        // Then verify token is still valid on the server (non-blocking)
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${userData.token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (!(data.ok && data.verified)) {
              // Only clear if verification explicitly fails
              localStorage.removeItem('sahaay_token')
              setUser(null)
            }
          })
          .catch(err => {
            // Don't clear on network errors, just log
            console.warn('Token verification warning:', err.message)
          })
      } catch (err) {
        console.error('Error parsing stored user:', err)
        localStorage.removeItem('sahaay_token')
        setUser(null)
      }
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('sahaay_token')
    setUser(null)
    navigate('/')
  }

  const languages = [
    { code: 'en', name: 'English' }, 
    { code: 'hi', name: 'हिन्दी' }, 
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' }
  ]

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="logo">{t('logo')}</Link>
        </div>
        <div className="nav-center">
          {user && (
            <>
              <Link to="/civic">{t('civic')}</Link>
              <Link to="/education">{t('learn')}</Link>
              <Link to="/market">{t('market')}</Link>
              <Link to="/translate">{t('translate')}</Link>
            </>
          )}
        </div>
        <div className="nav-right">
   
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">👤 {t('dashboard')}</Link>
              <button onClick={logout} className="btn-logout">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">{t('login')}</Link>
              <Link to="/signup" className="btn-signup">{t('signup')}</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/civic" element={<CivicHub />} />
          <Route path="/education" element={<Education />} />
          <Route path="/market" element={<Market />} />
          <Route path="/translate" element={<Translate />} />
          <Route path="/ai-console" element={<AIConsole />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Home user={user} />} />
          <Route path="/profile" element={<Profile setUser={setUser} />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </BrowserRouter>
  )
}
