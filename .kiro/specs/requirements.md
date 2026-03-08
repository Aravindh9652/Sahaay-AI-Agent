# SAHAAY Requirements (2026)

## 1. Platform Overview

SAHAAY is an all-in-one AWS-powered platform for Indian citizens, providing:
- CivicHub: government schemes info
- Education: courses and guides
- Market: e-commerce basics
- Translate: multi-language text and speech translation
- Profile, Signup, Login: user management
- Voice input and translation for accessibility

### 1.1 AWS Services Used
- Amazon Bedrock (Nova Lite): AI Q&A, fallback translation
- AWS Translate: real-time text translation
- AWS Transcribe: speech-to-text
- S3: document storage, audio uploads
- DynamoDB: user and query storage
- Lambda: serverless backend
- CloudWatch: logging for demo visibility

### 1.2 User Flows
- Signup/Login with email/password (bcrypt, JWT)
- Browse schemes, courses, market guides
- Translate text or speech (voice input)
- Profile management
- All features accessible in Hindi, Tamil, Telugu, Bengali, English

## 2. Functional Requirements

### 2.1 Authentication
- User registration (email, password, phone, location, language)
- Login/logout, JWT session
- Demo account: demo@sahaay.com / demo123

### 2.2 CivicHub
- 6 government schemes, full details, search/filter
- Links to official portals

### 2.3 Education
- 8 courses, guides, and progress tracking

### 2.4 Market
- 4 e-commerce guides

### 2.5 Translate
- Text translation: AWS Translate → Bedrock fallback
- Speech-to-text: AWS Transcribe
- Voice input: browser SpeechRecognition + MediaRecorder
- Multi-language support

### 2.6 Profile
- View/edit profile, language, phone, bio

### 2.7 Logging & Monitoring
- All AWS service calls logged to CloudWatch
- Judges can see real AWS activity

### 2.8 Accessibility
- Mobile-first, info badges, voice-first
- Minimal data collection, privacy-focused

## 3. Non-Functional Requirements
- Responsive UI (React + Vite)
- Fast, low-latency translation
- Secure password storage
- No sensitive data stored
- Works locally for hackathon demo

**REQ-CIVIC-002: External Portal Integration** ✓ IMPLEMENTED
Direct links to verified URLs:
- PM Kisan: https://pmkisan.gov.in/
- Ayushman Bharat: https://pmjay.gov.in/
- Skill India: https://www.nsdc.org.in/
- Swachh Bharat: https://swachhbharat.mygov.in/
- Startup India: https://www.startupindia.gov.in/
- Digital India: https://www.digitalindia.gov.in/

**REQ-CIVIC-003: Civic Information** ✓ PARTIALLY IMPLEMENTED
- Scheme details and application guidance
- Eligibility criteria clearly displayed
- Benefits and beneficiary information
- Future: Emergency services and legal resources

### 2.3 Education Module

**REQ-EDU-001: Course Catalog** ✓ IMPLEMENTED
- System provides 8 curated courses across Tech, Business, Career
- Courses categorized by difficulty: Beginner, Intermediate, Advanced
- Each course shows estimated duration and enrollment count
- YouTube video integration for each course

**REQ-EDU-002: Course Content** ✓ IMPLEMENTED
Available courses with real YouTube video IDs:
1. Digital Skills 101 (Tech, Beginner, 2h) - Video: w67LX0akI3c
2. Basic Accounting for Farmers (Business, Intermediate, 3h) - Video: V_qf1d5HUk4
3. Online Safety & Privacy (Tech, Beginner, 1.5h) - Video: HaXuMVjbOeo  
4. Market Trends Analysis (Business, Advanced, 4h) - Video: KRLzzRnkI5w
5. Resume Writing (Career, Beginner, 2h) - Video: y8OnoxKU✔U
6. Interview Preparation (Career, Intermediate, 3h) - Video: X9XwYPaB_F4
7. E-commerce Basics (Business, Beginner, 2.5h) - Video: 4DKTJj9CPHE
8. Content Creation Masterclass (Tech, Intermediate, 3.5h) - Video: LWOdkI45cyc

**REQ-EDU-003: Progress Tracking**
- System shall track user progress for each course
- System shall display visual progress bars
- System shall allow users to mark lessons as complete
- System shall calculate and display completion percentage

**REQ-EDU-004: Course Filtering**
- System shall allow filtering courses by category
- System shall allow filtering by difficulty level
- System shall display course recommendations based on user profile

