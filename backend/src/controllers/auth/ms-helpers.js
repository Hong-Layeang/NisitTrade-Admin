import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Microsoft Token Verification Helper
 * Validates Microsoft Azure AD ID tokens using JWKS (JSON Web Key Set)
 * Keeps verification logic centralized and testable
 */

const DEFAULT_ALLOWED_DOMAINS = ['student.cadt.edu.kh'];
let cachedJwks = null;
let cachedJwksUrl = '';

/**
 * Get allowed email domains from environment
 * Falls back to DEFAULT_ALLOWED_DOMAINS if not configured
 * @returns {string[]} Array of allowed domains (lowercase)
 */
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

/**
 * Get Microsoft OAuth2 configuration from environment
 * @returns {object} { tenantId, clientId }
 * @throws {Error} if config is missing
 */
export function getMicrosoftConfig() {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!tenantId || !clientId) {
    throw new Error('MICROSOFT_TENANT_ID and MICROSOFT_CLIENT_ID are required');
  }
  return { tenantId, clientId };
}

/**
 * Get or create cached JWKS (JSON Web Key Set) from Microsoft
 * Implements caching to avoid unnecessary HTTPS requests
 * @param {string} tenantId - Microsoft tenant ID
 * @returns {object} JWKS set for verification
 */
export function getJwks(tenantId) {
  const jwksUrl = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
  if (!cachedJwks || cachedJwksUrl !== jwksUrl) {
    cachedJwksUrl = jwksUrl;
    cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
  }
  return cachedJwks;
}

/**
 * Extract email from Microsoft token payload
 * Tries multiple field names: preferred_username, upn, email
 * @param {object} payload - JWT payload from Microsoft
 * @returns {string|null} Email address or null if not found
 */
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

/**
 * Extract full name from Microsoft token payload
 * Falls back to given_name + family_name, then email local part
 * @param {object} payload - JWT payload from Microsoft
 * @param {string} email - Email address (fallback source)
 * @returns {string} Full name or email local part
 */
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

  // Fallback to email local part
  const [localPart] = email.split('@');
  return localPart || email;
}

/**
 * Normalize email address (trim, lowercase)
 * @param {string} email - Raw email
 * @returns {string} Normalized email
 */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Check if email domain is in allowed domains list
 * @param {string} email - Email address
 * @param {string[]} allowedDomains - List of allowed domains (must be lowercase)
 * @returns {boolean} True if domain is allowed
 */
export function isAllowedDomain(email, allowedDomains) {
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }
  const domain = parts[1].toLowerCase();
  return allowedDomains.includes(domain);
}

/**
 * Verify Microsoft Azure AD ID token
 * - Validates signature using Microsoft JWKS
 * - Validates issuer and audience (client ID)
 * - Validates expiration (handled by jwtVerify)
 * - Returns verified claims
 *
 * @param {string} idToken - JWT ID token from Microsoft
 * @param {string} tenantId - Microsoft tenant ID
 * @param {string} clientId - Microsoft client ID
 * @returns {Promise<object>} Verified token payload
 * @throws {Error} if token is invalid or expired
 */
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
    // Re-throw with consistent error message
    throw new Error(`Invalid Microsoft token: ${error.message}`);
  }
}
