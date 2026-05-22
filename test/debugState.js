const normalizeHex = require('../src/parser/normalizeHex');
const hexToBuffer = require('../src/parser/hexToBuffer');
const parseEscpos = require('../src/parser/escposParser');
const PrintState = require('../src/model/printState');

const testHex = '1b4d301b45001d21001b2d301b61301b321d420020b6a9b5a5b1e0bac5a3ba44534f323630343238313334303139383732300a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7c3fbb3c6a3bad2bdd3c3cdb8c3f7d6cacbe1c4c6b7f3ccf90a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7d0cdbac5a3babad00a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7b9e6b8f1a3ba32356d6c7835c6ac0a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1d6a428b1b8b0b829b1e0bac5a3ba32303233323134303236320a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45011d21001b2d301b61301b321d4200b1b8b0b8c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac6f3d2b5a3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac5fabac5a3ba32303236303330310a1b4d301b45001d21001b2d301b61301b321d4200cbddd4b4c2eba3ba323630333239313432303039343631340a1b4d301b45001d21001b2d301b61301b321d4200b9bac2f2cafdc1bfa3ba310a1b4d301b45001d21001b2d301b61301b321d4200b5a5bcdba3ba302e30310a1b4d301b45001d21001b2d301b61301b321d4200bdf0b6eea3ba302e30310a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200c1e3cadbc6f3d2b5c3fbb3c63a20cfcdbfcdd0c5cfa2beadcffab2e2cad40a1b4d301b45001d21001b2d301b61301b321d4200b5d8d6b7a3bab9e3b6abcaa1c9eedbdacad0c4cfc9bdc7f8d4c1baa3bdd6b5c00a1b4d301b45001d21001b2d301b61301b321d4200b5e7bbb0a3ba2031353937393135313735310a1b4d301b45001d21001b2d301b61301b321d4200cffacadbc8d5c6daa3ba20323032362d30352d32302032313a35353a32370a1b4d301b45001d21001b2d301b61301b321d42000a0a0a1d5631';

const normalized = normalizeHex(testHex);
const buffer = hexToBuffer(normalized);
const { nodes } = parseEscpos(buffer);

const state = new PrintState();
state.paperWidth = 576;

console.log('初始状态:');
console.log('  lineHeight:', state.lineHeight);
console.log('  heightScale:', state.heightScale);
console.log('  y:', state.y);

let processedNodes = 0;
let foundFirstText = false;
let foundFirstNewline = false;

for (let i = 0; i < nodes.length && processedNodes < 30; i++) {
  const node = nodes[i];

  if (node.type === 'fontSize') {
    state.applyNode(node);
    console.log(`\n[${i}] fontSize: widthScale=${node.widthScale}, heightScale=${node.heightScale}`);
    console.log('  state: lineHeight=' + state.lineHeight + ', heightScale=' + state.heightScale);
    processedNodes++;
  } else if (node.type === 'setLineSpacing') {
    state.applyNode(node);
    console.log(`\n[${i}] setLineSpacing: value=${node.value}`);
    console.log('  state: lineHeight=' + state.lineHeight + ', heightScale=' + state.heightScale);
    processedNodes++;
  } else if (node.type === 'defaultLineSpacing') {
    state.applyNode(node);
    console.log(`\n[${i}] defaultLineSpacing`);
    console.log('  state: lineHeight=' + state.lineHeight + ', heightScale=' + state.heightScale);
    processedNodes++;
  } else if (node.type === 'text' && !foundFirstText) {
    console.log(`\n[${i}] text (first): "${node.value.substring(0, 30)}..."`);
    console.log('  state before applying: lineHeight=' + state.lineHeight + ', heightScale=' + state.heightScale);
    console.log('  lineHeight * heightScale = ' + (state.lineHeight * state.heightScale));
    foundFirstText = true;
    processedNodes++;
  } else if (node.type === 'newline' && !foundFirstNewline) {
    console.log(`\n[${i}] newline (first)`);
    console.log('  state before applying: lineHeight=' + state.lineHeight + ', heightScale=' + state.heightScale);
    const increment = state.lineHeight * state.heightScale;
    console.log('  increment would be: ' + increment);
    foundFirstNewline = true;
    processedNodes++;
  } else if (node.type === 'reset') {
    state.applyNode(node);
    console.log(`\n[${i}] reset`);
    console.log('  state: lineHeight=' + state.lineHeight + ', heightScale=' + state.heightScale);
    processedNodes++;
  } else if (node.type === 'codePage') {
    console.log(`\n[${i}] codePage: ${node.value}`);
    console.log('  state: lineHeight=' + state.lineHeight + ', heightScale=' + state.heightScale);
    processedNodes++;
  } else if (node.type === 'bold') {
    console.log(`\n[${i}] bold: ${node.value}`);
    processedNodes++;
  } else if (node.type === 'underline') {
    console.log(`\n[${i}] underline: ${node.value}`);
    processedNodes++;
  } else if (node.type === 'align') {
    console.log(`\n[${i}] align: ${node.value}`);
    processedNodes++;
  } else if (node.type === 'cut') {
    console.log(`\n[${i}] cut`);
    processedNodes++;
  } else {
    console.log(`\n[${i}] ${node.type}`);
    processedNodes++;
  }
}