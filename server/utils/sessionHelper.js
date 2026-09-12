/**
 * Session Helper Utility
 * Provides dynamic academic year calculation according to Indian School Calendar (April 1 - March 31)
 */

function calculateCurrentAcademicYear(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 = Jan, 1 = Feb, 2 = Mar, 3 = Apr, ...

  // In India, academic session begins on April 1 (month index 3)
  // If month is Jan, Feb, or Mar (0, 1, 2), academic year started in previous calendar year
  if (month < 3) {
    const startYear = year - 1;
    const endYearShort = String(year).slice(-2);
    return `${startYear}-${endYearShort}`;
  } else {
    const startYear = year;
    const endYearShort = String(year + 1).slice(-2);
    return `${startYear}-${endYearShort}`;
  }
}

function isValidAcademicYearFormat(sessionStr) {
  if (!sessionStr || typeof sessionStr !== 'string') return false;
  // Format: YYYY-YY (e.g. 2024-25, 2025-26, 2026-27)
  return /^\d{4}-\d{2}$/.test(sessionStr.trim());
}

module.exports = {
  calculateCurrentAcademicYear,
  isValidAcademicYearFormat
};
