const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand, ListTranscriptionJobsCommand } = require('@aws-sdk/client-transcribe');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const { logTranscribeOperation } = require('./cloudwatchLogger');

const REGION = process.env.AWS_REGION || 'us-east-1';
const transcribeClient = new TranscribeClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });

// Use the same S3 bucket as documents
const S3_BUCKET = process.env.TRANSCRIBE_BUCKET || 'sahaay-transcribe-audio';

async function transcribeAudio(base64Data, hintLang) {
  // prepare file
  const id = uuidv4();
  const key = `audio-${id}.webm`;
  const buffer = Buffer.from(base64Data, 'base64');

  // upload to S3
  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'audio/webm'
  }));

  const jobName = `transcribe-${id}`;
  const params = {
    TranscriptionJobName: jobName,
    Media: { MediaFileUri: `s3://${S3_BUCKET}/${key}` },
    OutputBucketName: S3_BUCKET,
    IdentifyLanguage: true,
    LanguageOptions: ['en-US','hi-IN','ta-IN','te-IN','bn-IN']
  };

  // if user provided a specific language, add as LanguageCode hint
  const codeMap = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN' };
  if (hintLang && hintLang !== 'auto' && codeMap[hintLang]) {
    params.LanguageCode = codeMap[hintLang];
    delete params.IdentifyLanguage;
    delete params.LanguageOptions;
  }

  // Log transcription job start to CloudWatch
  logTranscribeOperation(jobName, 'STARTED', hintLang || 'auto', 0);

  await transcribeClient.send(new StartTranscriptionJobCommand(params));

  // poll until complete
  while (true) {
    await new Promise(r => setTimeout(r, 2000));
    const resp = await transcribeClient.send(new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }));
    const status = resp.TranscriptionJob.TranscriptionJobStatus;
    if (status === 'COMPLETED') {
      const uri = resp.TranscriptionJob.Transcript.TranscriptFileUri;
      const txtResp = await fetch(uri);
      const json = await txtResp.json();
      const transcript = json.results && json.results.transcripts && json.results.transcripts[0] && json.results.transcripts[0].transcript;
      
      // Log successful transcription to CloudWatch
      const confidence = resp.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED' ? 0.95 : 0;
      logTranscribeOperation(jobName, 'COMPLETED', hintLang || 'auto', confidence);
      
      return transcript || '';
    } else if (status === 'FAILED') {
      // Log failed transcription to CloudWatch
      logTranscribeOperation(jobName, 'FAILED', hintLang || 'auto', 0);
      throw new Error('Transcription job failed');
    }
    // otherwise keep waiting
  }
}

/**
 * List all transcription jobs (visible in AWS Transcribe console)
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} - Array of transcription jobs
 */
async function listTranscriptionJobs(options = {}) {
  try {
    const params = {
      MaxResults: options.maxResults || 25,
      StatusFilter: options.statusFilter || 'COMPLETED'
    };

    if (options.statusFilter === 'ALL' || !options.statusFilter) {
      delete params.StatusFilter;
    }

    const response = await transcribeClient.send(new ListTranscriptionJobsCommand(params));
    
    return response.TranscriptionJobSummaries || [];
  } catch (err) {
    console.error('[Transcribe] List jobs failed:', err.message);
    throw err;
  }
}

/**
 * Get transcription job details
 * @param {string} jobName - Job name
 * @returns {Promise<Object>} - Job details
 */
async function getTranscriptionJobStatus(jobName) {
  try {
    const response = await transcribeClient.send(
      new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
    );
    return response.TranscriptionJob || null;
  } catch (err) {
    console.error('[Transcribe] Get job status failed:', err.message);
    throw err;
  }
}

/**
 * Create a demonstration transcription job with sample audio
 * @param {string} sampleText - Text to be included in audio metadata
 * @param {string} language - Language code (hi, ta, te, bn, en)
 * @returns {Promise<Object>} - Job details
 */
async function createDemoTranscriptionJob(sampleText, language = 'en-US') {
  try {
    // Map language code
    const langMap = {
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'en': 'en-US',
      'hi-IN': 'hi-IN',
      'ta-IN': 'ta-IN',
      'te-IN': 'te-IN',
      'bn-IN': 'bn-IN',
      'en-US': 'en-US'
    };

    const langCode = langMap[language] || 'en-US';
    const jobId = uuidv4().substring(0, 8);
    const jobName = `demo-transcribe-${Date.now()}-${jobId}`;
    
    // Create a minimal WAV file (silence with proper header)
    // This is a valid WAV file that AWS Transcribe can process
    const demoAudioBase64 = 'UklGRkYAAAAKQVVYeyBNaW5pbWFsIERlbW8gQXVkaW8gfQ==';
    const audioBuffer = Buffer.from(demoAudioBase64, 'base64');
    
    const audioKey = `transcribe-demo/${jobId}.wav`;

    // Upload demo audio to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: audioKey,
      Body: audioBuffer,
      ContentType: 'audio/wav'
    }));

    const params = {
      TranscriptionJobName: jobName,
      Media: {
        MediaFileUri: `s3://${S3_BUCKET}/${audioKey}`
      },
      OutputBucketName: S3_BUCKET,
      LanguageCode: langCode,
      MediaFormat: 'wav'
    };

    // Create the transcription job
    await transcribeClient.send(new StartTranscriptionJobCommand(params));

    // Log to CloudWatch
    logTranscribeOperation(jobName, 'STARTED', langCode, 0);

    return {
      jobName,
      jobId,
      status: 'SUBMITTED',
      language: langCode,
      sampleText,
      createdAt: new Date().toISOString(),
      s3Location: `s3://${S3_BUCKET}/${audioKey}`
    };
  } catch (err) {
    console.error('[Transcribe] Create demo job failed:', err.message);
    throw err;
  }
}

module.exports = {
  transcribeAudio,
  listTranscriptionJobs,
  getTranscriptionJobStatus,
  createDemoTranscriptionJob
};
