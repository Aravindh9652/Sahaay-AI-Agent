import React, { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { getApiBaseUrl } from '../utils/apiConfig'
import './Dashboard.css'

export default function Dashboard({ user }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [activity, setActivity] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [newGoal, setNewGoal] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    language: 'en',
    bio: '',
    skills: '',
    interests: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('sahaay_token')
      const userData = token ? JSON.parse(token) : null
      
      const API_BASE_URL = getApiBaseUrl()
      const headers = { Authorization: `Bearer ${userData?.token}` }

      const [profileRes, activityRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/profile`, { headers }),
        fetch(`${API_BASE_URL}/api/auth/activity`, { headers })
      ])

      const [profileData, activityData] = await Promise.all([
        profileRes.json(),
        activityRes.json()
      ])

      if (profileData.profile) {
        setProfile(profileData.profile)
        setForm({
          name: profileData.profile.name || user?.name || '',
          email: profileData.profile.email || user?.email || '',
          phone: profileData.profile.phone || '',
          location: profileData.profile.location || '',
          language: profileData.profile.language || 'en',
          bio: profileData.profile.bio || '',
          skills: (profileData.profile.skills || []).join(', '),
          interests: (profileData.profile.interests || []).join(', ')
        })
      } else {
        // Fallback: use data from localStorage if profile fetch fails
        setForm({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.profile?.phone || '',
          location: user?.profile?.location || '',
          language: user?.profile?.language || 'en',
          bio: user?.profile?.bio || '',
          skills: (user?.profile?.skills || []).join(', '),
          interests: (user?.profile?.interests || []).join(', ')
        })
      }

      if (activityData.activity) setActivity(activityData.activity)

      // Load goals from localStorage
      const savedGoals = localStorage.getItem('user_goals')
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Fallback: use data from localStorage
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.profile?.phone || '',
        location: user?.profile?.location || '',
        language: user?.profile?.language || 'en',
        bio: user?.profile?.bio || '',
        skills: (user?.profile?.skills || []).join(', '),
        interests: (user?.profile?.interests || []).join(', ')
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('sahaay_token')
      const userData = token ? JSON.parse(token) : null

      const API_BASE_URL = getApiBaseUrl()

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData?.token}`
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          location: form.location,
          language: form.language,
          bio: form.bio,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          interests: form.interests.split(',').map(s => s.trim()).filter(Boolean)
        })
      })

      const data = await response.json()
      if (data.ok) {
        setSaveMessage('Profile updated successfully!')
        setEditMode(false)
        fetchUserData()
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Failed to update profile')
      }
    } catch (error) {
      setSaveMessage('Error updating profile')
      console.error('Error:', error)
    }
  }

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const goal = {
        id: Date.now(),
        text: newGoal,
        completed: false,
        createdAt: new Date().toISOString()
      }
      const updatedGoals = [...goals, goal]
      setGoals(updatedGoals)
      localStorage.setItem('user_goals', JSON.stringify(updatedGoals))
      setNewGoal('')
    }
  }

  const handleToggleGoal = (id) => {
    const updatedGoals = goals.map(g =>
      g.id === id ? { ...g, completed: !g.completed } : g
    )
    setGoals(updatedGoals)
    localStorage.setItem('user_goals', JSON.stringify(updatedGoals))
  }

  const handleDeleteGoal = (id) => {
    const updatedGoals = goals.filter(g => g.id !== id)
    setGoals(updatedGoals)
    localStorage.setItem('user_goals', JSON.stringify(updatedGoals))
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="user-avatar">
            <img
              src={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="Avatar"
            />
          </div>
          <div className="user-info">
            <h2>{profile?.name || user?.name || 'User'}</h2>
            <p>{profile?.email || user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'tab-active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={activeTab === 'profile' ? 'tab-active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={activeTab === 'goals' ? 'tab-active' : ''}
          onClick={() => setActiveTab('goals')}
        >
          🎯 My Goals
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="welcome-card">
              <h3>Welcome, {profile?.name || user?.name}! 👋</h3>
              <p>Complete your profile to get started on your learning journey</p>
            </div>

            <div className="recent-activity-card">
              <h3>📅 Recent Activity</h3>
              {activity.length > 0 ? (
                <div className="activity-list">
                  {activity.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">
                        {item.type === 'signup' ? '✅' :
                         item.type === 'profile_update' ? '✏️' :
                         item.type === 'progress_update' ? '📈' :
                         item.type === 'bookmark' ? '💾' : '📌'}
                      </div>
                      <div className="activity-details">
                        <p className="activity-description">{item.description}</p>
                        <p className="activity-time">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-activity">No recent activity</p>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="profile-card">
              <div className="profile-header">
                <h3>👤 Profile Information</h3>
                {!editMode && (
                  <button className="btn-edit" onClick={() => setEditMode(true)}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {saveMessage && (
                <div className="save-message">{saveMessage}</div>
              )}

              <div className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    disabled={!editMode}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    disabled={!editMode}
                    placeholder="Enter your location"
                  />
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    disabled={!editMode}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="ta">தமிழ்</option>
                    <option value="te">తెలుగు</option>
                    <option value="bn">বাংলা</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    disabled={!editMode}
                    placeholder="Tell us about yourself"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., JavaScript, Python, Design"
                  />
                </div>

                <div className="form-group">
                  <label>Interests (comma separated)</label>
                  <input
                    type="text"
                    value={form.interests}
                    onChange={(e) => setForm({ ...form, interests: e.target.value })}
                    disabled={!editMode}
                    placeholder="e.g., Web Development, AI, Photography"
                  />
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button className="btn-save" onClick={handleProfileUpdate}>
                      💾 Save Changes
                    </button>
                    <button className="btn-cancel" onClick={() => setEditMode(false)}>
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Goals Tab */}
        {activeTab === 'goals' && (
          <div className="goals-tab">
            <div className="goals-card">
              <h3>🎯 My Goals</h3>
              <p className="goals-subtitle">Keep track of what you want to achieve</p>

              <div className="add-goal-section">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g., Complete React course by next week"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <button className="btn-add-goal" onClick={handleAddGoal}>
                  ➕ Add Goal
                </button>
              </div>

              <div className="goals-list">
                {goals.length > 0 ? (
                  goals.map((goal) => (
                    <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                      <div className="goal-checkbox">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => handleToggleGoal(goal.id)}
                        />
                      </div>
                      <div className="goal-content">
                        <p className="goal-text">{goal.text}</p>
                        <p className="goal-date">Created: {new Date(goal.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        className="btn-delete-goal"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-goals">No goals yet. Add your first goal above!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
