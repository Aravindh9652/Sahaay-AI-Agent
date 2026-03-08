/**
 * Upload Civic Content to S3
 * Community initiatives, events, announcements, civic participation
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const S3_BUCKET = process.env.S3_BUCKET || 'sahaay-documents'

const civicContent = {
  'local-initiatives': {
    title: 'Local Community Initiatives',
    content: `LOCAL COMMUNITY INITIATIVES

Empowering Your Community

INITIATIVE 1: VILLAGE HEALTH CAMPS
Description: Monthly health camps in villages
Location: Across 50+ villages in Maharashtra
Services: Free health checkups, vaccinations, counseling
Frequency: First Sunday of each month
Contact: health@sahaay.local
Impact: 10,000+ lives touched annually

INITIATIVE 2: WOMEN EMPOWERMENT GROUPS
Description: Self-help groups for women entrepreneurs
Members: 500+ active members
Training: Business, financial literacy, skills
Benefits: Micro-loans, market access, recognition
Success Rate: 70% women started own business within 1 year

INITIATIVE 3: YOUTH SKILL CENTERS
Description: Free training for unemployed youth
Programs: 20+ different skills offered
Placement Rate: 85% placement after training
Duration: 3-6 months per course
Age Group: 18-40 years
Success Stories: 5,000+ youth employed

INITIATIVE 4: EDUCATIONAL SCHOLARSHIPS
Description: Education support for underprivileged children
Beneficiaries: 1,000+ students annually
Coverage: 50-100% of education costs
Eligibility: Family income < ₹2,00,000/year
Process: Online application, merit-based selection
Result: 95% success rate in board exams

INITIATIVE 5: AGRICULTURAL COOPERATIVE
Description: Farmer collective for better market access
Members: 2,000+ farmers
Services: Bulk buying inputs, collective selling, training
Benefits: 25-40% better returns than individual selling
Transportation: Free collection from farms

INITIATIVE 6: DIGITAL INCLUSION PROGRAM
Description: Bringing internet to remote villages
Coverage: 100+ villages connected
Benefits: Access to government services, job opportunities
Training: Free computer/internet literacy
Success: 80% adoption within villages

HOW TO JOIN:
1. Identify relevant initiative
2. Complete registration form
3. Attend orientation session
4. Start participating
5. Access exclusive benefits

UPCOMING EVENTS:
- Women Entrepreneur Summit: March 15
- Youth Skills Expo: March 25
- Farmer's Conference: April 5
- Community Health Day: April 10
- Digital Inclusion Workshop: April 20

VOLUNTEER OPPORTUNITIES:
- Be an initiative coordinator
- Conduct training sessions
- Mentor youth and entrepreneurs
- Help with event organization
- Community outreach assistance`
  },

  'events-calendar': {
    title: 'Community Events Calendar',
    content: `COMMUNITY EVENTS CALENDAR - 2026

Schedule of Events & Activities

MARCH 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: March 5, 2026
Event: Monthly Health Camp
Location: Village Health Center
Time: 9:00 AM - 5:00 PM
Details: Free health checkups, vaccination, health counseling
Capacity: 500 persons
Registration: Free, on-site

Date: March 12, 2026
Event: Women Entrepreneurs Networking Event
Location: Community Center
Time: 2:00 PM - 6:00 PM
Details: Success story sharing, business networking, pitching
Capacity: 200 persons
Registration: ₹100 (includes snacks)

Date: March 15, 2026
Event: Women Entrepreneur Summit 2026
Location: Main Auditorium
Time: 9:00 AM - 4:00 PM
Speakers: 10+ successful female entrepreneurs
Workshops: Pricing, marketing, financial management
Registration: ₹500

Date: March 20, 2026
Event: Farmer's Organic Farming Workshop
Location: Agricultural Center
Time: 10:00 AM - 3:00 PM
Trainer: Government agriculture expert
Topics: Soil health, pest management, sustainability
Capacity: 100 farmers
Registration: Free

Date: March 25, 2026
Event: Youth Skills Expo 2026
Location: Convention Center
Time: 10:00 AM - 6:00 PM
Features: 20+ skill demos, internship opportunities, career counseling
Attendees: 5,000+ expected
Registration: Free

APRIL 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: April 2, 2026
Event: Digital Literacy Graduation Ceremony
Location: Community Hall
Time: 3:00 PM - 5:00 PM
Details: 200 graduates receiving certificates
Guests: School principal, local MLA
Reception: Yes, with lunch provided

Date: April 5, 2026
Event: Farmer's Conference 2026
Location: Convention Center
Time: 9:00 AM - 5:00 PM
Topics: New seeds, weather patterns, government schemes
Benefits: Free samples, expert consultation
Capacity: 1,000+ farmers

Date: April 10, 2026
Event: Community Health Day
Location: Multiple locations in city
Time: 8:00 AM onwards
Activities: Health walks, fitness sessions, health awareness
Participation: Open to all, Free

Date: April 15, 2026
Event: Youth Entrepreneurship Pitching
Location: Business Incubator Center
Time: 2:00 PM - 7:00 PM
Prize: ₹10 lakhs for top 3 ideas
Your Idea: Submit by April 8

Date: April 20, 2026
Event: Digital Inclusion Workshop
Location: Tech Center
Time: 10:00 AM - 4:00 PM
Topics: Internet basics, government portals, online safety
Capacity: 50 participants
Registration: Free

REGISTRATION PROCESS:
1. Select event from above
2. Click "Register" button
3. Fill your details
4. Receive confirmation email
5. Show confirmation at event
6. Enjoy the event!

HOW TO STAY UPDATED:
- Subscribe to event notifications
- Follow us on social media
- Join WhatsApp community group
- Check website weekly
- Subscribe to newsletter`
  },

  'local-government-announcements': {
    title: 'Official Announcements & Updates',
    content: `LOCAL GOVERNMENT ANNOUNCEMENTS & UPDATES

Official Communications & Notices

RECENT ANNOUNCEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANNOUNCEMENT 1: NEW PM-KISAN SCHEME BENEFITS
Date: March 1, 2026
From: Ministry of Agriculture & Farmers Welfare
Details:
- Additional ₹2,000 per season for organic farming
- Free soil testing expansion
- New helpline: 1800-KISAN-1
Apply By: March 31, 2026
Link: pmkisan.gov.in

ANNOUNCEMENT 2: UDYAM REGISTRATION EXTENDED DEADLINE
Date: February 28, 2026
From: Ministry of MSME
Details:
- Deadline extended to April 30, 2026
- Simplified registration process
- No document submission needed initially
- Online registration available
Benefits: Collateral-free loans, tax benefits
Apply: udyamregistration.gov.in

ANNOUNCEMENT 3: AYUSHMAN BHARAT ENROLLMENT DRIVE
Date: March 5, 2026
From: Health Department
Details:
- Door-to-door enrollment campaign happening
- Free health camps every weekend
- Beneficiary verification streamlined
- Mobile app for health card generation
Location: All villages in district
Contact: 14555 (toll-free)

ANNOUNCEMENT 4: SKILL INDIA SCHOLARSHIP EXTENSION
Date: March 3, 2026
From: Ministry of Skill Development
Details:
- 10,000 additional scholarships available
- 50 new courses added
- Increased stipend: ₹8,000/month
- Job placement guarantee
Eligibility: 18-35 years, completed 12th
Register: skillindia.gov.in

ANNOUNCEMENT 5: STARTUP INDIA - INCUBATION GRANTS
Date: February 25, 2026
From: Department of Industry
Details:
- ₹5 lakh grants for early-stage startups
- Mentorship from industry experts
- Co-working space access free
- Application window open
Apply: startupindia.gov.in

UPCOMING DEADLINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
March 15: PM-KISAN organic farming additional benefit
March 20: Ayushman Bharat enrollment phase 3
March 31: UDYAM registration new deadline
April 5: Skill India scholarship applications close
April 30: Final deadline for all government scheme registrations

IMPORTANT CONTACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Government Helplines:
- Agriculture: 1800-KISAN-1
- Health: 14555
- Business: 1800-UDYAM
- Skills: 1800-SKILL
- Startup: 1800-STARTUP

Email Contacts:
- District Administration: admin@district.gov
- Health Department: health@district.gov
- Commerce Department: commerce@district.gov

OFFICE HOURS:
Monday to Friday: 9:00 AM - 5:00 PM
Saturday: 9:00 AM - 1:00 PM
Closed: Sundays and national holidays

IMPORTANT NOTICES FOR CITIZENS:
✓ Always verify government communications
✓ Beware of fake schemes and scams
✓ Use official portals for registration
✓ Never share bank details online
✓ Report suspicious communications

HOW TO REGISTER FOR SCHEMES:
1. Check eligibility criteria
2. Gather required documents
3. Visit official portal
4. Complete registration
5. Receive confirmation
6. Download certificate
7. Access benefits`
  },

  'community-groups-directory': {
    title: 'Community Groups & Organizations',
    content: `COMMUNITY GROUPS & ORGANIZATIONS DIRECTORY

Network of Communities Helping Each Other

WOMEN EMPOWERMENT GROUPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Group 1: Mahila Swavalambi Society
Members: 150 women
Focus: Business development, financial literacy
Activities: Weekly meetings, monthly training
Leader: Smt. Priya Sharma
Contact: 9876543210
Location: Village Cooperative Center
Success: 45 women started businesses earning ₹1,00,000+/year

Group 2: Women Farmers Cooperative
Members: 200+ women farmers
Focus: Agricultural innovation, market linkage
Activities: Joint cultivation, collective selling
Leader: Smt. Anjali Patel
Products: Organic vegetables, honey, spices
Income Impact: 35% increase in farm income

Group 3: Self Help Group - Stitching Unit
Members: 50 women
Focus: Garment manufacturing, entrepreneurship
Products: Traditional clothes, accessories
Leader: Smt. Radha Bhat
Income: ₹80,000+ per member annually

YOUTH GROUPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Group 1: Youth Digital Skills Forum
Members: 300+ young people
Focus: Tech skills, digital entrepreneurship
Activities: Training, hackathons, startup mentoring
Leader: Mr. Rahul Singh
Achievements: 150+ youth employed in tech

Group 2: Agriculture Innovation Club
Members: 100 farming youth
Focus: Modern farming techniques, innovation
Activities: Experiments, knowledge sharing
Leader: Mr. Vikram Kumar
Innovation: 10+ patents filed by members

Group 3: Community Service Corps
Members: 250+ young volunteers
Focus: Community development, social service
Activities: Cleanliness, health awareness, learning support
Leader: Ms. Neha Desai

FARMER GROUPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Farmer Producer Organization (FPO) Members: 500+
Focus: Collective farming, market access
Services: Input supply, training, marketing
Revenue: ₹50 lakhs annually (farmer income)
Expansion: Opening 5 new centers

ARTISAN GROUPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Handicraft Cooperative
Members: 200+ artisans
Products: Handloom, wood craft, pottery
Market: Online + Offline sales
Income: ₹50,000 - ₹3,00,000 per artisan annually

CIVIC PARTICIPATION GROUPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environment Club
Activities: Tree plantation, waste management
Impact: 50,000+ trees planted

Health Awareness Group
Activities: Health camps, education
Reach: 10,000+ people annually

JOINING REQUIREMENTS:
- Interest in group's focus area
- Willingness to participate regularly
- Group membership fee (if applicable)
- Commitment to community values

HOW TO JOIN:
1. Visit group location
2. Meet group leader
3. Attend orientation session
4. Complete registration
5. Pay membership fee (if any)
6. Start participating

BENEFITS OF JOINING:
✓ Community support and networking
✓ Skill development
✓ Income generation opportunities
✓ Market access
✓ Government scheme access
✓ Recognition and certificates
✓ Social impact participation`
  }
}

async function uploadCivicContent() {
  console.log('[Upload] Starting to upload civic content to S3...\n')
  
  let successCount = 0
  let failCount = 0

  const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

  for (const [contentId, contentData] of Object.entries(civicContent)) {
    try {
      console.log(`[Upload] Processing: ${contentData.title}`)
      
      const s3Key = `civic/${contentId}/document.txt`
      
      const params = {
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: contentData.content,
        ContentType: 'text/plain; charset=utf-8'
      }

      await s3Client.send(new PutObjectCommand(params))
      
      console.log(`✅ Uploaded: ${contentId} → ${s3Key}\n`)
      successCount++
    } catch (error) {
      console.log(`❌ Failed to upload ${contentId}: ${error.message}\n`)
      failCount++
    }
  }

  console.log('\n[Upload] Civic Content Upload Completed!')
  console.log(`✅ Successfully uploaded: ${successCount} civic guides`)
  console.log(`❌ Failed uploads: ${failCount} guides`)
  console.log(`\nAll civic content available in S3 bucket: ${S3_BUCKET}`)
  console.log(`Location pattern: civic/{contentId}/document.txt`)
}

uploadCivicContent().catch(error => {
  console.error('Fatal error:', error.message)
  process.exit(1)
})
