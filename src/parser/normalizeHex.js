function normalizeHex(hexString) {
  if (!hexString) {
    throw new Error('Input is empty');
  }

  let normalized = hexString
    .replace(/\s/g, '')
    .replace(/0x/gi, '')
    .toUpperCase();

  if (normalized.length % 2 !== 0) {
    throw new Error('HEX length must be even');
  }

  const validChars = /^[0-9A-F]*$/;
  if (!validChars.test(normalized)) {
    const invalidIndex = normalized.split('').findIndex(c => !/[0-9A-F]/.test(c));
    throw new Error(`Character at position ${invalidIndex + 1} is not a valid HEX character`);
  }

  return normalized;
}

module.exports = normalizeHex;