### 2.4 Market & Economic Hub

**REQ-MARKET-001: Opportunity Listings** ✓ IMPLEMENTED
- System displays 8 opportunities (jobs, internships, grants, scholarships)
- Shows salary/prize, deadline, and views count
- Includes company career page links
- Location information with embedded Google Maps
- Categories: Jobs, Internships, Grants, Scholarships

**REQ-MARKET-002: External Links Integration** ✓ IMPLEMENTED
Opportunities linked to real external resources:
- Jobs: LinkedIn job search by location and role
- Internships: LinkedIn internship opportunities
- Grants: Government startup grants portal
- Scholarships: Online course platforms (Coursera)
- System shall allow artisans to list handicrafts and local products
**REQ-MARKET-003: Google Maps Location Display** ✓ IMPLEMENTED
- Embedded Google Maps for each opportunity's location
- Shows job location coordinates
- Direct "View on Google Maps" button
- Location-based opportunity filtering
- Distance visualization on map

### 2.5 Resource Library (New Feature) ✓ IMPLEMENTED

**REQ-RES-001: Location-Based Resource Discovery** ✓ IMPLEMENTED
- Users enable browser geolocation (optional)
- System calculates distances to 20+ multi-type resources
- Search radius adjustable from 5-200 km via slider
- Quick access buttons: 25km, 50km, 100km, 150km
- Resources auto-sorted by proximity distance
- Distance displayed in kilometers with location badge

**REQ-RES-002: Multi-Type Resources** ✓ IMPLEMENTED
20 resources spanning 6 categories:
- **Books** (3): Indian literature, STEM textbooks, competitive exam guides
- **Libraries** (4): National Central Library Delhi, Anna Centenary Chennai, etc.
- **Learning Centers** (4): IIT Delhi, NIT Bangalore, BITS Pilani, etc.
- **Online Platforms** (5): NPTEL, Khan Academy, Coursera, edX, Udacity
- **Government Schemes** (2): Skill India, Digital India programs
- **Study Groups** (2): Community learning centers in metro cities

**REQ-RES-003: Geolocation Integration** ✓ IMPLEMENTED
- Browser geolocation request with user permission
- Fallback message if geolocation denied
- Manual location entry as future option
- Latitude/longitude coordinates for all resources
- Real resource locations across 8 Indian cities

**REQ-RES-004: Google Maps Integration** ✓ IMPLEMENTED
- Google Maps Embed iframe for each resource location
- Map view showing user location + all nearby resources
- "View on Google Maps" button for navigation
- Distance calculation using Haversine formula (lat/lng → km)
- Zoom capabilities and interactive map controls

**REQ-RES-005: Resource Detail View** ✓ IMPLEMENTED
- Modal display with resource name, type, location
- Operating hours and contact information
- Number of available courses/books
- Embedded Google Maps location display
- Bookmark/save functionality
- "Learn More" external links

**REQ-RES-006: View Modes** ✓ IMPLEMENTED
- **List View**: Cards sorted by distance, shows distance badge
- **Map View**: Interactive Google Maps with user location center
- Toggle between views via button
- Default to list after location detection

### 2.6 Translation & Voice Service

**REQ-LANG-001: Multilingual Support**
- System shall support 5 Indian languages:
  - English (en)
  - Hindi (hi) - हिन्दी
  - Tamil (ta) - தமிழ்
  - Telugu (te) - తెలుగు
  - Bengali (bn) - বাংলা

**REQ-LANG-002: Voice Input**
- System shall support speech-to-text using Web Speech API
- System shall provide real-time speech recognition
- System shall support language auto-detection
- System shall handle voice input errors gracefully

**REQ-LANG-003: Voice Output**
- System shall support text-to-speech in all supported languages
- System shall provide natural voice synthesis
- System shall allow adjustable speech rate
- System shall support voice output for all text content

**REQ-LANG-004: Translation Service**
- System shall provide dictionary-based translation for 100+ common phrases
- System shall support AI-powered translation for complex queries
- System shall maintain translation accuracy above 90%
- System shall support offline translation for common phrases

**REQ-LANG-005: Language Persistence** ✓ IMPLEMENTED
- System saves user language preference to localStorage
- Language preference applies across all pages/modules
- Language switching works at any time
- RTL support for right-to-left languages (Hindi, Tamil, Telugu, Bengali)
- HTML document language attribute updates dynamically

