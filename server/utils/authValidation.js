function isValidAdminPasscode(schoolPasscode, suppliedPasscode) {
  if (typeof suppliedPasscode !== 'string') return false;

  const normalizedSupplied = suppliedPasscode.trim();
  if (!normalizedSupplied) return false;

  if (typeof schoolPasscode === 'string' && schoolPasscode.trim()) {
    return normalizedSupplied === schoolPasscode.trim();
  }

  return false;
}

function isValidDeveloperPasscode(suppliedPasscode, developerPasscode = process.env.DEVELOPER_ADMIN_PASSCODE) {
  if (typeof suppliedPasscode !== 'string' || typeof developerPasscode !== 'string') return false;

  const normalizedSupplied = suppliedPasscode.trim();
  const normalizedDeveloperPasscode = developerPasscode.trim();
  return Boolean(normalizedDeveloperPasscode) && normalizedSupplied === normalizedDeveloperPasscode;
}

module.exports = {
  isValidAdminPasscode,
  isValidDeveloperPasscode
};
