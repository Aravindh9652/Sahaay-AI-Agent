/**
 * Test Routes for AWS Hackathon Demo
 * These endpoints demonstrate each AWS service integration with full CloudWatch logging
 */

const express = require('express')
const router = express.Router()

// AWS Service imports
const { invokeBedrockModel } = require('../aws/bedrockClient')
const { 
  getSchemeDocument, 
  listAvailableSchemes,
  getLearningDocument,
  listLearningCourses,
  getMarketDocument,
  listMarketGuides,
  getCivicDocument,
  listCivicContent
} = require('../aws/s3Client')
const { transcribeAudio, listTranscriptionJobs, getTranscriptionJobStatus, createDemoTranscriptionJob } = require('../aws/transcribeClient')
const { getQueryHistory, storeQuery } = require('../aws/dynamodbClient')
const { logApiCall, logUserActivity } = require('../aws/cloudwatchLogger')

// Middleware to track API calls
router.use((req, res, next) => {
  req.startTime = Date.now()
  next()
})

/**
 * Test Bedrock API - Invoke Claude 3 Haiku model
 * GET /api/test/bedrock
 * Query: ?prompt=<prompt>
 */
router.get('/bedrock', async (req, res) => {
  try {
    const prompt = req.query.prompt || 'Explain the PM-KISAN government scheme in 100 words for an Indian farmer.'
    
    console.log(`[Test] Bedrock test called with prompt: ${prompt.substring(0, 50)}...`)
    
    const response = await invokeBedrockModel(prompt, {
      temperature: 0.7,
      maxTokens: 512
    })

    const duration = Date.now() - req.startTime
    
    // Store query in DynamoDB sahaay-queries table (save only user's question, not system prompt)
    try {
      const userQuestion = prompt.replace(/^.*?:\s*/, '')
      await storeQuery('ai-assistant', userQuestion, response, 'en')
    } catch (dbErr) {
      console.warn('[DynamoDB] Could not store query:', dbErr.message)
    }

    // Log API call to CloudWatch
    logApiCall('/api/test/bedrock', 'GET', 'success', duration, 'test-user')
    
    res.json({
      ok: true,
      service: 'Bedrock (Claude 3 Haiku)',
      prompt: prompt.substring(0, 100) + '...',
      response: response,
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[BEDROCK] Model invoked for test query`,
        tokens: 512
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/bedrock', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'Bedrock invocation failed',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED'
      }
    })
  }
})

/**
 * Test S3 SchemeDocument Retrieval
 * GET /api/test/schemes
 * Query: ?schemeId=<schemeId> (default: pm-kisan)
 */
router.get('/schemes', async (req, res) => {
  try {
    const schemeId = req.query.schemeId || 'pm-kisan'
    
    console.log(`[Test] S3 scheme retrieval test: ${schemeId}`)
    
    const document = await getSchemeDocument(schemeId, 'txt')
    
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/schemes', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (Scheme Documents)',
      schemeId: schemeId,
      documentSize: `${document.length} bytes`,
      documentPreview: document.substring(0, 200) + '...',
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Document retrieved: s3://sahaay-documents/schemes/${schemeId}/document.txt`,
        operation: 'GetDocument',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/schemes', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'S3 document retrieval failed',
      message: error.message,
      schemeId: req.query.schemeId || 'pm-kisan',
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED',
        operation: 'GetDocument'
      }
    })
  }
})

/**
 * List all available schemes from S3
 * GET /api/test/schemes/list
 */
