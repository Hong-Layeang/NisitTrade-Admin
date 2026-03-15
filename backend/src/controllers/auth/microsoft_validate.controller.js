import models from '../../models/index.js';
import { buildUserResponse, generateToken, } from '../../utils/helper/auth.helpers.js';
import { jwtVerifyMicrosoftIdToken, getAllowedDomains, getMicrosoftConfig, extractEmail, extractFullName, normalizeEmail, isAllowedDomain, } from '../../utils/helper/ms.helpers.js';

export default async function microsoftValidateController(req, res) {
  try {
    const idToken = req?.body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ valid: false, msg: 'Invalid request' });
    }

    // Get Microsoft configuration
    let tenantId, clientId;
    try {
      ({ tenantId, clientId } = getMicrosoftConfig());
    } catch (err) {
      console.error('Microsoft config error:', err.message);
      return res.status(500).json({ valid: false, msg: 'Internal server error' });
    }

    // Verify idToken against Microsoft JWKS
    let msPayload;
    try {
      msPayload = await jwtVerifyMicrosoftIdToken(idToken, tenantId, clientId);
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ valid: false, msg: 'Authentication failed' });
    }

    // Extract and normalize email
    const rawEmail = extractEmail(msPayload);
    if (!rawEmail) {
      return res.status(401).json({ valid: false, msg: 'Authentication failed' });
    }
    const email = normalizeEmail(rawEmail);

    // Check domain is allowed
    const allowedDomains = getAllowedDomains();
    if (allowedDomains.length && !isAllowedDomain(email, allowedDomains)) {
      return res.status(403).json({ valid: false, msg: 'Authentication failed' });
    }

    // Find or create user
    const { User, University } = models;
    let user = await User.findOne({ where: { email } });

    // Prevent admin accounts from using Microsoft login
    if (user && user.role === 'admin') {
      return res.status(403).json({ valid: false, msg: 'Authentication failed' });
    }

    // Resolve university from email domain
    const emailDomain = email.split('@')[1] ?? '';
    const university = emailDomain
      ? await University.findOne({ where: { domain: emailDomain } })
      : null;

    // Create user if first login
    if (!user) {
      const fullName = extractFullName(msPayload, email);
      user = await User.create({
        email,
        full_name: fullName,
        provider: 'microsoft',
        role: 'user',
        password_hash: null,
        password_set: false,
        university_id: university?.id ?? null,
      });
    } else {
      const updates = {};

      if (user.provider !== 'microsoft') {
        updates.provider = 'microsoft';
      }

      if (!user.university_id && university) {
        updates.university_id = university.id;
      }

      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }
    }

    // check if password setup is needed
    const needsPasswordSetup = !user.password_set;

    // Generate server JWT
    let token;
    try {
      token = generateToken({
        id: user.id,
        role: user.role,
        needsPasswordSetup,
      });
    } catch (err) {
      console.error('Token generation error:', err.message);
      return res.status(500).json({ valid: false, msg: 'Internal server error' });
    }

    return res.json({
      valid: true,
      token,
      user: buildUserResponse(user),
      needsPasswordSetup,
    });
  } catch (error) {
    console.error('microsoftValidate error:', error);
    return res.status(500).json({ valid: false, msg: 'Internal server error' });
  }
}
