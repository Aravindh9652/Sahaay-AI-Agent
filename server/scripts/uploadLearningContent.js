/**
 * Upload Learning Content to S3
 * Digital courses, training materials, educational resources
 */

const { uploadSchemeDocument, S3_BUCKET, S3_SCHEMES_PREFIX } = require('../aws/s3Client')

const learningContent = {
  'digital-literacy': {
    title: 'Digital Literacy: Getting Started with Computers',
    content: `DIGITAL LITERACY COURSE

Introduction to Computers and Internet

MODULE 1: COMPUTER BASICS
- What is a computer?
- Hardware components: Monitor, Keyboard, Mouse, CPU
- Understanding the basics
- Turning on and off safely
- Important safety precautions

MODULE 2: OPERATING SYSTEM
- What is Windows?
- Desktop icons and folders
- File management basics
- Creating and organizing folders
- Saving and opening files

MODULE 3: INTERNET BASICS
- What is the Internet?
- Web browsers: Chrome, Firefox, Edge
- Searching for information on Google
- Safe browsing practices
- Email basics: Creating and using email

MODULE 4: ONLINE SAFETY
- Password security
- Avoiding scams and phishing
- Safe online shopping
- Privacy protection
- Reporting suspicious activity

PRACTICAL EXERCISES:
1. Navigate the desktop
2. Create folders and save files
3. Use a web browser to search
4. Create and send emails
5. Practice online safety

DURATION: 4 weeks, 2 hours per week
DIFFICULTY: Beginner
CERTIFICATION: Yes, upon completion`
  },

  'tech-skills': {
    title: 'Essential Tech Skills for Job Seekers',
    content: `TECH SKILLS FOR EMPLOYMENT

Building Skills for Modern Jobs

MODULE 1: WORD PROCESSING
- Microsoft Word fundamentals
- Creating professional documents
- Formatting text and paragraphs
- Using templates
- Mail merge for applications

MODULE 2: SPREADSHEETS & CALCULATIONS
- Excel basics
- Creating budgets and financial records
- Data entry and organization
- Basic formulas and calculations
- Charts and graphs

MODULE 3: PRESENTATION SKILLS
- PowerPoint for business presentations
- Slide design best practices
- Presenting effectively
- Handling audience questions
- Creating impact with visuals

MODULE 4: ONLINE COLLABORATION
- Google Docs and cloud storage
- Team communication tools
- Video conferencing basics
- Remote work essentials
- Digital file management

INDUSTRY APPLICATIONS:
- Administrative jobs
- Data entry positions
- Business support roles
- Customer service
- Small business management

CERTIFICATION PATH:
- Complete all 4 modules
- Pass assessments
- Industry-recognized certificate

DURATION: 6 weeks, 3 hours per week
DIFFICULTY: Intermediate
SALARY EXPECTATION: ₹15,000 - ₹25,000 per month`
  },

  'agricultural-innovation': {
    title: 'Modern Agricultural Techniques & Innovation',
    content: `AGRICULTURAL MODERNIZATION

Improving Yields Through Technology

MODULE 1: SOIL HEALTH & TESTING
- Understanding soil composition
- pH testing and management
- Nutrient requirements
- Organic vs inorganic fertilizers
- Soil conservation techniques

MODULE 2: PRECISION FARMING
- Using technology for better yields
- Drip irrigation systems
- Weather forecasting for farmers
- Pest management techniques
- Water conservation methods

MODULE 3: CROP SELECTION & ROTATION
- Choosing crops by region
- Understanding seasons
- Crop rotation benefits
- Seed selection
- Intercropping advantages

MODULE 4: MARKET LINKAGE
- Direct market access
- Fair pricing
- Quality standards
- Storage and transportation
- Cold chain management

GOVERNMENT SUPPORT:
- PM-KISAN schemes
- Agri-infrastructure subsidies
- Crop insurance programs
- Interest-free loans
- Training programs

SUCCESS STORIES:
- Case studies from successful farmers
- Yield improvements (20-40% increase)
- Income enhancement
- Sustainable farming examples

DURATION: 8 weeks, 2 hours per week
DIFFICULTY: Intermediate
INVESTMENT: ₹50,000 - ₹2,00,000
EXPECTED ROI: 25-35% yearly`
  },

  'entrepreneurship-bootcamp': {
    title: 'Entrepreneurship & Business Development',
    content: `STARTING & SCALING YOUR BUSINESS

From Idea to Successful Enterprise

MODULE 1: BUSINESS FUNDAMENTALS
- Identifying business opportunities
- Market research basics
- Business plan essentials
- Financial planning
- Legal structure (Sole proprietor, Partnership, Company)

MODULE 2: STARTUP REGISTRATION
- GST registration process
- UDYAM registration for MSMEs
- Business licenses needed
- Tax compliance basics
- Bank account for business

MODULE 3: FUNDING & FINANCE
- Startup India scheme
- PM MUDRA loan
- Angel investment
- Crowdfunding
- Managing business finances

MODULE 4: SCALING YOUR BUSINESS
- Hiring and team building
- Marketing strategies
- Online presence
- Customer retention
- Expansion planning

MODULE 5: SUCCESS PRINCIPLES
- Leadership skills
- Decision making
- Risk management
- Resilience and failure
- Work-life balance

GOVERNMENT INCENTIVES:
- Startup India benefits
- Tax holidays (5-7 years)
- Patent protection
- Mentorship programs
- Accelerator programs

CASE STUDIES:
- From ₹0 to ₹1 crore businesses
- Technology startups
- Service businesses
- Retail enterprises
- Manufacturing units

DURATION: 12 weeks, 4 hours per week
DIFFICULTY: Advanced
PREREQUISITE: Business idea required
SUCCESS RATE: 70% businesses succeed within 3 years`
  }
}

async function uploadLearningContent() {
  console.log('[Upload] Starting to upload learning content to S3...\n')
  
  let successCount = 0
  let failCount = 0

  for (const [courseId, courseData] of Object.entries(learningContent)) {
    try {
      console.log(`[Upload] Processing: ${courseData.title}`)
      
      // Create the S3 key path: learn/{courseId}/document.txt
      const s3Key = `learn/${courseId}/document.txt`
      
      // Upload to S3 using the existing function with modified path
      const params = {
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: courseData.content,
        ContentType: 'text/plain; charset=utf-8'
      }

      // Import S3Client
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
      const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
      
      await s3Client.send(new PutObjectCommand(params))
      
      console.log(`✅ Uploaded: ${courseId} → ${s3Key}\n`)
      successCount++
    } catch (error) {
      console.log(`❌ Failed to upload ${courseId}: ${error.message}\n`)
      failCount++
    }
  }

  console.log('\n[Upload] Learning Content Upload Completed!')
  console.log(`✅ Successfully uploaded: ${successCount} courses`)
  console.log(`❌ Failed uploads: ${failCount} courses`)
  console.log(`\nAll learning content available in S3 bucket: ${S3_BUCKET}`)
  console.log(`Location pattern: learn/{courseId}/document.txt`)
}

// Run the upload
uploadLearningContent().catch(error => {
  console.error('Fatal error:', error.message)
  process.exit(1)
})
