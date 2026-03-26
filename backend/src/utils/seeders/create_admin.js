import dotenv from 'dotenv';

import models, { connectDB } from '../../models/index.js';
import { hashPassword, validatePasswordStrength } from '../helper/auth.helpers.js';

dotenv.config();

const argv = process.argv.slice(2);

function getArgValue(flag) {
  const index = argv.indexOf(flag);
  if (index === -1) return undefined;
  return argv[index + 1];
}

function getPositionalArgs() {
  const values = [];

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const previous = argv[i - 1];

    if (current.startsWith('--')) continue;
    if (previous && previous.startsWith('--')) continue;

    values.push(current);
  }

  return values;
}

function required(value, label) {
  if (!value || !String(value).trim()) {
    throw new Error(`${label} is required`);
  }
  return String(value).trim();
}

async function createOrUpdateAdmin() {
  const positional = getPositionalArgs();

  const emailRaw = getArgValue('--email') || positional[0] || process.env.ADMIN_EMAIL;
  const passwordRaw = getArgValue('--password') || positional[1] || process.env.ADMIN_PASSWORD;
  const fullName =
    getArgValue('--name') ||
    (positional.length > 2 ? positional.slice(2).join(' ') : undefined) ||
    process.env.ADMIN_NAME ||
    'Admin User';

  const email = required(emailRaw, 'Email').toLowerCase();
  const password = required(passwordRaw, 'Password');

  validatePasswordStrength(password);

  const { User } = models;

  await connectDB.authenticate();

  const passwordHash = await hashPassword(password);
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    existing.full_name = fullName;
    existing.role = 'admin';
    existing.provider = 'local';
    existing.password_hash = passwordHash;
    existing.password_set = true;
    await existing.save();

    console.log(`Updated admin account: ${email}`);
    return;
  }

  await User.create({
    full_name: fullName,
    email,
    role: 'admin',
    provider: 'local',
    password_hash: passwordHash,
    password_set: true,
  });

  console.log(`Created admin account: ${email}`);
}

createOrUpdateAdmin()
  .catch((error) => {
    console.error('Failed to create/update admin:', error.message);
    console.error('Usage: npm run create-admin -- --email admin@example.com --password Admin12345 --name "Admin User"');
    console.error('   or: npm run create-admin -- admin@example.com Admin12345 "Admin User"');
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await connectDB.close();
    } catch {
      // ignore close errors
    }
  });