### 2.7 User Dashboard

**REQ-DASH-001: Personalized Welcome**
- System shall display personalized greeting with user name
- System shall show user profile information
- System shall display quick access to recent activities

**REQ-DASH-002: Activity Tracking**
- System shall track and display:
  - Messages sent count
  - Lessons completed count
  - Queries made count
- System shall update statistics in real-time

**REQ-DASH-003: Learning Progress Overview**
- System shall display overall learning progress
- System shall show course completion status
- System shall recommend next steps based on progress

**REQ-DASH-004: Notifications**
- System shall display notifications for new schemes
- System shall alert users about course updates
- System shall notify about market opportunities
- System shall support notification preferences

**REQ-DASH-005: PDF Handbook Generation**
- System shall generate downloadable PDF handbook
- System shall include user's saved information
- System shall provide single-page summary format
- System shall support offline access to handbook

### 2.8 User Profile Management

**REQ-PROFILE-001: Profile Editing**
- System shall allow users to edit personal information
- System shall support profile picture upload
- System shall validate profile data before saving

**REQ-PROFILE-002: Language Preference**
- System shall allow users to set default language
- System shall apply language preference globally
- System shall persist language preference

**REQ-PROFILE-003: Account Settings**
- System shall provide password change functionality
- System shall allow email update with verification
- System shall support account deletion

## 4. Data Storage Specifications

### 4.1 AWS S3 Configuration (Production)
**Storage Format:**
- Bucket: JSON document containing all users
- File: `users.json` in S3 bucket root
- Versioning: Enabled for recovery
- Format: UTF-8 JSON

**User Data Structure:**
```javascript
{
  id: "UUID-crypto",
  email: "user@example.com",
  passwordHash: "bcrypt-hash",
  name: "User Name",
  phone: "+91-XXXXX-XXXXX",
  createdAt: "2024-02-26T10:30:00Z",
  lastLogin: "2024-02-26T15:45:00Z",
  profile: { /* user profile data */ },
  progress: { /* course progress */ },
  bookmarks: { /* saved resources */ },
  activity: { /* user activity log */ }
}
```

**Required AWS Permissions:**
- `s3:GetObject` - Read users.json
- `s3:PutObject` - Write/update users.json
- `s3:ListBucket` - List objects

### 4.2 Non-AWS Configuration (Development)
**Storage Location:** `server/data/users.json`
**Format:** Local JSON file (auto-created if missing)
**No credentials required** - Perfect for:
- Local development
- Offline testing
- CI/CD pipelines without AWS
- Demo environments

**Auto-Detection Logic:**
```javascript
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  USE_LOCAL_STORAGE = true;  // Fallback to local JSON
}
```

## 5. Non-Functional Requirements

### 5.1 Performance

**REQ-PERF-001: Response Time**
- System shall load pages within 3 seconds on 3G networks
- System shall respond to user interactions within 1 second
- System shall process voice input within 2 seconds

**REQ-PERF-002: Scalability**
- System shall support 10,000 concurrent users
- System shall handle 100,000 daily active users
- System shall scale horizontally for increased load

### 5.2 Accessibility

**REQ-ACCESS-001: Voice-First Design**
- System shall provide complete functionality via voice commands
- System shall support voice-only navigation
- System shall work for users with visual impairments

**REQ-ACCESS-002: Low Literacy Support**
- System shall use simple, clear language
- System shall provide icon-based navigation
- System shall minimize text-heavy interfaces
- System shall support audio feedback for all actions

**REQ-ACCESS-003: Mobile Optimization**
- System shall be fully responsive on mobile devices
- System shall work on devices with screen sizes from 320px to 1920px
- System shall support touch-friendly interfaces
- System shall work on basic smartphones

**REQ-ACCESS-004: Offline Capability**
- System shall provide offline dictionary for common phrases
- System shall cache essential data for offline access
- System shall sync data when connection is restored

### 5.3 Security

**REQ-SEC-001: Authentication Security**
- System shall use JWT tokens for authentication
- System shall hash passwords with bcrypt (10 salt rounds)
- System shall implement CORS protection
- System shall validate all user inputs

**REQ-SEC-002: Data Protection**
- System shall encrypt sensitive data in transit (HTTPS)
- System shall not store sensitive information (Aadhaar, bank details)
- System shall implement secure session management
- System shall support environment variables for secrets

