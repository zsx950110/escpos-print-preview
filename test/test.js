const normalizeHex = require('../src/parser/normalizeHex');
const hexToBuffer = require('../src/parser/hexToBuffer');
const parseEscpos = require('../src/parser/escposParser');
const renderToCanvas = require('../src/renderer/virtualPrinter');
const { exportPng } = require('../src/renderer/exportPng');

const testHex = '1b4d301b45001d21001b2d301b61301b321d420020b6a9b5a5b1e0bac5a3ba44534f323630343238313334303139383732300a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7c3fbb3c6a3bad2bdd3c3cdb8c3f7d6cacbe1c4c6b7f3ccf90a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7d0cdbac5a3babad00a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7b9e6b8f1a3ba32356d6c7835c6ac0a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1d6a428b1b8b0b829b1e0bac5a3ba32303233323134303236320a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45011d21001b2d301b61301b321d4200b1b8b0b8c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac6f3d2b5a3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac5fabac5a3ba32303236303330310a1b4d301b45001d21001b2d301b61301b321d4200cbddd4b4c2eba3ba323630333239313432303039343631340a1b4d301b45001d21001b2d301b61301b321d4200b9bac2f2cafdc1bfa3ba310a1b4d301b45001d21001b2d301b61301b321d4200b5a5bcdba3ba302e30310a1b4d301b45001d21001b2d301b61301b321d4200bdf0b6eea3ba302e30310a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200c1e3cadbc6f3d2b5c3fbb3c63a20cfcdbfcdd0c5cfa2beadcffab2e2cad40a1b4d301b45001d21001b2d301b61301b321d4200b5d8d6b7a3bab9e3b6abcaa1c9eedbdacad0c4cfc9bdc7f8d4c1baa3bdd6b5c00a1b4d301b45001d21001b2d301b61301b321d4200b5e7bbb0a3ba2031353937393135313735310a1b4d301b45001d21001b2d301b61301b321d4200cffacadbc8d5c6daa3ba20323032362d30352d32302032313a35353a32370a1b4d301b45001d21001b2d301b61301b321d42000a0a0a1d5631';

console.log('Testing ESC/POS HEX parsing...\n');

const normalized = normalizeHex(testHex);
console.log(`HEX normalization: ${normalized.length} chars`);

const buffer = hexToBuffer(normalized);
console.log(`Buffer size: ${buffer.length} bytes\n`);

const { nodes, warnings, errors } = parseEscpos(buffer);
console.log(`Parsed ${nodes.length} nodes`);
console.log(`Warnings: ${warnings.length}, Errors: ${errors.length}\n`);

const textNodes = nodes.filter(n => n.type === 'text');
const newlineNodes = nodes.filter(n => n.type === 'newline');
const underlineNodes = nodes.filter(n => n.type === 'underline');

console.log(`Text nodes: ${textNodes.length}`);
console.log(`Newline nodes: ${newlineNodes.length}`);
console.log(`Underline nodes: ${underlineNodes.length}\n`);

const { canvas, width, height } = renderToCanvas(nodes, { paperWidth: 576 });
console.log(`Canvas size: ${width} x ${height}\n`);

const pngBuffer = exportPng(canvas);
console.log(`PNG size: ${pngBuffer.length} bytes\n`);

console.log('First 10 text nodes:');
textNodes.slice(0, 10).forEach((node, i) => {
  const preview = node.value.length > 40 ? node.value.substring(0, 40) + '...' : node.value;
  console.log(`  [${i}] "${preview}"`);
});

console.log('\n=== Test Complete ===');