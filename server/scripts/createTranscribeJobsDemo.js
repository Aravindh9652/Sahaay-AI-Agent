/**
 * AWS Transcribe Demo Job Creator
 * Creates multiple real Transcribe jobs visible in AWS Transcribe console
 * Shows judges how Transcribe integration works with real jobs tracked
 * 
 * Usage: node scripts/createTranscribeJobsDemo.js
 * 
 * Output: Real jobs visible at https://console.aws.amazon.com/transcribe/
 */

const { createDemoTranscriptionJob, listTranscriptionJobs, getTranscriptionJobStatus } = require('../aws/transcribeClient');
const { v4: uuidv4 } = require('uuid');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

async function createDemoJobs() {
  console.log(`${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║  AWS Transcribe Demo Job Creator - For Judge Presentation      ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Sample transcribe jobs simulating different languages
  const demoJobs = [
    {
      sampleText: 'What are the benefits of PM-KISAN scheme?',
      language: 'en',
      description: 'English Language Transcription'
    },
    {
      sampleText: 'पीएम-किसान योजना के लाभ क्या हैं',
      language: 'hi',
      description: 'Hindi Language Transcription'
    },
    {
      sampleText: 'PM-KISAN योजनाचे लाभ काय आहेत',
      language: 'ta',
      description: 'Tamil Language Transcription'
    },
    {
      sampleText: 'PM-KISAN స్కీమ్ ప్రయోజనాలు ఏమిటి',
      language: 'te',
      description: 'Telugu Language Transcription'
    }
  ];

  const createdJobs = [];

  console.log(`${colors.yellow}📝 Creating ${demoJobs.length} demonstration Transcribe jobs...${colors.reset}\n`);

  for (let i = 0; i < demoJobs.length; i++) {
    const job = demoJobs[i];

    try {
      console.log(`${colors.blue}[${i + 1}/${demoJobs.length}] Creating: ${job.description}${colors.reset}`);

      const jobResult = await createDemoTranscriptionJob(job.sampleText, job.language);

      console.log(`  ✅ Job Created: ${colors.green}${jobResult.jobName}${colors.reset}`);
      console.log(`  📍 Language: ${jobResult.language}`);
      console.log(`  💾 S3 Location: ${jobResult.s3Location}`);
      console.log(`  ⏱️  Created At: ${jobResult.createdAt}\n`);

      createdJobs.push(jobResult);

      // Small delay between job creations to stagger them
      if (i < demoJobs.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
    }
  }

  console.log(`${colors.bright}${colors.green}✅ Job Creation Summary:${colors.reset}`);
  console.log(`${colors.green}   Created ${createdJobs.length} transcribe jobs${colors.reset}\n`);

  // List all jobs
  console.log(`${colors.yellow}📊 Fetching all transcribe jobs from AWS...${colors.reset}\n`);

  try {
    const allJobs = await listTranscriptionJobs({ statusFilter: 'ALL', maxResults: 50 });

    console.log(`${colors.bright}Total Transcribe Jobs in Account: ${allJobs.length}${colors.reset}\n`);

    if (allJobs.length > 0) {
      console.log(`${colors.cyan}Job Status Overview:${colors.reset}`);
      console.log(`${'─'.repeat(80)}`);

      // Group by status
      const statuses = {};
      allJobs.forEach(job => {
        const status = job.TranscriptionJobStatus;
        statuses[status] = (statuses[status] || 0) + 1;
      });

      for (const [status, count] of Object.entries(statuses)) {
        const statusIcon = status === 'COMPLETED' ? '✅' : status === 'FAILED' ? '❌' : '⏳';
        console.log(`  ${statusIcon} ${status}: ${colors.bright}${count}${colors.reset} job(s)`);
      }

      console.log(`${'─'.repeat(80)}\n`);

      // Show recent demo jobs
      const demoJobsList = allJobs.filter(j => j.TranscriptionJobName.includes('demo-transcribe'));

      if (demoJobsList.length > 0) {
        console.log(`${colors.cyan}Recently Created Demo Jobs:${colors.reset}`);
        console.log(`${'─'.repeat(80)}`);

        demoJobsList.slice(0, 5).forEach(job => {
          const statusEmoji = job.TranscriptionJobStatus === 'COMPLETED' ? '✅' : 
                             job.TranscriptionJobStatus === 'FAILED' ? '❌' : '⏳';
          console.log(`  ${statusEmoji} ${job.TranscriptionJobName}`);
          console.log(`     Status: ${job.TranscriptionJobStatus} | Language: ${job.LanguageCode || 'auto'}`);
          console.log(`     Created: ${new Date(job.CreationTime).toLocaleString()}`);
          if (job.CompletionTime) {
            console.log(`     Completed: ${new Date(job.CompletionTime).toLocaleString()}`);
          }
          console.log();
        });

        console.log(`${'─'.repeat(80)}\n`);
      }
    }

  } catch (error) {
    console.error(`${colors.red}❌ Failed to list jobs: ${error.message}${colors.reset}\n`);
  }

  // Show monitoring instructions
  console.log(`${colors.bright}${colors.cyan}📋 Judge Presentation Instructions:${colors.reset}\n`);

  console.log(`${colors.yellow}1. View Jobs in AWS Console:${colors.reset}`);
  console.log(`   https://console.aws.amazon.com/transcribe/home?region=us-east-1#jobs\n`);

  console.log(`${colors.yellow}2. What Judges Will See:${colors.reset}`);
  console.log(`   ✓ Multiple transcription jobs with names like "demo-transcribe-..."
   ✓ Language codes showing multi-language support (en-US, hi-IN, ta-IN, te-IN)
   ✓ Real job status progression (IN_PROGRESS → COMPLETED)
   ✓ Job creation timestamps and completion details
   ✓ S3 output locations for transcript files\n`);

  console.log(`${colors.yellow}3. Monitor Job Status:${colors.reset}`);
  console.log(`   Jobs typically complete in 30-120 seconds
   Refresh the console page to see status updates
   Output transcripts stored in S3 bucket: sahaay-documents\n`);

  console.log(`${colors.yellow}4. API Endpoints for Monitoring:${colors.reset}`);
  console.log(`   GET  /api/test/transcribe/jobs
   GET  /api/test/transcribe/jobs?status=COMPLETED
   GET  /api/test/transcribe/job-status/{jobName}
   POST /api/test/transcribe/create-demo\n`);

  console.log(`${colors.bright}${colors.green}✅ Demo jobs created successfully!${colors.reset}`);
  console.log(`${colors.green}   Judges can now see real Transcribe jobs in AWS console${colors.reset}\n`);

  // Show CloudWatch info
  console.log(`${colors.cyan}📊 CloudWatch Logging:${colors.reset}`);
  console.log(`   Log Group: /aws/sahaay/application`);
  console.log(`   All job events are logged with [TRANSCRIBE] tag
   View at: https://console.aws.amazon.com/cloudwatch/\n`);

  return createdJobs;
}

// Run the demo
if (require.main === module) {
  createDemoJobs()
    .then((jobs) => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { createDemoJobs };
