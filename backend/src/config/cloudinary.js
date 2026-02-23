import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  throw new Error('CLOUDINARY_URL is not set');
}

cloudinary.config({
  secure: true,
  url: cloudinaryUrl,
});

export default cloudinary;
