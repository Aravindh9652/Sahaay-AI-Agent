import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getApiBaseUrl } from '../utils/apiConfig'

const loginStyles = `
  @keyframes shimmerBorder {
    0%, 100% { box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1); }
    50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  }

  .login-input-focus {
    animation: shimmerBorder 2s ease-in-out infinite;
  }

  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .login-container {
    animation: slideInDown 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .form-element {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .form-element-1 { animation-delay: 0.1s; }
  .form-element-2 { animation-delay: 0.2s; }
  .form-element-3 { animation-delay: 0.3s; }
  .form-element-4 { animation-delay: 0.4s; }
  .form-element-5 { animation-delay: 0.5s; }
  .form-element-6 { animation-delay: 0.6s; }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
    50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); }
  }

  .input-with-glow:focus {
    animation: glow 0.6s ease-in-out;
  }
`

export default function Login({ setUser }){
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotToken, setForgotToken] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotMsg, setForgotMsg] = useState('')
  const navigate = useNavigate()

  const parseJsonSafely = async (response) => {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const API_BASE_URL = getApiBaseUrl()
    let data = null
    let response = null

    try {
      response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      })
      data = await parseJsonSafely(response)

      if (!response) {
        setError('Cannot reach the server. Please check your connection.')
        return
      }

      if (data?.ok) {
        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          token: data.token,
          profile: data.user.profile
        }
        localStorage.setItem('sahaay_token', JSON.stringify(user))
        setUser(user)
        // Force navigation to dashboard
        window.location.href = '/dashboard'
      } else if (data?.userNotFound) {
        setError(t('accountNotFound'))
        setTimeout(() => {
          navigate('/signup', { state: { email } })
        }, 1500)
      } else {
        setError(data?.error || t('invalidPassword'))
      }
    } catch (err) {
      setError('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotMsg('')
    if (!forgotEmail) {
      setForgotMsg('❌ Please enter your email address')
      return
    }
    
    const API_BASE_URL = getApiBaseUrl()
    
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      const data = await resp.json()
      if (data.ok && data.token) {
        setForgotMsg('✅ Reset token: ' + data.token + '\n\n(Your password reset token is shown above for demo purposes)')
        setForgotStep(2)
      } else if (resp.status === 404) {
        setForgotMsg('❌ User not found with this email')
      } else {
        setForgotMsg(data.error || '❌ Error generating token')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setForgotMsg('❌ Cannot reach server. Please check your connection.')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setForgotMsg('')
    if (!forgotToken || !forgotNewPassword) {
      setForgotMsg('❌ Please enter both token and new password')
      return
    }
    
    const API_BASE_URL = getApiBaseUrl()
    
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, token: forgotToken, newPassword: forgotNewPassword })
      })
      const data = await resp.json()
      if (data.ok) {
        setForgotMsg('✅ Password reset successful! Closing...')
        setTimeout(() => {
          setForgotStep(1)
          setShowForgot(false)
          setForgotMsg('')
          setForgotEmail('')
          setForgotToken('')
          setForgotNewPassword('')
        }, 1500)
      } else {
        setForgotMsg(data.error || '❌ Error resetting password')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setForgotMsg('❌ Cannot reach server. Please check your connection.')
    }
  }

  return (
    <>
      <style>{loginStyles}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
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
          animation: 'float 8s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }}></div>

        <div className="login-container" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,250,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px 40px',
          border: '1px solid rgba(102,126,234,0.15)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{textAlign: 'center', marginBottom: '36px'}} className="form-element form-element-1">
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '44px',
              margin: '0 auto 24px auto',
              boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
              animation: 'float 3s ease-in-out infinite'
            }}>
              🔐
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#1a1a2e',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              {t('loginTitle')}
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '15px',
              lineHeight: '1.6'
            }}>
              Welcome back! Sign in to your SAHAAY account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="form-element form-element-2" style={{
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: error.includes('create') ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))' : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
              border: `2px solid ${error.includes('create') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: error.includes('create') ? '#059669' : '#dc2626',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              animation: 'slideInDown 0.4s ease-out'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="form-element form-element-3" style={{marginBottom: '24px'}}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '700',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'color 0.3s ease',
                color: focusedField === 'email' ? '#667eea' : '#1a1a2e'
              }}>
                📧 {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                onFocus={e => {
                  setFocusedField('email');
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15)';
                  e.target.style.background = 'linear-gradient(135deg, #ffffff, rgba(248, 249, 250, 0.5))';
                }}
                onBlur={e => {
                  setFocusedField(null);
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'linear-gradient(135deg, #ffffff, #f8f9fa)';
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid var(--border)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                  fontWeight: '500',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password Field */}
            <div className="form-element form-element-4" style={{marginBottom: '28px'}}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '700',
                color: focusedField === 'password' ? '#667eea' : '#1a1a2e',
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
                  placeholder="••••••••"
                  required
                  onFocus={e => {
                    setFocusedField('password');
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15)';
                    e.target.style.background = 'linear-gradient(135deg, #ffffff, rgba(248, 249, 250, 0.5))';
                  }}
                  onBlur={e => {
                    setFocusedField(null);
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'linear-gradient(135deg, #ffffff, #f8f9fa)';
                  }}
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
                    fontSize: '20px',
                    color: '#6b7280',
                    transition: 'all 0.3s ease',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-50%) scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="form-element form-element-5"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: loading ? 'linear-gradient(135deg, #bfdbfe, #bfdbfe)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading ? '0 4px 15px rgba(102,126,234,0.2)' : '0 8px 25px rgba(102,126,234,0.3)',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(102,126,234,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 25px rgba(102,126,234,0.3)'
                }
              }}
            >
              {loading ? '⏳ Signing In...' : `🚀 ${t('login')}`}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid rgba(102,126,234,0.1)'
          }}>
            <p className="form-element form-element-6" style={{
              color: '#6b7280',
              fontSize: '15px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {t('noAccount')}{' '}
              <Link
                to="/signup"
                style={{
                  color: '#667eea',
                  fontWeight: '700',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  borderBottom: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#764ba2'
                  e.target.style.borderBottomColor = '#764ba2'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#667eea'
                  e.target.style.borderBottomColor = 'transparent'
                }}
              >
                {t('signUpHere')}
              </Link>
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '24px',
              opacity: 0.7
            }}>
              <div style={{flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb)'}}></div>
              <span style={{color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Demo</span>
              <div style={{flex: 1, height: '1px', background: 'linear-gradient(90deg, #e5e7eb, transparent)'}}></div>
            </div>

            <div style={{
              marginTop: '16px',
              fontSize: '13px',
              color: '#6b7280',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05))',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(102,126,234,0.1)',
              fontWeight: '600'
            }}>
              <div style={{marginBottom: '6px'}}><strong style={{color: '#667eea'}}>📧 Email:</strong> demo@sahaay.com</div>
              <div><strong style={{color: '#667eea'}}>🔑 Password:</strong> demo123</div>
            </div>

            <div style={{textAlign:'center',marginBottom:'16px'}}>
              <button type="button" style={{background:'none',border:'none',color:'#667eea',fontWeight:'700',cursor:'pointer',textDecoration:'underline'}} onClick={()=>setShowForgot(true)}>
                Forgot Password?
              </button>
            </div>

            {/* Forgot Password Modal */}
            {showForgot && (
              <div style={{position:'fixed',top:'0',left:'0',right:'0',bottom:'0',background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',overflow:'auto'}}>
                <div style={{background:'#fff',padding:'40px',borderRadius:'20px',maxWidth:'450px',width:'100%',boxShadow:'0 25px 60px rgba(0,0,0,0.3)',margin:'auto'}}>
                  <h2 style={{marginBottom:'8px',fontSize:'28px',fontWeight:'800',color:'#667eea',textAlign:'center'}}>🔑 Reset Password</h2>
                  <p style={{marginBottom:'28px',fontSize:'15px',color:'#6b7280',textAlign:'center'}}>Secure password recovery</p>
                  
                  {forgotStep===1 && (
                    <form onSubmit={handleForgotPassword}>
                      <input 
                        type="email" 
                        value={forgotEmail} 
                        onChange={e=>setForgotEmail(e.target.value)} 
                        placeholder="Enter your email" 
                        required 
                        style={{width:'100%',padding:'14px',marginBottom:'16px',borderRadius:'10px',border:'2px solid #e5e7eb',fontSize:'15px',outline:'none',boxSizing:'border-box',transition:'all 0.3s',fontWeight:'500'}}
                        onFocus={e=>e.target.style.borderColor='#667eea'}
                        onBlur={e=>e.target.style.borderColor='#e5e7eb'}
                      />
                      <button 
                        type="submit" 
                        style={{width:'100%',padding:'14px',borderRadius:'10px',background:'linear-gradient(135deg, #667eea, #764ba2)',color:'#fff',fontWeight:'700',border:'none',cursor:'pointer',fontSize:'15px',transition:'all 0.3s'}}
                        onMouseEnter={e=>e.target.style.transform='translateY(-2px)'}
                        onMouseLeave={e=>e.target.style.transform='translateY(0)'}
                      >
                        📧 Request Reset Token
                      </button>
                    </form>
                  )}
                  
                  {forgotStep===2 && (
                    <form onSubmit={handleResetPassword}>
                      <div style={{marginBottom:'18px'}}>
                        <label style={{display:'block',fontSize:'13px',fontWeight:'700',color:'#667eea',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Reset Token</label>
                        <textarea 
                          value={forgotToken} 
                          onChange={e=>setForgotToken(e.target.value)} 
                          placeholder="Paste your reset token here" 
                          required 
                          style={{width:'100%',padding:'12px',borderRadius:'10px',border:'2px solid #e5e7eb',fontSize:'12px',fontFamily:'monospace',outline:'none',boxSizing:'border-box',transition:'all 0.3s',minHeight:'80px',fontWeight:'500'}}
                          onFocus={e=>e.target.style.borderColor='#667eea'}
                          onBlur={e=>e.target.style.borderColor='#e5e7eb'}
                        />
                      </div>
                      
                      <div style={{marginBottom:'18px'}}>
                        <label style={{display:'block',fontSize:'13px',fontWeight:'700',color:'#667eea',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.5px'}}>New Password</label>
                        <input 
                          type="password" 
                          value={forgotNewPassword} 
                          onChange={e=>setForgotNewPassword(e.target.value)} 
                          placeholder="••••••••" 
                          required 
                          style={{width:'100%',padding:'14px',borderRadius:'10px',border:'2px solid #e5e7eb',fontSize:'15px',outline:'none',boxSizing:'border-box',transition:'all 0.3s',fontWeight:'500'}}
                          onFocus={e=>e.target.style.borderColor='#667eea'}
                          onBlur={e=>e.target.style.borderColor='#e5e7eb'}
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        style={{width:'100%',padding:'14px',borderRadius:'10px',background:'linear-gradient(135deg, #667eea, #764ba2)',color:'#fff',fontWeight:'700',border:'none',cursor:'pointer',fontSize:'15px',transition:'all 0.3s'}}
                        onMouseEnter={e=>e.target.style.transform='translateY(-2px)'}
                        onMouseLeave={e=>e.target.style.transform='translateY(0)'}
                      >
                        🔐 Reset Password
                      </button>
                    </form>
                  )}
                  
                  {forgotMsg && (
                    <div style={{marginTop:'18px',padding:'14px',borderRadius:'10px',background:forgotMsg.includes('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:'1px solid '+(forgotMsg.includes('✅')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'),color:forgotMsg.includes('✅')?'#059669':'#dc2626',fontWeight:'600',fontSize:'14px',lineHeight:'1.6',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
                      {forgotMsg}
                    </div>
                  )}
                  
                  <button 
                    type="button" 
                    style={{marginTop:'22px',background:'none',border:'none',color:'#667eea',fontWeight:'700',cursor:'pointer',textDecoration:'underline',fontSize:'15px',width:'100%',textAlign:'center'}} 
                    onClick={()=>{setShowForgot(false);setForgotStep(1);setForgotMsg('');setForgotEmail('');setForgotToken('');setForgotNewPassword('')}}>
                    ✕ Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
