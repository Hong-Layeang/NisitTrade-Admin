import multer from 'multer';
import multerS3 from 'multer-s3';

import s3Client, { AWS_BUCKET_NAME } from '../config/aws.js';

const MAX_PRODUCT_IMAGES = 8;
const MAX_COMMUNITY_IMAGES = 8;
const MAX_CHAT_IMAGES = 4;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error('Unsupported file type. Use JPG, PNG, or WEBP.'));
};

const avatarStorage = multerS3({
  s3: s3Client,
  bucket: AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}-${file.originalname}`;
    cb(null, `nisittrade/avatars/${filename}`);
  },
});

const productImageStorage = multerS3({
  s3: s3Client,
  bucket: AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}-${file.originalname}`;
    cb(null, `nisittrade/products/${filename}`);
  },
});

const communityImageStorage = multerS3({
  s3: s3Client,
  bucket: AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}-${file.originalname}`;
    cb(null, `nisittrade/community/${filename}`);
  },
});

const chatImageStorage = multerS3({
  s3: s3Client,
  bucket: AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}-${file.originalname}`;
    cb(null, `nisittrade/chat/${filename}`);
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

const coverStorage = multerS3({
  s3: s3Client,
  bucket: AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}-${file.originalname}`;
    cb(null, `nisittrade/covers/${filename}`);
  },
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
}).single('cover');

const uploadCommunityImages = multer({
  storage: communityImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_COMMUNITY_IMAGES,
  },
}).array('images', MAX_COMMUNITY_IMAGES);

const uploadChatImages = multer({
  storage: chatImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_CHAT_IMAGES,
  },
}).array('images', MAX_CHAT_IMAGES);

export {
  uploadProductImages,
  uploadAvatar,
  uploadCover,
  uploadCommunityImages,
  uploadChatImages,
};