router.get('/schemes/list', async (req, res) => {
  try {
    console.log('[Test] Listed all available schemes from S3')
    
    const schemes = await listAvailableSchemes()
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/schemes/list', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (List Schemes)',
      schemes: schemes,
      count: schemes.length,
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Listed ${schemes.length} schemes`,
        operation: 'ListSchemes',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/schemes/list', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'Failed to list schemes',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED'
      }
    })
  }
})

/**
 * Test S3 Learning Document Retrieval
 * GET /api/test/learn
 * Query: ?courseId=<courseId> (default: digital-literacy)
 */
router.get('/learn', async (req, res) => {
  try {
    const courseId = req.query.courseId || 'digital-literacy'
    
    console.log(`[Test] S3 learning document retrieval test: ${courseId}`)
    
    const document = await getLearningDocument(courseId, 'txt')
    
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/learn', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (Learning Content)',
      courseId: courseId,
      documentSize: `${document.length} bytes`,
      documentPreview: document.substring(0, 200) + '...',
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Document retrieved: s3://sahaay-documents/learn/${courseId}/document.txt`,
        operation: 'GetDocument',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/learn', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'S3 learning document retrieval failed',
      message: error.message,
      courseId: req.query.courseId || 'digital-literacy',
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED',
        operation: 'GetDocument'
      }
    })
  }
})

/**
 * List all available learning courses from S3
 * GET /api/test/learn/list
 */
router.get('/learn/list', async (req, res) => {
  try {
    console.log('[Test] Listed all available learning courses from S3')
    
    const courses = await listLearningCourses()
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/learn/list', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (List Learning Courses)',
      courses: courses,
      count: courses.length,
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Listed ${courses.length} learning courses`,
        operation: 'ListLearningCourses',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/learn/list', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'Failed to list learning courses',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED'
      }
    })
  }
})

/**
 * Test S3 Market Document Retrieval
 * GET /api/test/market
 * Query: ?guideId=<guideId> (default: seller-comprehensive-guide)
 */
router.get('/market', async (req, res) => {
  try {
    const guideId = req.query.guideId || 'seller-comprehensive-guide'
    
    console.log(`[Test] S3 market document retrieval test: ${guideId}`)
    
    const document = await getMarketDocument(guideId, 'txt')
    
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/market', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (Market Content)',
      guideId: guideId,
      documentSize: `${document.length} bytes`,
      documentPreview: document.substring(0, 200) + '...',
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Document retrieved: s3://sahaay-documents/market/${guideId}/document.txt`,
        operation: 'GetDocument',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/market', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'S3 market document retrieval failed',
      message: error.message,
      guideId: req.query.guideId || 'seller-comprehensive-guide',
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED',
        operation: 'GetDocument'
      }
    })
  }
})

/**
 * List all available market guides from S3
 * GET /api/test/market/list
 */
router.get('/market/list', async (req, res) => {
  try {
    console.log('[Test] Listed all available market guides from S3')
    
    const guides = await listMarketGuides()
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/market/list', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (List Market Guides)',
      guides: guides,
      count: guides.length,
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Listed ${guides.length} market guides`,
        operation: 'ListMarketGuides',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/market/list', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'Failed to list market guides',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED'
      }
    })
  }
})

/**
 * Test S3 Civic Content Retrieval
 * GET /api/test/civic
 * Query: ?contentId=<contentId> (default: local-initiatives)
 */
router.get('/civic', async (req, res) => {
  try {
    const contentId = req.query.contentId || 'local-initiatives'
    
    console.log(`[Test] S3 civic document retrieval test: ${contentId}`)
    
    const document = await getCivicDocument(contentId, 'txt')
    
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/civic', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (Civic Content)',
      contentId: contentId,
      documentSize: `${document.length} bytes`,
      documentPreview: document.substring(0, 200) + '...',
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Document retrieved: s3://sahaay-documents/civic/${contentId}/document.txt`,
        operation: 'GetDocument',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/civic', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'S3 civic document retrieval failed',
      message: error.message,
      contentId: req.query.contentId || 'local-initiatives',
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED',
        operation: 'GetDocument'
      }
    })
  }
})

/**
 * List all available civic content from S3
 * GET /api/test/civic/list
 */
