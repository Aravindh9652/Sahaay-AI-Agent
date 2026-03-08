#!/usr/bin/env node

/**
 * Monitor Bedrock approval status
 * Run this every 2-3 minutes after submitting use case form
 */

const http = require('http');

console.log('🔍 Bedrock Approval Monitor');
console.log('Checking status every 2 minutes...\n');

let checks = 0;

const check = () => {
  checks++;
  const timestamp = new Date().toLocaleTimeString();
  
  const req = http.get('http://localhost:5000/api/test/bedrock?prompt=Is%20your%20model%20approved', (res) => {
    let data = '';
    
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          console.log(`✅ [${timestamp}] CHECK #${checks}: MODEL APPROVED! 🎉\n`);
          console.log('Response:', response.response.substring(0, 100) + '...\n');
          console.log('CloudWatch Log:', response.cloudwatch?.status);
          clearInterval(monitor);
          process.exit(0);
        } else if (response.message && response.message.includes('not been submitted')) {
          console.log(`⏳ [${timestamp}] CHECK #${checks}: Still waiting for approval...`);
          console.log('   Message: Use case not yet approved\n');
        } else {
          console.log(`❌ [${timestamp}] CHECK #${checks}: Different error`);
          console.log('   Error:', response.error || response.message, '\n');
        }
      } catch (e) {
        console.log(`⚠️  [${timestamp}] CHECK #${checks}: Connection failed - server may be down\n`);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`⚠️  [${timestamp}] CHECK #${checks}: Cannot reach server at localhost:5000\n`);
  });
};

// First check immediately
check();

// Then check every 2 minutes
const monitor = setInterval(check, 120000);

// Stop after 20 minutes (10 checks)
setTimeout(() => {
  console.log('\n⏰ Timeout: Stopped monitoring after 20 minutes.');
  console.log('   If still not approved, AWS may need more time.');
  console.log('   Try manual check: http://localhost:5000/api/test/bedrock\n');
  clearInterval(monitor);
  process.exit(1);
}, 1200000);

console.log('💡 Tip: Will check automatically every 2 minutes');
console.log('   This monitor will stop after 20 minutes\n');
console.log('📝 Meanwhile: Submit use case form at AWS Bedrock console\n');
