const attempts = new Map();

const MAX_ATTEMPTS = Number(process.env.AUTH_MAX_ATTEMPTS || 5);
const WINDOW_MS = Number(process.env.AUTH_ATTEMPT_WINDOW_MS || 15 * 60 * 1000);
const BLOCK_MS = Number(process.env.AUTH_BLOCK_MS || 15 * 60 * 1000);

function normalizeIdentifier(identifier = '') {
  return String(identifier || '').trim().toLowerCase();
}

function normalizeIp(ip = '') {
  return String(ip || '').trim();
}

function getKey(identifier, ip) {
  return `${normalizeIdentifier(identifier)}::${normalizeIp(ip)}`;
}

function freshState(now) {
  return {
    count: 0,
    windowStart: now,
    blockedUntil: 0,
  };
}

export function isLoginBlocked(identifier, ip) {
  const now = Date.now();
  const key = getKey(identifier, ip);
  const state = attempts.get(key);

  if (!state) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  if (state.blockedUntil > now) {
    return {
      blocked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((state.blockedUntil - now) / 1000)),
    };
  }

  if (now - state.windowStart > WINDOW_MS) {
    attempts.delete(key);
  }

  return { blocked: false, retryAfterSeconds: 0 };
}

export function registerLoginFailure(identifier, ip) {
  const now = Date.now();
  const key = getKey(identifier, ip);
  const state = attempts.get(key) || freshState(now);

  if (now - state.windowStart > WINDOW_MS) {
    state.count = 0;
    state.windowStart = now;
    state.blockedUntil = 0;
  }

  state.count += 1;

  if (state.count >= MAX_ATTEMPTS) {
    state.blockedUntil = now + BLOCK_MS;
  }

  attempts.set(key, state);
  return state;
}

export function clearLoginFailures(identifier, ip) {
  const key = getKey(identifier, ip);
  attempts.delete(key);
}
