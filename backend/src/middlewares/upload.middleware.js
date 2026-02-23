import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinary from '../config/cloudinary.js';

const MAX_PRODUCT_IMAGES = 8;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error('Unsupported file type. Use JPG, PNG, or WEBP.'));
};

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nisittrade/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const productImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nisittrade/products',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const uploadProductImages = multer({
  storage: productImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_PRODUCT_IMAGES,
  },
}).array('images', MAX_PRODUCT_IMAGES);

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
}).single('avatar');

export { uploadProductImages, uploadAvatar };
