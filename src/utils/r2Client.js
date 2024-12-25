const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log('Initializing R2 client with:', {
  accountId: process.env.ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID?.substring(0, 5) + '...',  // 只显示前5个字符
  bucketName: process.env.R2_BUCKET_NAME,
  endpoint: process.env.R2_ENDPOINT
});

if (!process.env.ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('Missing required environment variables. Please check your .env file.');
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = r2Client; 