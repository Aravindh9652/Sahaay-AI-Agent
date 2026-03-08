import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getApiBaseUrl } from '../utils/apiConfig'

const signupStyles = `
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .signup-container {
    animation: slideInDown 0.8s ease-out;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-element {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .progress-step {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .progress-bar {
    height: 3px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f093fb, #764ba2);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
`

export default function Signup({ setUser }){
  const { t } = useLanguage()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [locationField, setLocationField] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError(t('allRequired'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordLength'))
      return
    }

    setLoading(true)
    try {
      const API_BASE_URL = getApiBaseUrl()
      
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          location: locationField,
          language: 'en'
        })
      })
      const data = await res.json()
      
      if (data.ok) {
        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          token: data.token,
          profile: data.user.profile
        }
        localStorage.setItem('sahaay_token', JSON.stringify(user))
        setUser(user)
        navigate('/dashboard')
      } else if (data.userExists) {
        setError('Email already registered. Please login instead.')
        setTimeout(() => navigate('/login', { state: { email } }), 2000)
      } else {
        setError(data.error || t('signupError'))
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const filledFields = [name, email, password, confirmPassword].filter(f => f).length
  const progressPercent = (filledFields / 4) * 100

  return (
    <>
      <style>{signupStyles}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>

        <div className="signup-container" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,250,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px 40px',
          border: '1px solid rgba(255,150,200,0.2)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          width: '100%',
          maxWidth: '500px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{textAlign: 'center', marginBottom: '32px', animation: 'fadeInUp 0.6s ease-out'}} className="form-element">
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              margin: '0 auto 24px auto',
              boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
              animation: 'float 3s ease-in-out infinite'
            }}>
              ✨
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#1a1a2e',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              {t('signupTitle')}
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '15px',
              lineHeight: '1.6'
            }}>
              Join thousands making a difference with SAHAAY!
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{marginBottom: '32px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
              <span style={{fontSize: '12px', fontWeight: '700', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                Progress
              </span>
              <span style={{fontSize: '12px', fontWeight: '700', color: '#6b7280'}}>
                {filledFields}/4 fields
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${progressPercent}%`}}></div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: error.includes('already') ? 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(217,119,6,0.05))' : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
              border: `2px solid ${error.includes('already') ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: error.includes('already') ? '#b45309' : '#dc2626',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              animation: 'slideInDown 0.4s ease-out'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup}>
            {/* Name & Phone */}
            <div className="form-row" style={{marginBottom: '20px', opacity: 0, animation: 'fadeInUp 0.6s ease-out 0.1s forwards'}}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '700',
                  color: focusedField === 'name' ? '#f093fb' : '#1a1a2e',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'color 0.3s ease'
                }}>
                  👤 {t('fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => {
                    setFocusedField('name');
                    e.target.style.borderColor = '#f093fb';
                    e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.15)';
                  }}
                  onBlur={e => {
                    setFocusedField(null);
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '700',
                  color: focusedField === 'phone' ? '#f093fb' : '#1a1a2e',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'color 0.3s ease'
                }}>
                  📱 Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => {
                    setFocusedField('phone');
                    e.target.style.borderColor = '#f093fb';
                    e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.15)';
                  }}
                  onBlur={e => {
                    setFocusedField(null);
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{marginBottom: '20px', opacity: 0, animation: 'fadeInUp 0.6s ease-out 0.15s forwards'}}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '700',
                color: focusedField === 'email' ? '#f093fb' : '#1a1a2e',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'color 0.3s ease'
              }}>
                📧 {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                  fontWeight: '500',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  setFocusedField('email');
                  e.target.style.borderColor = '#f093fb';
                  e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.15)';
                }}
                onBlur={e => {
                  setFocusedField(null);
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Location */}
            <div style={{marginBottom: '24px', opacity: 0, animation: 'fadeInUp 0.6s ease-out 0.2s forwards'}}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '700',
                color: focusedField === 'location' ? '#f093fb' : '#1a1a2e',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'color 0.3s ease'
              }}>
                📍 Location (Optional)
              </label>
              <input
                type="text"
                value={locationField}
                onChange={e => setLocationField(e.target.value)}
                placeholder="City, State"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                  fontWeight: '500',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  setFocusedField('location');
                  e.target.style.borderColor = '#f093fb';
                  e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.15)';
                }}
                onBlur={e => {
                  setFocusedField(null);
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Passwords */}
            <div className="form-row" style={{marginBottom: '28px', opacity: 0, animation: 'fadeInUp 0.6s ease-out 0.25s forwards'}}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '700',
                  color: focusedField === 'password' ? '#f093fb' : '#1a1a2e',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'color 0.3s ease'
                }}>
                  🔑 {t('password')}
                </label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                      fontWeight: '500',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      setFocusedField('password');
                      e.target.style.borderColor = '#f093fb';
                      e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.15)';
                    }}
                    onBlur={e => {
                      setFocusedField(null);
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#6b7280',
                      transition: 'all 0.3s ease',
                      padding: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-50%) scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '700',
                  color: focusedField === 'confirmPassword' ? '#f093fb' : '#1a1a2e',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'color 0.3s ease'
                }}>
                  ✅ {t('confirmPassword')}
                </label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '50px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                      fontWeight: '500',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      setFocusedField('confirmPassword');
                      e.target.style.borderColor = '#f093fb';
                      e.target.style.boxShadow = '0 0 0 4px rgba(240, 147, 251, 0.15)';
                    }}
                    onBlur={e => {
                      setFocusedField(null);
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#6b7280',
                      transition: 'all 0.3s ease',
                      padding: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-50%) scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
                  >
                    {showConfirmPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: loading ? 'linear-gradient(135deg, #bfdbfe, #bfdbfe)' : 'linear-gradient(135deg, #f093fb, #f5576c)',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading ? '0 4px 15px rgba(240,147,251,0.2)' : '0 8px 25px rgba(240,147,251,0.3)',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                position: 'relative',
                overflow: 'hidden',
                opacity: 0,
                animation: 'fadeInUp 0.6s ease-out 0.3s forwards'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(240,147,251,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 25px rgba(240,147,251,0.3)'
                }
              }}
            >
              {loading ? '⏳ Creating Account...' : `🎉 ${t('createAccount')}`}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid rgba(240, 147, 251, 0.1)',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease-out 0.4s forwards'
          }}>
            <p style={{
              color: '#6b7280',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              {t('hasAccount')}{' '}
              <Link
                to="/login"
                style={{
                  color: '#f093fb',
                  fontWeight: '700',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#f5576c'
                  e.target.style.borderBottomColor = '#f5576c'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#f093fb'
                  e.target.style.borderBottomColor = 'transparent'
                }}
              >
                {t('loginHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
