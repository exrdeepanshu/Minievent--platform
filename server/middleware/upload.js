const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// Tell multer to stream files directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'eventhub/events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    // Auto-optimize & resize to standard OG-image dimensions
    transformation: [
      {
        width:        1200,
        height:       630,
        crop:         'fill',
        quality:      'auto',
        fetch_format: 'auto',
      },
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp, gif)'), false);
    }
  },
});

module.exports = { upload, cloudinary };
