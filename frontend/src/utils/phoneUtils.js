/**
 * Normalize a Myanmar phone number to the 09XXXXXXXXX format.
 * Handles +959, 959, and 09 prefixes and strips spaces/dashes.
 *
 * @param {string} phone
 * @returns {string}
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return phone;
  const cleaned = String(phone).replace(/[\s\-]/g, '');
  if (cleaned.startsWith('+959')) return '09' + cleaned.slice(4);
  if (cleaned.startsWith('959')) return '09' + cleaned.slice(3);
  return cleaned;
};
