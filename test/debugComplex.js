const normalizeHex = require('../src/parser/normalizeHex');
const hexToBuffer = require('../src/parser/hexToBuffer');
const parseEscpos = require('../src/parser/escposParser');
const { createCanvas } = require('@napi-rs/canvas');
const PrintState = require('../src/model/printState');

const testHex = '1b4d301b45001d21001b2d301b61301b321d420020b6a9b5a5b1e0bac5a3ba44534f323630343238313334303139383732300a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7c3fbb3c6a3bad2bdd3c3cdb8c3f7d6cacbe1c4c6b7f3ccf90a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7d0cdbac5a3babad00a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7b9e6b8f1a3ba32356d6c7835c6ac0a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1d6a428b1b8b0b829b1e0bac5a3ba32303233323134303236320a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45011d21001b2d301b61301b321d4200b1b8b0b8c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac6f3d2b5a3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac5fabac5a3ba32303236303330310a1b4d301b45001d21001b2d301b61301b321d4200cbddd4b4c2eba3ba323630333239313432303039343631340a1b4d301b45001d21001b2d301b61301b321d4200b9bac2f2cafdc1bfa3ba310a1b4d301b45001d21001b2d301b61301b321d4200b5a5bcdba3ba302e30310a1b4d301b45001d21001b2d301b61301b321d4200bdf0b6eea3ba302e30310a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200c1e3cadbc6f3d2b5c3fbb3c63a20cfcdbfcdd0c5cfa2beadcffab2e2cad40a1b4d301b45001d21001b2d301b61301b321d4200b5d8d6b7a3bab9e3b6abcaa1c9eedbdacad0c4cfc9bdc7f8d4c1baa3bdd6b5c00a1b4d301b45001d21001b2d301b61301b321d4200b5e7bbb0a3ba2031353937393135313735310a1b4d301b45001d21001b2d301b61301b321d4200cffacadbc8d5c6daa3ba20323032362d30352d32302032313a35353a32370a1b4d301b45001d21001b2d301b61301b321d42000a0a0a1d5631';

const normalized = normalizeHex(testHex);
const buffer = hexToBuffer(normalized);
const { nodes } = parseEscpos(buffer);

console.log('总节点数:', nodes.length);
console.log('换行符数量:', nodes.filter(n => n.type === 'newline').length);
console.log('文本节点数量:', nodes.filter(n => n.type === 'text').length);
console.log('切纸命令数量:', nodes.filter(n => n.type === 'cut').length);

const paperWidth = 576;
const state = new PrintState();
state.paperWidth = paperWidth;

let maxY = 0;
const lines = [];
let currentLine = { content: [], state: state.clone() };

let newlineCount = 0;
let textCount = 0;

nodes.forEach((node, i) => {
  if (node.type === 'text') {
    currentLine.content.push({ type: 'text', value: node.value });
    textCount++;
  } else if (node.type === 'newline') {
    newlineCount++;
    if (currentLine.content.length > 0) {
      lines.push(currentLine);
      const lineY = state.lineHeight * state.heightScale;
      maxY += lineY;
      console.log(`换行 ${newlineCount}: 推入行, maxY += ${lineY}, 当前maxY=${maxY}`);
    } else {
      console.log(`换行 ${newlineCount}: 当前行无内容, 跳过`);
    }
    currentLine = { content: [], state: state.clone() };
    state.applyNode(node);
  } else if (node.type === 'cut') {
    if (currentLine.content.length > 0) {
      lines.push(currentLine);
      maxY += state.lineHeight * state.heightScale;
    }
    maxY += 40;
    currentLine = { content: [], state: state.clone() };
    state.applyNode(node);
  } else {
    state.applyNode(node);
    currentLine.state = state.clone();
  }
});

if (currentLine.content.length > 0) {
  lines.push(currentLine);
  maxY += state.lineHeight * state.heightScale;
}

console.log('\n统计:');
console.log('  实际换行次数:', newlineCount);
console.log('  文本节点数量:', textCount);
console.log('  推入的行数:', lines.length);
console.log('  maxY:', maxY);
console.log('  canvas 高度:', Math.max(maxY, 100));

console.log('\n前10行的内容:');
lines.slice(0, 10).forEach((line, i) => {
  const text = line.content.map(c => c.value).join('');
  console.log(`  行${i}: "${text.substring(0, 40)}..."`);
});