import { createRemoteJWKSet, jwtVerify } from 'jose';

const DEFAULT_ALLOWED_DOMAINS = ['student.cadt.edu.kh'];
let cachedJwks = null;
let cachedJwksUrl = '';

export function getAllowedDomains() {
  const raw = process.env.MICROSOFT_ALLOWED_DOMAINS;
  if (!raw) {
    return DEFAULT_ALLOWED_DOMAINS;
  }
  return raw
    .split(',')
    .map(domain => domain.trim().toLowerCase())
    .filter(Boolean);
}

export function getMicrosoftConfig() {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!tenantId || !clientId) {
    throw new Error('MICROSOFT_TENANT_ID and MICROSOFT_CLIENT_ID are required');
  }
  return { tenantId, clientId };
}

export function getJwks(tenantId) {
  const jwksUrl = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
  if (!cachedJwks || cachedJwksUrl !== jwksUrl) {
    cachedJwksUrl = jwksUrl;
    cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
  }
  return cachedJwks;
}

export function extractEmail(payload) {
  if (typeof payload.preferred_username === 'string' && payload.preferred_username) {
    return payload.preferred_username;
  }
  if (typeof payload.upn === 'string' && payload.upn) {
    return payload.upn;
  }
  if (typeof payload.email === 'string' && payload.email) {
    return payload.email;
  }
  return null;
}

export function extractFullName(payload, email) {
  if (typeof payload.name === 'string' && payload.name.trim()) {
    return payload.name;
  }

  const givenName = typeof payload.given_name === 'string' ? payload.given_name.trim() : '';
  const familyName = typeof payload.family_name === 'string' ? payload.family_name.trim() : '';
  const combined = `${givenName} ${familyName}`.trim();
  if (combined) {
    return combined;
  }

  // Fallback to email local part when display name is missing.
  const [localPart] = email.split('@');
  return localPart || email;
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function isAllowedDomain(email, allowedDomains) {
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }
  const domain = parts[1].toLowerCase();
  return allowedDomains.includes(domain);
}

export async function jwtVerifyMicrosoftIdToken(idToken, tenantId, clientId) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('idToken must be a non-empty string');
  }

  const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
  const jwks = getJwks(tenantId);

  try {
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer,
      audience: clientId,
    });
    return payload;
  } catch (error) {
    throw new Error(`Invalid Microsoft token: ${error.message}`);
  }
}
