import dotenv from 'dotenv';
import connectDB from '../../config/database.js';
import models from '../../models/index.js';
import { hashPassword, validatePasswordStrength } from '../helper/auth.helpers.js';

dotenv.config();

const { User } = models;

async function createOrUpdateAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const fullName = String(process.env.ADMIN_FULL_NAME || 'System Admin').trim();
  const universityIdRaw = process.env.ADMIN_UNIVERSITY_ID;
  const universityId = universityIdRaw ? Number(universityIdRaw) : null;

  if (!email) {
    throw new Error('ADMIN_EMAIL is required');
  }

  if (!password) {
    throw new Error('ADMIN_PASSWORD is required');
  }

  validatePasswordStrength(password);

  await connectDB.authenticate();
  const existing = await User.findOne({ where: { email } });

  if (existing && existing.role !== 'admin') {
    throw new Error('A non-admin account already exists with this email');
  }

  const passwordHash = await hashPassword(password);

  if (existing) {
    existing.full_name = fullName || existing.full_name;
    existing.password_hash = passwordHash;
    existing.password_set = true;
    existing.provider = 'local';
    if (Number.isInteger(universityId) && universityId > 0) {
      existing.university_id = universityId;
    }
    await existing.save();
    console.log(`Updated admin account: ${email}`);
    return;
  }

  await User.create({
    full_name: fullName,
    email,
    password_hash: passwordHash,
    password_set: true,
    provider: 'local',
    role: 'admin',
    university_id: Number.isInteger(universityId) && universityId > 0 ? universityId : null,
  });

  console.log(`Created admin account: ${email}`);
}

createOrUpdateAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('create-admin failed:', error.message);
    process.exit(1);
  });
