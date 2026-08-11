// CloudMart - Image upload route
// Uploads product images to Amazon S3 and returns the public URL.
// Only the image URL is stored in Aurora MySQL.

const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();

// Configure multer to store files in memory (buffer) before upload to S3.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// S3 client - credentials come from the ECS task role (IAM).
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET = process.env.AWS_S3_BUCKET || 'cloudmart-images';

// POST /api/upload - single image upload
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const extension = path.extname(req.file.originalname) || '.png';
  const key = `products/${uuidv4()}${extension}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        // Public read access is granted via the bucket policy (ACL-free).
        // With Object Ownership = Bucket owner enforced, ACLs are not allowed.
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    res.status(201).json({ url, key });
  } catch (err) {
    console.error('Error uploading to S3:', err);
    res.status(500).json({ error: 'Failed to upload image to S3' });
  }
});

module.exports = router;
