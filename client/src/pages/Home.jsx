import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/home.css'

export default function Home({ user }) {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  const featuredSchemes = [
    {
      id: 1,
      title: 'PM Kisan Samman Nidhi',
      description: 'Direct income support to farmers ₹6,000 per year',
      emoji: '🌾',
      color: '#10b981'
    },
    {
      id: 2,
      title: 'Ayushman Bharat',
      description: 'Free health insurance coverage up to ₹5 lakhs',
      emoji: '⚕️',
      color: '#f59e0b'
    },
    {
      id: 3,
      title: 'Skill India Mission',
      description: 'Free skill development training programs',
      emoji: '🛠️',
      color: '#3b82f6'
    },
    {
      id: 4,
      title: 'Startup India',
      description: 'Support and funding for startups',
      emoji: '🚀',
      color: '#ec4899'
    },
    {
      id: 5,
      title: 'Digital India',
      description: 'Digital infrastructure and literacy programs',
      emoji: '🌐',
      color: '#8b5cf6'
    },
    {
      id: 6,
      title: 'Swachh Bharat Mission',
      description: 'Sanitation and cleanliness initiatives',
      emoji: '♻️',
      color: '#06b6d4'
    }
  ]

  const features = [
    {
      id: 'civic',
      title: 'Civic Hub',
      description: 'Browse 1000+ government schemes — health, agriculture, education & more',
      icon: '🏛️',
      color: '#667eea'
    },
    {
      id: 'education',
      title: 'Learn & Upskill',
      description: 'Courses, certifications & resources with AI learning advisor',
      icon: '📚',
      color: '#10b981'
    },
    {
      id: 'market',
      title: 'Jobs & Opportunities',
      description: 'Find jobs, internships, grants & scholarships with AI career advisor',
      icon: '💼',
      color: '#f59e0b'
    },
    {
      id: 'translate',
      title: 'Translate & Voice',
      description: 'Translate text & speech across English, Hindi, Tamil, Telugu & Bengali',
      icon: '🌍',
      color: '#ec4899'
    },
    {
      id: 'ai',
      title: 'AI Assistants',
      description: 'Amazon Bedrock Nova Lite AI advisors on every page',
      icon: '🤖',
      color: '#8b5cf6'
    },
    {
      id: 'multilingual',
      title: 'Multilingual UI',
      description: 'Full app interface in English, हिन्दी, தமிழ், తెలుగు & বাংলা',
      icon: '🗣️',
      color: '#4facfe'
    }
  ]

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">SAHAAY</h1>
          <p className="hero-subtitle">
            Your All-in-One AI-Powered Platform for India
          </p>
          <p className="hero-description">
            Discover government schemes, learn new skills, find jobs & scholarships, and translate across 5 Indian languages — all powered by AWS AI
          </p>

          {!user && (
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => navigate('/login')}
              >
                Get Started
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowGuide(!showGuide)}
              >
                📖 How to Use SAHAAY
              </button>
            </div>
          )}

          {user && (
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/civic-hub')}
              >
                Explore Features
              </button>
            </div>
          )}
        </div>

        {showGuide && (
          <div className="guide-section" style={{ marginTop: '40px', padding: '40px 20px', background: 'rgba(255,255,255,0.97)', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div className="guide-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <button
                onClick={() => setShowGuide(false)}
                style={{
                  float: 'right',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0'
                }}
              >
                ✕
              </button>

              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>
                📖 How to Use SAHAAY
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '40px' }}>
                Your step-by-step guide to using SAHAAY's all-in-one platform
              </p>

              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Step 1 */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '24px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: '#667eea',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      1
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        📝 Create Your Account
                      </h3>
                      <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                        Click "Get Started" to sign up. Provide your email, create a strong password, and verify your account. You can also add your phone number and location for more personalized results.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '24px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #10b981'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: '#10b981',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      2
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        🔍 Explore All Features
                      </h3>
                      <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                        Navigate to Civic Hub for government schemes, Education for courses & resources, Market for jobs & scholarships, or Translate for multilingual text & voice translation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '24px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: '#f59e0b',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      3
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        � Use AI Assistants
                      </h3>
                      <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                        Each page has a floating 🤖 AI Assistant button (bottom-right). Click it to ask questions — get scheme advice on Civic Hub, learning tips on Education, or career guidance on Market.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '24px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: '#3b82f6',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      4
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        � Translate & Voice Input
                      </h3>
                      <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                        Go to Translate to convert text or speech between English, हिन्दी, தமிழ், తెలుగు & বাংলা. Switch the app language anytime using the language selector at the top right.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '24px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #ec4899'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: '#ec4899',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      5
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        🎯 Dashboard & Goals
                      </h3>
                      <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                        Track saved schemes, set learning goals, monitor your progress and manage your profile — all from your personalized Dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div style={{
                  background: '#f0f9ff',
                  padding: '24px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #0284c7'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                    💡 Pro Tips
                  </h3>
                  <ul style={{ margin: '0', paddingLeft: '20px', color: '#64748b', fontSize: '14px', lineHeight: '1.8' }}>
                    <li>Click the 🤖 AI Assistant on any page for instant help</li>
                    <li>Visit "Civic Hub" for government schemes & eligibility info</li>
                    <li>Visit "Education" for courses, certifications & learning resources</li>
                    <li>Explore "Market" for jobs, internships, grants & scholarships</li>
                    <li>Use "Translate" for text & voice translation in 5 Indian languages</li>
                    <li>Keep your profile updated for more relevant recommendations</li>
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px 40px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🚀 Get Started Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
              style={{
                transform: hoveredFeature === feature.id ? 'translateY(-10px)' : 'translateY(0)',
                boxShadow: hoveredFeature === feature.id ? `0 10px 30px ${feature.color}40` : '0 5px 15px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Section */}
      <div className="tech-section">
        <h2>Powered By AWS</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '40px', fontSize: '17px', textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px' }}>7 AWS services powering Civic Hub, Education, Market, Translate & AI Assistants</p>
        <div className="tech-stack">
          <div className="tech-item">
            <div className="tech-icon">🧠</div>
            <div className="tech-name">Amazon Bedrock</div>
            <div className="tech-desc">Nova Lite AI for intelligent Q&A</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">⚡</div>
            <div className="tech-name">AWS Lambda</div>
            <div className="tech-desc">Serverless Deployment</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">💾</div>
            <div className="tech-name">DynamoDB</div>
            <div className="tech-desc">User & Query Session Storage</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">📦</div>
            <div className="tech-name">S3 Storage</div>
            <div className="tech-desc">Document Storage</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">📊</div>
            <div className="tech-name">CloudWatch</div>
            <div className="tech-desc">Real-time Monitoring & Logs</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🎤</div>
            <div className="tech-name">Transcribe</div>
            <div className="tech-desc">Speech-to-Text in 5 Languages</div>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🌐</div>
            <div className="tech-name">Amazon Translate</div>
            <div className="tech-desc">Real-time Text Translation</div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works" style={{ background: '#f8f9fa', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: '15px' }}>
            How SAHAAY Works
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', textAlign: 'center', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
            One platform for schemes, learning, careers & multilingual support
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '24px',
            marginBottom: '60px'
          }}>
            {/* Step 1 */}
            <div style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,126,234,0.15)'
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                🏛️
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Civic Hub
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                Browse 1000+ government schemes — health, agriculture, education, startup funding & more. AI Scheme Advisor helps you find what you're eligible for.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.15)'
              e.currentTarget.style.borderColor = '#10b981'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#10b981',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                📚
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Education & Courses
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                Explore courses, certifications & learning resources. AI Learning Advisor recommends the best learning paths for your goals.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.15)'
              e.currentTarget.style.borderColor = '#f59e0b'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#f59e0b',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                �
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Jobs & Market
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                Find jobs, internships, grants & scholarships. AI Career Advisor helps with interview tips, resume guidance & opportunity matching.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.15)'
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                �
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Translate & Voice
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                Translate text & speech across English, हिंदी, தமிழ், తెలుగు & বাংলা. AWS Transcribe powers speech-to-text in 5 languages.
              </p>
            </div>

            {/* Step 5 */}
            <div style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(236,72,153,0.15)'
              e.currentTarget.style.borderColor = '#ec4899'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#ec4899',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                🤖
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                AI Assistants
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                Every page has a floating AI Assistant powered by Amazon Bedrock Nova Lite — ask questions, get instant advice & recommendations.
              </p>
            </div>

            {/* Step 6 */}
            <div style={{
              background: '#fff',
              padding: '32px 24px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.15)'
              e.currentTarget.style.borderColor = '#06b6d4'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#06b6d4',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                📊
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Dashboard & Goals
              </h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                Track saved schemes, set personal goals, monitor progress & manage your profile — all in one dashboard.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <h2>Ready to Explore SAHAAY?</h2>
        <p>Schemes, courses, jobs, translations — everything you need, all in one place</p>
        {!user ? (
          <div className="cta-buttons">
            <button className="btn-large-primary" onClick={() => navigate('/signup')}>
              Sign Up Now
            </button>
            <button className="btn-large-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        ) : (
          <button className="btn-large-primary" onClick={() => navigate('/dashboard')}>
            Open Dashboard
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="footer-info" style={{ background: '#1e293b', color: '#fff', padding: '60px 20px' }}>
        <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            {/* About Section */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>🎯 SAHAAY</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.7', color: '#cbd5e1' }}>
                Your all-in-one platform — discover government schemes, learn new skills with courses & resources, find jobs, internships, grants & scholarships, and translate across 5 Indian languages with AI-powered speech recognition.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <a href="https://x.com/sahaay26112" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>Twitter</a>
                <span style={{ color: '#475569' }}>•</span>
                <a href="https://www.linkedin.com/in/sahaay-ai-for-bharat-99263a3b5/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>LinkedIn</a>
                <span style={{ color: '#475569' }}>•</span>
                <a href="https://www.facebook.com/profile.php?id=61583710044914&rdid=HTe2eMITAwouR1jU&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F14XM5MtaQGa%2F#" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>Facebook</a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>📚 Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ Home</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => navigate('/login')} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ Login</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => navigate('/signup')} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ Create Account</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => navigate('/translate')} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ Translate</a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>🛠️ Resources</h4>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => { setShowGuide(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ User Guide</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => setActiveModal('faq')} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ FAQ</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => setActiveModal('privacy')} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ Privacy Policy</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a onClick={() => setActiveModal('terms')} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ Terms of Service</a>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>→ AWS Cloud Services</a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>💬 Support</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#cbd5e1' }}>
                Need help? We're here for you!
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
                📧 Email: <a href="https://mail.google.com/mail/?view=cm&to=Sahaaysupport@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>Sahaaysupport@gmail.com</a>
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
                📞 Phone: <a href="tel:+919876543210" style={{ color: '#667eea', textDecoration: 'none', whiteSpace: 'nowrap' }}>+91&nbsp;9876543210</a>
              </p>
              <p style={{ margin: '0', fontSize: '13px', color: '#94a3b8' }}>
                Mon-Sat: 9AM - 6PM IST
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <p style={{ margin: '0', fontSize: '13px', color: '#94a3b8' }}>
              © 2026 SAHAAY. All rights reserved. Built with ❤️ for India
            </p>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
                  Powered by <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '700' }}>AWS</a>
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {[
                    { name: 'Bedrock', url: 'https://aws.amazon.com/bedrock/' },
                    { name: 'Lambda', url: 'https://aws.amazon.com/lambda/' },
                    { name: 'DynamoDB', url: 'https://aws.amazon.com/dynamodb/' },
                    { name: 'S3', url: 'https://aws.amazon.com/s3/' },
                    { name: 'CloudWatch', url: 'https://aws.amazon.com/cloudwatch/' },
                    { name: 'Transcribe', url: 'https://aws.amazon.com/transcribe/' },
                    { name: 'Translate', url: 'https://aws.amazon.com/translate/' }
                  ].map((svc, i, arr) => (
                    <span key={svc.name} style={{ fontSize: '11px' }}>
                      <a href={svc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}
                        onMouseEnter={e => e.target.style.color = '#f59e0b'}
                        onMouseLeave={e => e.target.style.color = '#94a3b8'}
                      >{svc.name}</a>{i < arr.length - 1 && <span style={{ color: '#475569' }}> • </span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div onClick={() => setActiveModal(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: '16px', maxWidth: '700px', width: '100%',
            maxHeight: '80vh', overflowY: 'auto', padding: '40px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                {activeModal === 'faq' && '❓ Frequently Asked Questions'}
                {activeModal === 'privacy' && '🔒 Privacy Policy'}
                {activeModal === 'terms' && '📜 Terms of Service'}
              </h2>
              <button onClick={() => setActiveModal(null)} style={{
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer',
                color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>✕</button>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>Last updated: March 2026</p>

            {activeModal === 'faq' && (
              <div style={{ color: '#334155', fontSize: '15px', lineHeight: '1.8' }}>
                {[
                  { q: 'What is SAHAAY?', a: 'SAHAAY is an AI-powered platform that helps Indian citizens discover government schemes, learn new skills, find job opportunities, and translate content across 5 Indian languages.' },
                  { q: 'Is SAHAAY free to use?', a: 'Yes! SAHAAY is completely free. It is built as a social impact project to bridge the gap between citizens and government welfare programs.' },
                  { q: 'What languages are supported?', a: 'SAHAAY supports English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), and Bengali (বাংলা) for translation and speech recognition.' },
                  { q: 'Do I need to create an account?', a: 'You can browse the homepage and use translation without an account. However, signing up gives you access to the Civic Hub (schemes), Education Center, Market opportunities, and your personal Dashboard.' },
                  { q: 'What AWS services power SAHAAY?', a: 'SAHAAY uses 7 AWS services: Amazon Bedrock (AI), Lambda (serverless), DynamoDB (database), S3 (document storage), CloudWatch (monitoring), Transcribe (speech-to-text), and Translate (text translation).' },
                  { q: 'How do I apply for a scheme?', a: 'Go to the Civic Hub, find a scheme that matches your needs, and click the "Apply" button which will redirect you to the official government portal for that scheme.' },
                  { q: 'Is my data safe?', a: 'Absolutely. Your data is encrypted and stored securely on AWS infrastructure. We never share personal information with third parties. See our Privacy Policy for details.' }
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #667eea' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#1e293b' }}>{item.q}</p>
                    <p style={{ margin: 0, color: '#475569' }}>{item.a}</p>
                  </div>
                ))}
              </div>
            )}

            {activeModal === 'privacy' && (
              <div style={{ color: '#334155', fontSize: '15px', lineHeight: '1.8' }}>
                {[
                  { title: '1. Information We Collect', text: 'When you create an account, we collect your name, email address, and language preference. When you use our services, we may collect query history and scheme preferences to provide personalized recommendations.' },
                  { title: '2. How We Use Your Information', text: 'Your information is used solely to provide and improve SAHAAY services — including scheme recommendations, translation, and personalized dashboard features. We do not sell or rent your personal data.' },
                  { title: '3. Data Storage & Security', text: 'All data is stored securely using AWS DynamoDB with encryption at rest and in transit. We use AWS CloudWatch for monitoring and follow industry-standard security practices to protect your information.' },
                  { title: '4. Third-Party Services', text: 'SAHAAY uses AWS cloud services for infrastructure. We do not share your personal information with any third-party advertisers or marketing platforms.' },
                  { title: '5. Cookies & Local Storage', text: 'We use browser local storage to maintain your session and language preferences. No third-party tracking cookies are used on this platform.' },
                  { title: '6. Your Rights', text: 'You have the right to access, update, or delete your personal data at any time. You can contact us for any privacy-related requests.' },
                  { title: '7. Contact Us', text: null }
                ].map((section, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px' }}>{section.title}</h4>
                    {section.title === '7. Contact Us' ? (
                      <p style={{ margin: 0, color: '#475569' }}>
                        For privacy concerns or data requests, reach out to us at{' '}
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Sahaaysupport@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Sahaaysupport@gmail.com</a>
                        {' '}or call{' '}
                        <a href="tel:+919876543210"  style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>+91&nbsp;9876543210</a>
                        {' '}(Mon-Sat, 9AM-6PM IST).
                      </p>
                    ) : (
                      <p style={{ margin: 0, color: '#475569' }}>{section.text}</p>
                    )}
                    {i < 6 && <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0 0 0' }} />}
                  </div>
                ))}
              </div>
            )}

            {activeModal === 'terms' && (
              <div style={{ color: '#334155', fontSize: '15px', lineHeight: '1.8' }}>
                {[
                  { title: '1. Acceptance of Terms', text: 'By accessing and using SAHAAY, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the platform.' },
                  { title: '2. Description of Service', text: 'SAHAAY is an AI-powered platform that provides government scheme discovery, educational resources, job/internship listings, and multilingual translation services for Indian citizens.' },
                  { title: '3. User Accounts', text: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration and keep it updated.' },
                  { title: '4. Acceptable Use', text: 'You agree to use SAHAAY only for lawful purposes. You shall not misuse the platform, attempt unauthorized access, or interfere with the service operations.' },
                  { title: '5. Content & Information', text: 'Government scheme information is sourced from official portals (india.gov.in, myscheme.gov.in). While we strive for accuracy, SAHAAY is not a government entity and users should verify details on official websites before applying.' },
                  { title: '6. Intellectual Property', text: 'The SAHAAY platform, including its design, code, and content, is a hackathon project built for social impact. All AWS trademarks belong to Amazon Web Services, Inc.' },
                  { title: '7. Limitation of Liability', text: 'SAHAAY is provided "as is" without warranties. We are not liable for any damages arising from the use of our platform or reliance on scheme information provided.' },
                  { title: '8. Changes to Terms', text: 'We reserve the right to modify these terms at any time. Continued use of SAHAAY after changes constitutes acceptance of updated terms.' }
                ].map((section, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px' }}>{section.title}</h4>
                    <p style={{ margin: 0, color: '#475569' }}>{section.text}</p>
                    {i < 7 && <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0 0 0' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
