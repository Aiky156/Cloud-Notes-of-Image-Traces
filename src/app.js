const express = require('express');
const cors = require('cors');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));

// API 路由
app.use('/api/images', imageRoutes);

console.log('Environment variables loaded:', {
  ACCOUNT_ID: process.env.ACCOUNT_ID,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  PORT: process.env.PORT
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`访问 http://localhost:${PORT} 查看图床管理界面`);
  console.log(`访问 http://localhost:${PORT}/docs 查看API文档`);
});

module.exports = app; 