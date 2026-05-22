const commands = {
  '1B40': { name: 'reset', args: 0, description: 'Initialize printer' },
  '1B61': { name: 'align', args: 1, description: 'Set alignment' },
  '1B45': { name: 'bold', args: 1, description: 'Set bold' },
  '1B2D': { name: 'underline', args: 1, description: 'Set underline' },
  '1D21': { name: 'fontSize', args: 1, description: 'Set font size (double width/height)' },
  '1B4D': { name: 'codePage', args: 1, description: 'Select code page' },
  '1B32': { name: 'defaultLineSpacing', args: 0, description: 'Set default line spacing' },
  '1D42': { name: 'setLineSpacing', args: 1, description: 'Set line spacing' }
};

function findCommand(buffer, offset) {
  if (offset >= buffer.length) return null;

  const byte1 = buffer[offset];

  if (byte1 === 0x1B) {
    if (offset + 1 < buffer.length) {
      const byte2 = buffer[offset + 1];
      const cmd = `${byte1.toString(16).toUpperCase()}${byte2.toString(16).toUpperCase().padStart(2, '0')}`;
      if (commands[cmd]) {
        return {
          cmd: commands[cmd],
          offset: offset,
          length: 2 + commands[cmd].args
        };
      }
    }
  } else if (byte1 === 0x1D) {
    if (offset + 1 < buffer.length) {
      const byte2 = buffer[offset + 1];
      const cmd = `${byte1.toString(16).toUpperCase()}${byte2.toString(16).toUpperCase().padStart(2, '0')}`;
      if (commands[cmd]) {
        return {
          cmd: commands[cmd],
          offset: offset,
          length: 2 + commands[cmd].args
        };
      }
    }
  }

  return null;
}

module.exports = { commands, findCommand };