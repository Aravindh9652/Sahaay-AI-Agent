// API Configuration - automatically detects localhost vs production
export const getApiBaseUrl = () => {
  // If running on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000'
  }
  
  // Otherwise use Lambda URL
  return 'https://j3va2fbe5z6jgafdppdgldxny40eozqu.lambda-url.us-east-1.on.aws'
}
