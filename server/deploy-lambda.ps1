# Lambda Deployment Script for SAHAAY Backend
# This script creates a deployment package for AWS Lambda

Write-Host "🚀 Creating Lambda deployment package..." -ForegroundColor Cyan

# Create deployment directory
$deployDir = "lambda-deploy"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

Write-Host "📦 Copying application files..." -ForegroundColor Yellow

# Copy necessary files and folders
Copy-Item -Path "lambda.js" -Destination $deployDir
Copy-Item -Path "package.json" -Destination $deployDir
Copy-Item -Path "package-lock.json" -Destination $deployDir
Copy-Item -Recurse -Path "aws" -Destination $deployDir
Copy-Item -Recurse -Path "config" -Destination $deployDir
Copy-Item -Recurse -Path "routes" -Destination $deployDir
Copy-Item -Recurse -Path "services" -Destination $deployDir
Copy-Item -Recurse -Path "lambda" -Destination $deployDir

Write-Host "📚 Installing production dependencies..." -ForegroundColor Yellow
Set-Location $deployDir
npm install --production

Write-Host "🗜️ Creating deployment ZIP..." -ForegroundColor Yellow
Set-Location ..
$zipFile = "sahaay-lambda-deployment.zip"
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}

# Create ZIP file
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipFile -Force

Write-Host "✅ Deployment package created: $zipFile" -ForegroundColor Green
Write-Host "📊 Package size: $((Get-Item $zipFile).Length / 1MB) MB" -ForegroundColor Cyan

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to AWS Lambda Console" -ForegroundColor White
Write-Host "2. Select function: sahaay-backend" -ForegroundColor White
Write-Host "3. Click 'Upload from' > '.zip file'" -ForegroundColor White
Write-Host "4. Upload: $zipFile" -ForegroundColor White
Write-Host "5. Wait for deployment to complete" -ForegroundColor White
Write-Host "6. Test endpoints:" -ForegroundColor White
Write-Host "   - https://j3va2fbe5z6jgafdppdgldxny40eozqu.lambda-url.us-east-1.on.aws/health" -ForegroundColor Gray
Write-Host "   - https://j3va2fbe5z6jgafdppdgldxny40eozqu.lambda-url.us-east-1.on.aws/api/auth/signup" -ForegroundColor Gray

# Cleanup
Write-Host "`n🧹 Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $deployDir

Write-Host "✨ Done! Ready to deploy to Lambda." -ForegroundColor Green
