import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

// Configure GridFS storage for multer
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `photo_${Date.now()}_${file.originalname}`;
      const fileInfo = {
        filename,
        bucketName: 'photos',
        metadata: {
          fieldName: file.fieldname,
          placeId: req.body.placeId,
          userId: req.body.userId,
        },
      };
      resolve(fileInfo);
    });
  },
});

// Configure multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

