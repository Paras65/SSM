const crypto = require('crypto');

function hashPasscode(passcode) {
  if (!passcode || typeof passcode !== 'string') return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(passcode.trim(), salt, 64).toString('hex');
  return `scrypt:${salt}:${derivedKey}`;
}

function verifyPasscode(storedPasscode, suppliedPasscode) {
  if (!storedPasscode || !suppliedPasscode || typeof suppliedPasscode !== 'string') return false;
  const supplied = suppliedPasscode.trim();
  if (!supplied) return false;

  const stored = String(storedPasscode).trim();

  // If stored in scrypt hash format: scrypt:salt:derivedKey
  if (stored.startsWith('scrypt:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const originalKey = Buffer.from(parts[2], 'hex');
    const suppliedKey = crypto.scryptSync(supplied, salt, 64);
    if (originalKey.length !== suppliedKey.length) return false;
    return crypto.timingSafeEqual(originalKey, suppliedKey);
  }

  // Timing-safe comparison for legacy plaintext passcodes
  const storedBuf = Buffer.from(stored, 'utf8');
  const suppliedBuf = Buffer.from(supplied, 'utf8');
  if (storedBuf.length !== suppliedBuf.length) return false;
  return crypto.timingSafeEqual(storedBuf, suppliedBuf);
}

function isValidAdminPasscode(schoolPasscode, suppliedPasscode) {
  return verifyPasscode(schoolPasscode, suppliedPasscode);
}

function isValidDeveloperPasscode(suppliedPasscode, developerPasscode = process.env.DEVELOPER_ADMIN_PASSCODE) {
  if (typeof suppliedPasscode !== 'string' || typeof developerPasscode !== 'string') return false;
  return verifyPasscode(developerPasscode, suppliedPasscode);
}

module.exports = {
  hashPasscode,
  verifyPasscode,
  isValidAdminPasscode,
  isValidDeveloperPasscode
};
