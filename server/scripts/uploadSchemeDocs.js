/**
 * Upload Sample Government Scheme Documents to S3
 * This script populates the sahaay-documents S3 bucket with scheme information
 * for the AWS Hackathon demo
 */

const { uploadSchemeDocument, S3_BUCKET, S3_SCHEMES_PREFIX } = require('../aws/s3Client')

const schemeDocs = {
  'pm-kisan': {
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    content: `Government Scheme: PM-KISAN
    
Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a centrally sponsored scheme with 100% funding from the Government of India. It aims to support all landholding farmers across the country.

ELIGIBILITY:
- All landholding farmers (irrespective of age and gender)
- Must be registered as cultivators/farmers
- Eligible landholding size: up to 2 hectares

BENEFITS:
- Direct monetary support: ₹6,000 per year per farmer
- Transferred directly to bank account in 3 installments
- No collateral or paperwork required

APPLICATION PROCESS:
1. Register on PM-KISAN portal (pmkisan.gov.in)
2. Provide Aadhaar number or land records
3. Link with bank account
4. Verify through video call
5. Funds credited automatically

REQUIRED DOCUMENTS:
- Aadhaar card
- Bank account number and IFSC code
- Land ownership certificate or lease agreement
- Voter ID (optional)

CONTACT SUPPORT:
- Helpline: 1800-110-001
- Email: pmkisan-ict@nic.in
- Website: pmkisan.gov.in`
  },
  
  'ayushman-bharat': {
    title: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    content: `Government Scheme: Ayushman Bharat - PM-JAY

Pradhan Mantri Jan Arogya Yojana (PM-JAY) is India's largest government healthcare scheme providing health insurance coverage to underprivileged families.

ELIGIBILITY:
- Families in Socio Economic Caste Census (SECC) 2011 database
- Monthly income: Below ₹1,00,000 (rural), ₹1,00,000 (urban)
- Automatically eligible if from targeted category

BENEFITS:
- Health insurance coverage: ₹5 lakhs per year per family
- Secondary and tertiary hospitalization coverage
- Free pre-hospitalization and post-hospitalization care
- No limit on age or number of family members

COVERED SERVICES:
- Major surgeries
- Cancer treatment
- Cardiac procedures
- Mental health services
- Maternity and newborn care
- Over 1,350 procedures covered

HOW TO APPLY:
1. Check eligibility on pmjay.gov.in
2. Visit nearest Arogya Mitra center
3. Get ABHA number (Health ID)
4. Register at network hospital
5. Access treatment at authorized hospitals

REQUIRED DOCUMENTS:
- Aadhaar card
- SECC family ID (if available)
- Mobile number for updates
- Bank account for reimbursement (if needed)

NETWORK HOSPITALS:
- Over 24,000 government and private hospitals
- Available across India

CONTACT:
- Helpline: 14555
- Website: pmjay.gov.in`
  },
  
  'skill-india': {
    title: 'Skill India Mission - Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    content: `Government Scheme: Skill India Mission - PMKVY

Pradhan Mantri Kaushal Vikas Yojana (PMKVY) is India's flagship skill development program providing industry-aligned training.

ELIGIBILITY:
- Age: 18-55 years
- Educational qualification: 10+2 pass
- Indian citizens (including diaspora)
- Priority to SC/ST/OBC/minority communities

BENEFITS:
- Free training in 500+ skill trades
- Industry-recognized certifications
- Placement assistance after training
- Stipend during training: Up to ₹8,000
- Job guarantee programs

TRAINING AREAS:
- Information Technology
- Healthcare & Wellness
- Manufacturing
- Hospitality & Tourism
- Agriculture
- Construction
- Textiles
- Renewable Energy
- Logistics

HOW TO APPLY:
1. Visit pmkvy.gov.in or nearest NSDC training partner
2. Select desired skill course
3. Attend free training (3-12 months)
4. Pass assessment by authorized body
5. Receive certificate and job placement support

REQUIRED DOCUMENTS:
- Aadhaar card
- 10+2 certificate
- Bank account proof
- Address proof

PLACEMENT SUPPORT:
- 100+ job sites partnerships
- Resume building assistance
- Interview coaching
- Job board access

CONTACT:
- Helpline: 8800-055-555
- Website: pmkvy.gov.in
- Email: pmkvy@nsdcindia.org`
  },

  'digital-skills': {
    title: 'Digital Saksharta Abhiyaan (DISHA) - Free Digital Literacy',
    content: `Government Scheme: Digital Saksharta Abhiyaan (DISHA)

Digital Saksharta Abhiyaan promotes digital literacy across India, especially among marginalized communities and rural populations.

ELIGIBILITY:
- Age: 14-60 years
- Basic literacy (can read/write)
- Priority: SC/ST/OBC/women/disabled persons
- Rural and urban citizens

BENEFITS:
- Free computer literacy training
- Smartphone/digital device basic training
- Internet safety awareness
- Digital financial literacy
- Certificate of digital literacy

TRAINING CONTENT:
- Computer basics (hardware, software)
- Email and messaging
- Digital government services access
- Online banking
- E-commerce basics
- Cyber security basics
- Social media safety

HOW TO ACCESS:
1. Find nearest training center via disha.ndlm.gov.in
2. Register with Aadhaar number
3. Attend 20-30 hours of free training
4. Complete assessment
5. Receive digital literacy certificate

TRAINING DURATION:
- Typically 1-2 months
- Flexible timing (evening/weekend classes available)
- Small groups (10-15 participants)

REQUIRED DOCUMENTS:
- Aadhaar card or voting card
- Address proof
- Educational qualification proof

CENTERS:
- Available in villages with 1000+ population
- CSC e-Governance centers
- Government schools and colleges

IMPACT:
- Over 45 million trained
- 500+ digital skills covered
- 24/7 helpline support`
  },

  'startup-india': {
    title: 'Startup India - Support for Entrepreneurs',
    content: `Government Initiative: Startup India

Startup India is a comprehensive initiative by the Government of India to foster startup culture and accelerate entrepreneurship and job creation in India.

ELIGIBILITY FOR RECOGNITION:
- Indian entity (registered as private company, LLP, or partnership firm)
- Age: Not more than 10 years from incorporation
- Revenue: Less than ₹100 crores in any year
- Innovation: Focused on developing new products/processes

BENEFITS:
1. TAX BENEFITS:
   - 100% tax deduction on profits for 3 years
   - No Angel tax on fund raising

2. FUNDING SUPPORT:
   - Access to ₹10,000 crore Fund of Funds
   - Credit guaranteed scheme for loans
   - Equity support up to ₹50 lakhs

3. COMPLIANCE BENEFITS:
   - Single-window clearance
   - Fast-track patent examination
   - Compliance relaxation for 5 years
   - Self-certification on labor laws

4. MARKET ACCESS:
   - Government procurement preference
   - Trade fair subsidies
   - Export support

5. MENTORSHIP:
   - NASSCOM, DSIR expert mentoring
   - Bilateral startup partnerships
   - Industry mentor network

HOW TO APPLY:
1. Register on startupindia.gov.in
2. Submit business plan and documentation
3. Get recognition letter from DPIIT
4. Access government benefits

REQUIRED DOCUMENTS:
- Certificate of Incorporation
- Detailed business plan
- Board resolution
- Financial statements
- Photo ID of founders
- Residence proof

FOCUS SECTORS:
- Information Technology
- Biotechnology
- Clean Energy
- Consumer Products
- Financial Services
- Agriculture Tech
- Healthcare
- Manufacturing

SUPPORT NETWORK:
- 92 NASSCOM centers
- 500+ mentors
- 165+ incubators
- Partnership with universities

CONTACT:
- Email: support@startupindia.gov.in
- Website: startupindia.gov.in
- Helpline: 1800-570-8000`
  }
}

async function uploadAllSchemes() {
  console.log('\n[Upload] Starting to upload scheme documents to S3...\n')
  
  let uploaded = 0
  let failed = 0

  for (const [schemeId, { title, content }] of Object.entries(schemeDocs)) {
    try {
      console.log(`[Upload] Processing: ${title}`)
      
      // Upload as text document
      const key = await uploadSchemeDocument(schemeId, content, 'txt')
      console.log(`✅ Uploaded: ${schemeId} → ${key}\n`)
      uploaded++
    } catch (error) {
      console.error(`❌ Failed to upload ${schemeId}: ${error.message}\n`)
      failed++
    }
  }

  console.log('\n[Upload] Completed!')
  console.log(`✅ Successfully uploaded: ${uploaded} documents`)
  console.log(`❌ Failed uploads: ${failed} documents`)
  console.log(`\nAll documents available in S3 bucket: ${S3_BUCKET}`)
  console.log(`Location pattern: ${S3_SCHEMES_PREFIX}{schemeId}/document.txt`)
}

// Run if called directly
if (require.main === module) {
  uploadAllSchemes().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
}

module.exports = { uploadAllSchemes, schemeDocs }
