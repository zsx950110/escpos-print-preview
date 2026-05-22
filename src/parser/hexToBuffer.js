function hexToBuffer(hexString) {
  const length = hexString.length;
  const buffer = Buffer.alloc(length / 2);

  for (let i = 0; i < length; i += 2) {
    buffer[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }

  return buffer;
}

module.exports = hexToBuffer;