**REQ-SEC-003: Privacy**
- System shall collect minimal user data
- System shall provide clear privacy policy
- System shall allow users to delete their data
- System shall anonymize analytics data

### 5.4 Usability

**REQ-USE-001: User Interface**
- System shall provide clean, simple UI design
- System shall use consistent navigation patterns
- System shall provide contextual help
- System shall support keyboard navigation

**REQ-USE-002: Error Handling**
- System shall display user-friendly error messages
- System shall provide recovery options for errors
- System shall log errors for debugging
- System shall never expose technical details to users

**REQ-USE-003: Feedback**
- System shall provide immediate feedback for user actions
- System shall show loading indicators for async operations
- System shall confirm successful operations
- System shall guide users through multi-step processes

### 5.5 Compatibility

**REQ-COMPAT-001: Browser Support**
- System shall work on Chrome 90+
- System shall work on Firefox 88+
- System shall work on Safari 14+
- System shall work on Edge 90+

**REQ-COMPAT-002: Device Support**
- System shall work on Android 8.0+
- System shall work on iOS 13+
- System shall work on desktop browsers
- System shall work on tablets

### 5.6 Reliability

**REQ-REL-001: Availability**
- System shall maintain 99.5% uptime
- System shall handle graceful degradation
- System shall provide fallback for failed services

**REQ-REL-002: Data Integrity**
- System shall validate all data inputs
- System shall prevent data corruption
- System shall maintain data consistency

## 6. Integration Requirements

### 6.1 External Service Integrations

**REQ-INT-001: YouTube Video Integration** ✓ IMPLEMENTED
- Educational videos embedded via YouTube Embed API
- Video IDs stored in course metadata
- Autoplay enabled for seamless learning
- Responsive 16:9 aspect ratio
- Full course details displayed alongside player

**REQ-INT-002: Google Maps Integration** ✓ IMPLEMENTED
- Location visualization for resources and opportunities
- Interactive map with user location + nearby resources
- Responsive embedding with zoom controls
- "View on Maps" direct navigation links
- Distance calculation using Haversine formula

**REQ-INT-003: Government Service Links** ✓ IMPLEMENTED
- Direct links to 6 verified government schemes
- PM Kisan (pmkisan.gov.in)
- Ayushman Bharat (pmjay.gov.in)
- Skill India (nsdc.org.in)
- Swachh Bharat (swachhbharat.mygov.in)
- Startup India (startupindia.gov.in)
- Digital India (digitalindia.gov.in)
- External links open in new tabs for seamless browsing

### 6.2 LinkedIn & Career Integration

**REQ-INT-004: Job & Internship Linking** ✓ IMPLEMENTED
- Dynamic LinkedIn search links based on location/role
- Internship opportunity feeds
- Career page links from company websites
- Scholarship integration with Coursera, Udacity

### 6.3 Future Integration Services

## 7. Constraints

### 7.1 Technical Constraints
- Must use React 18.2 for frontend
- Must use Express.js for backend
- Must support Web Speech API for voice features
- Must work on low-bandwidth networks (2G/3G)

### 7.2 Business Constraints
- Must be free for basic features
- Must support premium tier for advanced features
- Must comply with Indian data protection laws
- Must be scalable to 1 million users

### 7.3 User Constraints
- Must work for users with no prior digital experience
- Must work in areas with poor internet connectivity
- Must support users with basic smartphones
- Must be accessible to users with disabilities

## 8. Success Criteria

### 8.1 User Adoption
- 10,000+ registered users in first 3 months
- 60% monthly active user rate
- 4.5+ star average rating
- 70% user retention after 30 days

### 8.2 Engagement Metrics
- Average session duration: 5+ minutes
- 3+ modules used per user
- 50% of users complete at least one course
- 30% of users access schemes information

### 6.3 Impact Metrics
- ₹50 crore in government benefits accessed
- 5,000+ courses completed
- 1,000+ market connections made
- 95% user satisfaction rate

## 7. Future Enhancements

### 7.1 Phase 2 Features
- Mobile app (Android/iOS)
- 10 additional languages
- 1000+ government schemes
- 50+ courses
- Advanced marketplace features

### 7.2 Phase 3 Features
- All 22 official Indian languages
- State-specific schemes
- 100+ courses
- Supply chain integration
- Offline mobile app

### 7.3 Phase 4 Features
- Government partnerships
- NGO collaborations
- Corporate CSR integration
- Financial services integration
- 1 million+ users
