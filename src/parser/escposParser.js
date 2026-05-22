const { findCommand } = require('./commandTable');
const { decode } = require('./codepage');

function parseEscpos(buffer) {
  const nodes = [];
  const warnings = [];
  const errors = [];

  let i = 0;
  let currentText = [];
  let currentCodepage = 'gbk';

  while (i < buffer.length) {
    const cmdInfo = findCommand(buffer, i);

    if (cmdInfo) {
      if (currentText.length > 0) {
        const textBuffer = Buffer.from(currentText);
        try {
          const text = decode(textBuffer, currentCodepage);
          nodes.push({ type: 'text', value: text });
        } catch (e) {
          errors.push(e.message);
          nodes.push({ type: 'text', value: textBuffer.toString('hex') });
        }
        currentText = [];
      }

      const { cmd, offset, length } = cmdInfo;
      const args = [];

      for (let j = 0; j < cmd.args; j++) {
        if (offset + 2 + j < buffer.length) {
          args.push(buffer[offset + 2 + j]);
        } else {
          errors.push(`${cmd.description} command missing argument at offset ${offset}`);
        }
      }

      switch (cmd.name) {
        case 'reset':
          nodes.push({ type: 'reset' });
          break;
        case 'align':
          const alignMap = { 0: 'left', 1: 'center', 2: 'right' };
          nodes.push({ type: 'align', value: alignMap[args[0]] || 'left' });
          break;
        case 'bold':
          nodes.push({ type: 'bold', value: args[0] !== 0 && args[0] !== 0x30 });
          break;
        case 'underline':
          nodes.push({ type: 'underline', value: args[0] !== 0 && args[0] !== 0x30 });
          break;
        case 'fontSize':
          const n = args[0];
          const widthScale = ((n >> 4) & 0x0F) || 1;
          const heightScale = (n & 0x0F) || 1;
          nodes.push({ type: 'fontSize', widthScale, heightScale });
          break;
        case 'codePage':
          const newCodepage = args[0];
          if (newCodepage === 30) {
            currentCodepage = 'utf8';
          } else if (newCodepage === 16) {
            currentCodepage = 'gbk';
          }
          nodes.push({ type: 'codePage', value: newCodepage });
          break;
        case 'defaultLineSpacing':
          nodes.push({ type: 'defaultLineSpacing' });
          break;
        case 'setLineSpacing':
          nodes.push({ type: 'setLineSpacing', value: args[0] });
          break;
        default:
          warnings.push(`Unknown command: ${cmd.name}`);
      }

      i = offset + length;
    } else {
      const byte = buffer[i];

      if (byte === 0x0A) {
        if (currentText.length > 0) {
          const textBuffer = Buffer.from(currentText);
          try {
            const text = decode(textBuffer, currentCodepage);
            nodes.push({ type: 'text', value: text });
          } catch (e) {
            errors.push(e.message);
            nodes.push({ type: 'text', value: textBuffer.toString('hex') });
          }
          currentText = [];
        }
        nodes.push({ type: 'newline' });
        i++;
      } else if (byte === 0x0D) {
        i++;
      } else if (byte === 0x1D && i + 1 < buffer.length && buffer[i + 1] === 0x56) {
        nodes.push({ type: 'cut' });
        i += 3;
      } else {
        currentText.push(byte);
        i++;
      }
    }
  }

  if (currentText.length > 0) {
    const textBuffer = Buffer.from(currentText);
    try {
      const text = decode(textBuffer, currentCodepage);
      nodes.push({ type: 'text', value: text });
    } catch (e) {
      errors.push(e.message);
      nodes.push({ type: 'text', value: textBuffer.toString('hex') });
    }
  }

  return { nodes, warnings, errors };
}

module.exports = parseEscpos;