router.get('/civic/list', async (req, res) => {
  try {
    console.log('[Test] Listed all available civic content from S3')
    
    const content = await listCivicContent()
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/civic/list', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'S3 (List Civic Content)',
      content: content,
      count: content.length,
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[S3] Listed ${content.length} civic items`,
        operation: 'ListCivicContent',
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/civic/list', 'GET', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'Failed to list civic content',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED'
      }
    })
  }
})

/**
 * Simulate Transcribe API - Speech-to-Text
 * POST /api/test/transcribe
 * Body: {
 *   base64Audio: '<base64 encoded audio data>',
 *   language: 'en' (default: auto-detect)
 * }
 */
router.post('/transcribe', async (req, res) => {
  try {
    const { base64Audio, language = 'auto' } = req.body

    if (!base64Audio) {
      return res.status(400).json({ 
        error: 'Missing base64Audio in request body',
        example: {
          base64Audio: '<your base64 encoded audio file>',
          language: 'en'
        }
      })
    }

    console.log(`[Test] Transcribe test with language: ${language}`)

    // Simulate Transcribe job
    const jobName = `transcribe-test-${Date.now()}`
    const transcript = 'This is a simulated transcription of the audio. In a real scenario, this would be the actual speech-to-text result from AWS Transcribe.'
    
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/transcribe', 'POST', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'Transcribe (Speech-to-Text)',
      jobName: jobName,
      status: 'COMPLETED',
      transcript: transcript,
      language: language,
      confidence: 0.95,
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[TRANSCRIBE] Job completed: ${jobName}`,
        jobStatus: 'COMPLETED',
        language: language,
        confidence: 0.95
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/transcribe', 'POST', 'failed', duration, 'test-user')
    
    res.status(500).json({
      error: 'Transcribe simulation failed',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED'
      }
    })
  }
})

/**
 * Create Demo Transcribe Job - Creates real AWS Transcribe jobs visible in console
 * POST /api/test/transcribe/create-demo
 * Body: {
 *   sampleText: 'Sample text for demo', (optional)
 *   language: 'hi' (optional, default: en-US)
 * }
 */
router.post('/transcribe/create-demo', async (req, res) => {
  try {
    const { sampleText = 'Demo transcribe job for judges presentation', language = 'en' } = req.body

    console.log(`[Test] Creating demo transcribe job with language: ${language}`)

    const jobDetails = await createDemoTranscriptionJob(sampleText, language)
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/transcribe/create-demo', 'POST', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'Transcribe (Speech-to-Text)',
      action: 'CREATE_DEMO_JOB',
      jobDetails: jobDetails,
      instructions: {
        viewInConsole: 'Visit https://console.aws.amazon.com/transcribe/ to see your job listed',
        consultLink: 'The job can be found under "Jobs" → "Transcription Jobs" with name starting with "demo-transcribe-"',
        status: 'Job will move from IN_PROGRESS → COMPLETED in 30-120 seconds'
      },
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        operator: '[TRANSCRIBE]',
        status: 'JOB_CREATED'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/transcribe/create-demo', 'POST', 'failed', duration, 'test-user')
    
    console.error('[Test] Demo job creation failed:', error.message)
    res.status(500).json({
      error: 'Failed to create demo transcribe job',
      message: error.message,
      hint: 'Ensure AWS credentials are configured and S3 bucket has transcribe permissions'
    })
  }
})

/**
 * List All Transcribe Jobs - Shows all jobs visible in AWS console
 * GET /api/test/transcribe/jobs
 * Query: ?status=COMPLETED (or FAILED, IN_PROGRESS, or ALL)
 */
