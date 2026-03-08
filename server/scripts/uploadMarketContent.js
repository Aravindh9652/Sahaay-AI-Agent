/**
 * Upload Market Content to S3
 * Seller guides, buyer guides, product categories, market information
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const S3_BUCKET = process.env.S3_BUCKET || 'sahaay-documents'

const marketContent = {
  'seller-comprehensive-guide': {
    title: 'Complete Guide for Sellers',
    content: `SELLER'S COMPREHENSIVE GUIDE

How to Sell Successfully on SAHAAY Marketplace

SECTION 1: REGISTRATION & SETUP
- Creating a seller account
- KYC verification process
- Bank account linking
- Identifying documents needed
- Approval timeline (48-72 hours)

SECTION 2: PRODUCT LISTING
- Photography tips for better sales
- Writing compelling product descriptions
- Pricing strategies
- Seasonal products
- Bulk upload options

SECTION 3: QUALITY STANDARDS
- Product quality guidelines
- Packaging requirements
- Certification needs (if applies)
- Food safety (for food products)
- Standards compliance

SECTION 4: PRICING & PROFITABILITY
- How to calculate costs
- Competitive pricing
- Markup strategies
- Handling discounts
- Seasonal pricing adjustments

SECTION 5: PAYMENT & COMMISSIONS
- Platform commission structure (8-15%)
- Payment settlement (within 2-5 days)
- Tax implications
- Invoice generation
- Payment methods available

SECTION 6: SHIPPING & LOGISTICS
- Packaging materials needed
- Partnered courier options
- Shipping cost calculation
- International shipping (if available)
- Returns handling

SECTION 7: CUSTOMER COMMUNICATION
- Responding to inquiries quickly
- Building customer trust
- Handling complaints professionally
- Resolving disputes
- Maintaining ratings

SECTION 8: SCALING YOUR BUSINESS
- Expanding product range
- Seasonal planning
- Bulk orders management
- B2B opportunities
- Success metrics to track

COMPLIANCE CHECKLIST:
☑ GST registration
☑ Product certifications
☑ Insurance coverage
☑ Return policy defined
☑ Privacy policy agreement

TOP SELLER TIPS:
- Maintain 95%+ rating
- Respond within 2 hours
- Use high-quality photos
- Clear descriptions reduce returns
- Promotions drive sales`
  },

  'buyer-protection-guide': {
    title: 'Buyer Protection & Safe Shopping',
    content: `BUYER'S PROTECTION GUIDE

Shop with Confidence on SAHAAY

SECTION 1: ACCOUNT SAFETY
- Creating a secure password
- Two-factor authentication
- Protecting personal information
- Privacy settings
- Reporting suspicious activity

SECTION 2: PRODUCT SELECTION
- Reading seller reviews
- Checking product ratings
- Understanding certifications
- Identifying genuine sellers
- Avoiding counterfeit products

SECTION 3: SECURE PAYMENT
- Payment methods available
- Secure payment gateway
- Money-back guarantee period
- Refund process
- Chargeback protection

SECTION 4: PRODUCT QUALITY GUARANTEE
- Authentic product promise
- Quality inspection guarantee
- Manufacturing defect coverage
- Return window (30 days)
- Exchange options

SECTION 5: DISPUTE RESOLUTION
- Filing a complaint (step-by-step)
- Evidence submission
- Mediation process
- Refund timeline
- Escalation options (if needed)

SECTION 6: SHIPPING & DELIVERY
- Tracking order status
- Expected delivery timeline
- Damage during shipping
- Lost package claims
- Delivery options (Home/Store)

SECTION 7: RATING & REVIEW
- How ratings help other buyers
- Providing honest feedback
- Photo/video reviews
- Reviewer badge benefits
- Discounts for reviewers

CONSUMER RIGHTS:
- Right to information
- Right to protection
- Right to compensation
- Right to be heard
- Right to consumer education

RED FLAGS TO WATCH:
🚩 Prices too good to be true
🚩 Seller with no reviews
🚩 Pressure to pay outside platform
🚩 Spelling/grammar errors in listing
🚩 Requests for personal banking info

CUSTOMER SUPPORT CONTACTS:
- Chat: Available 24/7
- Email: support@sahaay.com
- Phone: 1800-SAHAAY-1
- WhatsApp: Official support number
- Social Media: Direct messages`
  },

  'product-categories-index': {
    title: 'Product Categories & Inventory',
    content: `SAHAAY MARKETPLACE PRODUCT CATEGORIES

Complete Inventory Guide

1. AGRICULTURAL PRODUCTS
   ├── Fresh Vegetables (₹20-100/kg)
   │   └── Tomatoes, Onions, Potatoes, Leafy Greens
   ├── Fruits (₹30-200/kg)
   │   └── Mangoes, Bananas, Apples, Citrus
   ├── Grains & Pulses (₹40-150/kg)
   │   └── Rice, Wheat, Dal, Lentils
   ├── Spices (₹100-500/kg)
   │   └── Turmeric, Chili, Coriander, Cumin
   └── Organic Products (₹80-300/kg)
       └── Certified organic variants

2. HANDICRAFTS & ARTISAN GOODS
   ├── Textiles (₹500-5000)
   │   └── Handloom, Embroidered items
   ├── Pottery & Ceramics (₹300-3000)
   │   └── Handmade utensils, decorative items
   ├── Wood Crafts (₹400-4000)
   │   └── Furniture, decorative pieces
   ├── Metal Crafts (₹600-6000)
   │   └── Brass, copper, iron items
   └── Jewelry (₹1000-20000)
       └── Traditional, semi-precious

3. SPECIALTY FOODS
   ├── Honey & Beekeeping (₹300-800/kg)
   │   └── Pure, certified organic
   ├── Ghee & Oils (₹400-1200/liter)
   │   └── Cow ghee, mustard, sesame oil
   ├── Pickles & Preserves (₹150-400/jar)
   │   └── Traditional recipes
   ├── Dry Fruits (₹500-2000/kg)
   │   └── Almonds, cashews, walnuts
   └── Tea & Coffee (₹300-1000/kg)
       └── Regional varieties

4. SERVICES & TRAINING
   ├── Online Courses (₹1000-10000)
   │   └── Business, skills, languages
   ├── Freelance Services (₹500-50000)
   │   └── Writing, design, coding
   ├── Consultation (₹2000-10000/hour)
   │   └── Business, agriculture, legal
   └── Training Programs (₹5000-50000)
       └── Short-term skill development

SELLER STATISTICS:
- Active Sellers: 50,000+
- Active Products: 1,000,000+
- Daily Transactions: 100,000+
- Average Rating: 4.7/5 stars
- Buyer Satisfaction: 98%

TRENDING CATEGORIES:
1. Organic products (↑ 45% this quarter)
2. Handmade crafts (↑ 32% this quarter)
3. Regional specialties (↑ 28% this quarter)
4. Training services (↑ 35% this quarter)
5. Sustainable products (↑ 50% this quarter)`
  },

  'market-best-practices': {
    title: 'Marketplace Best Practices & Policies',
    content: `MARKET BEST PRACTICES & POLICIES

Building Trust in Digital Commerce

SECTION 1: PRODUCT AUTHENTICITY
- Verification process for sellers
- Third-party certification checks
- Serial number validation
- Batch tracking
- Recall procedures (if needed)

SECTION 2: PRICING TRANSPARENCY
- No hidden charges policy
- Transparent commission structure
- Tax calculation clarity
- Shipping cost breakdown
- Final price display before checkout

SECTION 3: DELIVERY STANDARDS
- 48-hour processing guarantee
- Real-time tracking
- Insured shipments
- Safe packaging standards
- Delivery confirmation

SECTION 4: CONSUMER GRIEVANCE REDRESSAL
- Single-window complaint system
- 48-hour acknowledgment
- 5-day resolution SLA
- Escalation paths
- Legal compliance

SECTION 5: SELLER CONDUCT
- Prohibited items list
- Ethical selling guidelines
- No harassment policy
- Spam prevention measures
- Account suspension rules

SECTION 6: DATA PRIVACY & SECURITY
- GDPR/PCIDSS compliance
- Encrypted transactions
- Data breach insurance
- Regular security audits
- Privacy policy details

AWARDS & RECOGNITION:
- Best E-commerce Platform Award
- Customer Service Excellence Award
- Sustainability champion recognition
- Seller empowerment initiative
- Women entrepreneur support award

ENVIRONMENTAL COMMITMENT:
- Eco-friendly packaging initiatives
- Carbon-neutral delivery options
- Plastic-free marketplace movement
- Tree planting with every purchase
- Sustainability reports published quarterly`
  }
}

async function uploadMarketContent() {
  console.log('[Upload] Starting to upload market content to S3...\n')
  
  let successCount = 0
  let failCount = 0

  const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

  for (const [contentId, contentData] of Object.entries(marketContent)) {
    try {
      console.log(`[Upload] Processing: ${contentData.title}`)
      
      const s3Key = `market/${contentId}/document.txt`
      
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

  console.log('\n[Upload] Market Content Upload Completed!')
  console.log(`✅ Successfully uploaded: ${successCount} market guides`)
  console.log(`❌ Failed uploads: ${failCount} guides`)
  console.log(`\nAll market content available in S3 bucket: ${S3_BUCKET}`)
  console.log(`Location pattern: market/{contentId}/document.txt`)
}

uploadMarketContent().catch(error => {
  console.error('Fatal error:', error.message)
  process.exit(1)
})
