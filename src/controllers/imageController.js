const { PutObjectCommand, DeleteObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../utils/r2Client');
const crypto = require('crypto');
const fetch = require('node-fetch');

class ImageController {
  // 生成唯一文件名
  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(`${timestamp}-${originalName}`).digest('hex');
    const ext = originalName.split('.').pop();
    return `${hash}.${ext}`;
  }

  // 上传图片
  uploadImage = async (req, res) => {
    try {
      const { url, base64 } = req.body;
      const files = req.files;  // 多文件上传
      const file = req.file;    // 单文件上传
      let results = [];
      
      // 处理多文件上传
      if (files && files.length > 0) {
        for (const file of files) {
          const fileName = this.generateUniqueFileName(file.originalname);
          await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype
          }));
          
          results.push({
            originalName: file.originalname,
            fileName: fileName,
            url: `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileName}`,
            size: file.size,
            type: file.mimetype
          });
        }
      }
      // 处理单文件上传
      else if (file) {
        const fileName = this.generateUniqueFileName(file.originalname);
        await r2Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype
        }));
        
        results.push({
          originalName: file.originalname,
          fileName: fileName,
          url: `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileName}`,
          size: file.size,
          type: file.mimetype
        });
      }
      // 处理URL上传
      else if (url) {
        const response = await fetch(url);
        const imageBuffer = await response.buffer();
        const fileName = this.generateUniqueFileName(url.split('/').pop() || 'image.png');
        
        await r2Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileName,
          Body: imageBuffer,
          ContentType: response.headers.get('content-type') || 'image/png'
        }));
        
        results.push({
          originalName: url,
          fileName: fileName,
          url: `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileName}`,
          size: imageBuffer.length,
          type: response.headers.get('content-type') || 'image/png'
        });
      }
      // 处理base64上传
      else if (base64) {
        const imageBuffer = Buffer.from(base64.split(',')[1], 'base64');
        const fileName = this.generateUniqueFileName('image.png');
        
        await r2Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileName,
          Body: imageBuffer,
          ContentType: 'image/png'
        }));
        
        results.push({
          originalName: 'base64-image',
          fileName: fileName,
          url: `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileName}`,
          size: imageBuffer.length,
          type: 'image/png'
        });
      }

      res.json({
        success: true,
        count: results.length,
        files: results
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // 删除图片
  deleteImage = async (req, res) => {
    try {
      const { fileName } = req.params;
      
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName
      }));

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取图片列表
  getImages = async (req, res) => {
    try {
      const result = await r2Client.send(new ListObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME
      }));

      const images = (result.Contents || []).map(item => ({
        fileName: item.Key,
        url: `${process.env.CLOUDFLARE_PUBLIC_URL}/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified
      }));

      res.json({
        success: true,
        count: images.length,
        files: images
      });
    } catch (error) {
      console.error('List images error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new ImageController(); 