router.get('/transcribe/jobs', async (req, res) => {
  try {
    const statusFilter = req.query.status || 'ALL'

    console.log(`[Test] Listing transcribe jobs with status: ${statusFilter}`)

    const jobs = await listTranscriptionJobs({ 
      statusFilter: statusFilter === 'ALL' ? null : statusFilter,
      maxResults: 50
    })
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/transcribe/jobs', 'GET', 'success', duration, 'test-user')

    res.json({
      ok: true,
      service: 'Transcribe (Speech-to-Text)',
      action: 'LIST_JOBS',
      statusFilter: statusFilter,
      jobCount: jobs.length,
      jobs: jobs.map(job => ({
        jobName: job.TranscriptionJobName,
        status: job.TranscriptionJobStatus,
        language: job.LanguageCode || 'auto',
        createdAt: job.CreationTime,
        completedAt: job.CompletionTime,
        failureReason: job.FailureReason || null,
        outputLocation: job.OutputLocation || null
      })),
      consoleLink: 'https://console.aws.amazon.com/transcribe/home?region=us-east-1#jobs',
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'JOBS_RETRIEVED'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/transcribe/jobs', 'GET', 'failed', duration, 'test-user')
    
    console.error('[Test] List jobs failed:', error.message)
    res.status(500).json({
      error: 'Failed to list transcribe jobs',
      message: error.message,
      hint: 'Check AWS credentials and permissions'
    })
  }
})

/**
 * Get Transcribe Job Status
 * GET /api/test/transcribe/job-status/:jobName
 */
router.get('/transcribe/job-status/:jobName', async (req, res) => {
  try {
    const jobName = req.params.jobName

    console.log(`[Test] Getting status for job: ${jobName}`)

    const jobStatus = await getTranscriptionJobStatus(jobName)
    const duration = Date.now() - req.startTime

    logApiCall(`/api/test/transcribe/job-status/${jobName}`, 'GET', 'success', duration, 'test-user')

    if (!jobStatus) {
      return res.status(404).json({
        error: 'Job not found',
        jobName: jobName
      })
    }

    res.json({
      ok: true,
      service: 'Transcribe (Speech-to-Text)',
      action: 'GET_JOB_STATUS',
      jobName: jobStatus.TranscriptionJobName,
      status: jobStatus.TranscriptionJobStatus,
      language: jobStatus.LanguageCode || 'auto',
      mediaFormat: jobStatus.MediaFormat || null,
      createdAt: jobStatus.CreationTime,
      completedAt: jobStatus.CompletionTime || null,
      outputLocation: jobStatus.Transcript?.TranscriptFileUri || null,
      failureReason: jobStatus.FailureReason || null,
      duration: `${Date.now() - req.startTime}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: jobStatus.TranscriptionJobStatus
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall(`/api/test/transcribe/job-status/${req.params.jobName}`, 'GET', 'failed', duration, 'test-user')
    
    console.error('[Test] Get job status failed:', error.message)
    res.status(500).json({
      error: 'Failed to get job status',
      message: error.message,
      jobName: req.params.jobName
    })
  }
})

/**
 * Test DynamoDB Query Storage
 * POST /api/test/dynamodb
 * Body: {
 *   userId: '<user-id>',
 *   query: '<user query>',
 *   response: '<ai response>',
 *   language: 'en'
 * }
 */
router.post('/dynamodb', async (req, res) => {
  try {
    const { userId = 'test-user-123', query = 'What is PM-KISAN?', response = 'PM-KISAN is a government scheme...', language = 'en' } = req.body

    console.log(`[Test] DynamoDB test: storing query for user ${userId}`)

    const stored = await storeQuery(userId, query, response, language)
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/dynamodb', 'POST', 'success', duration, userId)

    res.json({
      ok: true,
      service: 'DynamoDB (Query Storage)',
      queryId: stored.queryId,
      userId: userId,
      query: query.substring(0, 50) + '...',
      language: language,
      timestamp: stored.timestamp,
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[DYNAMODB] Query stored in sahaay-queries table`,
        operation: 'PutQuery',
        table: 'sahaay-queries',
        items: 1,
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/dynamodb', 'POST', 'failed', duration, req.body.userId || 'test-user')
    
    res.status(500).json({
      error: 'DynamoDB operation failed',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED',
        operation: 'PutQuery'
      }
    })
  }
})

/**
 * Test DynamoDB Query History Retrieval
 * GET /api/test/dynamodb?userId=<userId>
 */
router.get('/dynamodb', async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user-123'

    console.log(`[Test] DynamoDB query history retrieval for user: ${userId}`)

    const history = await getQueryHistory(userId, 10)
    const duration = Date.now() - req.startTime

    logApiCall('/api/test/dynamodb', 'GET', 'success', duration, userId)

    res.json({
      ok: true,
      service: 'DynamoDB (Query History)',
      userId: userId,
      queriesRetrieved: history.length,
      queries: history.slice(0, 2).map(q => ({
        timestamp: q.timestamp,
        query: q.query.substring(0, 50) + '...'
      })),
      duration: `${duration}ms`,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        message: `[DYNAMODB] Retrieved ${history.length} queries for user`,
        operation: 'QueryHistory',
        table: 'sahaay-queries',
        items: history.length,
        status: 'success'
      }
    })

  } catch (error) {
    const duration = Date.now() - req.startTime
    logApiCall('/api/test/dynamodb', 'GET', 'failed', duration, req.query.userId || 'test-user')
    
    res.status(500).json({
      error: 'DynamoDB query failed',
      message: error.message,
      cloudwatch: {
        logGroup: '/aws/sahaay/application',
        status: 'FAILED',
        operation: 'QueryHistory'
      }
    })
  }
})

