const normalizeHex = require('../src/parser/normalizeHex');
const hexToBuffer = require('../src/parser/hexToBuffer');
const parseEscpos = require('../src/parser/escposParser');

const testHex = '1b401b610148656c6c6f0a1d5600';

console.log('测试简单 HEX 数据: 1B401B610148656C6C6F0A1D5600\n');

try {
  const normalized = normalizeHex(testHex);
  console.log('归一化:', normalized);

  const buffer = hexToBuffer(normalized);
  console.log('Buffer:', buffer);

  const { nodes, warnings, errors } = parseEscpos(buffer);

  console.log('\n节点列表:');
  nodes.forEach((node, i) => {
    if (node.type === 'text') {
      console.log(`  [${i}] ${node.type}: "${node.value}" (${Buffer.from(node.value).toString('hex')})`);
    } else {
      console.log(`  [${i}] ${node.type}:`, node.value);
    }
  });

  console.log('\n换行符 (0x0A) 处理:');
  console.log('  0x0A 的十进制:', 0x0A, '(LF)');
  console.log('  0x0D 的十进制:', 0x0D, '(CR)');
  console.log('  Buffer 中 0x0A 的位置:', buffer.indexOf(0x0A));

} catch (e) {
  console.error('错误:', e.message);
}