/**
 * Dashboard - All AWS Services Status
 * GET /api/test/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    console.log('[Test] AWS Services dashboard loaded')

    const duration = Date.now() - req.startTime

    res.json({
      ok: true,
      status: 'Dashboard loaded',
      services: {
        cloudwatch: {
          name: 'CloudWatch Logs',
          logGroup: '/aws/sahaay/application',
          endpoint: '/api/test/logs'
        },
        bedrock: {
          name: 'Bedrock (Amazon Nova Lite)',
          testEndpoint: '/api/test/bedrock',
          model: 'amazon.nova-lite-v1:0'
        },
        s3: {
          name: 'S3 (All Content Categories)',
          categories: {
            schemes: {
              endpoint: '/api/test/schemes?schemeId=pm-kisan',
              listEndpoint: '/api/test/schemes/list',
              bucket: 'sahaay-documents',
              prefix: 'schemes/',
              items: 5
            },
            learning: {
              endpoint: '/api/test/learn?courseId=digital-literacy',
              listEndpoint: '/api/test/learn/list',
              bucket: 'sahaay-documents',
              prefix: 'learn/',
              items: 4
            },
            marketplace: {
              endpoint: '/api/test/market?guideId=seller-comprehensive-guide',
              listEndpoint: '/api/test/market/list',
              bucket: 'sahaay-documents',
              prefix: 'market/',
              items: 4
            },
            civic: {
              endpoint: '/api/test/civic?contentId=local-initiatives',
              listEndpoint: '/api/test/civic/list',
              bucket: 'sahaay-documents',
              prefix: 'civic/',
              items: 4
            }
          }
        },
        dynamodb: {
          name: 'DynamoDB (Queries & Activity)',
          testEndpoints: ['/api/test/dynamodb (GET/POST)'],
          tables: ['sahaay-queries', 'sahaay-users', 'sahaay-saved-schemes']
        },
        transcribe: {
          name: 'Transcribe (Speech-to-Text)',
          testEndpoint: '/api/test/transcribe',
          languages: ['en-US', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN']
        }
      },
      contentSummary: {
        totalDocuments: 17,
        breakdown: {
          schemes: 5,
          learning: 4,
          marketplace: 4,
          civic: 4
        }
      },
      duration: `${duration}ms`,
      instructions: {
        step1: 'Test each content category with list endpoints',
        step2: 'Retrieve specific documents for each category',
        step3: 'Call /api/test/bedrock to invoke Claude model',
        step4: 'Call /api/test/dynamodb (POST) to store query',
        step5: 'Call /api/test/transcribe to simulate speech-to-text',
        step6: 'Go to AWS CloudWatch console → Log Groups → /aws/sahaay/application',
        step7: 'View real-time logs of all AWS service interactions'
      }
    })

  } catch (error) {
    res.status(500).json({
      error: 'Dashboard load failed',
      message: error.message
    })
  }
})

module.exports = router
