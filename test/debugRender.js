const { createCanvas } = require('@napi-rs/canvas');
const PrintState = require('../src/model/printState');

const nodes = [
  { type: 'reset' },
  { type: 'align', value: 'center' },
  { type: 'text', value: 'Hello' },
  { type: 'newline' },
  { type: 'cut' }
];

const paperWidth = 576;
const state = new PrintState();
state.paperWidth = paperWidth;

console.log('初始状态:');
console.log('  x:', state.x, 'y:', state.y);
console.log('  lineHeight:', state.lineHeight);
console.log('  heightScale:', state.heightScale);

const lines = [];
let currentLine = { content: [], state: state.clone() };
let maxY = 0;

console.log('\n处理节点:');
nodes.forEach((node, i) => {
  console.log(`\n[${i}] ${node.type}${node.value ? ': ' + node.value : ''}`);

  if (node.type === 'text') {
    currentLine.content.push({ type: 'text', value: node.value });
    console.log('  currentLine.content.length:', currentLine.content.length);
  } else if (node.type === 'newline') {
    console.log('  处理换行...');
    console.log('  currentLine.content.length:', currentLine.content.length);
    if (currentLine.content.length > 0) {
      lines.push(currentLine);
      maxY += state.lineHeight * state.heightScale;
      console.log('  推入行, maxY +=', state.lineHeight * state.heightScale);
    }
    currentLine = { content: [], state: state.clone() };
    state.applyNode(node);
    console.log('  state.y after newline:', state.y);
  } else if (node.type === 'cut') {
    console.log('  处理切纸...');
    if (currentLine.content.length > 0) {
      lines.push(currentLine);
      maxY += state.lineHeight * state.heightScale;
    }
    maxY += 40;
    currentLine = { content: [], state: state.clone() };
    state.applyNode(node);
  } else {
    state.applyNode(node);
  }

  console.log('  state: x=' + state.x + ' y=' + state.y + ' lineHeight=' + state.lineHeight + ' heightScale=' + state.heightScale);
});

if (currentLine.content.length > 0) {
  lines.push(currentLine);
  maxY += state.lineHeight * state.heightScale;
}

console.log('\n最终结果:');
console.log('  lines.length:', lines.length);
console.log('  maxY:', maxY);
console.log('  期望高度: 至少', lines.length, '* 32 =', lines.length * 32);

const canvas = createCanvas(paperWidth, Math.max(maxY, 100));
console.log('  canvas.height:', canvas.height);

const ctx = canvas.getContext('2d');
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, paperWidth, canvas.height);

let currentY = 0;
lines.forEach((line, i) => {
  const lineState = line.state;
  console.log(`\n绘制行 ${i}: y=${currentY}, align=${lineState.align}, content=`, line.content.map(c => c.value));

  line.content.forEach(item => {
    const fontSize = 16 * lineState.heightScale;
    ctx.font = `${lineState.bold ? 'bold ' : ''}${fontSize}px Arial`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';

    let effectiveX = 0;
    if (lineState.align === 'center') {
      effectiveX = (paperWidth - item.value.length * 12) / 2;
    }

    ctx.fillText(item.value, effectiveX, currentY);
    console.log('    绘制文本 at x=' + effectiveX + ', y=' + currentY);
  });

  currentY += lineState.lineHeight * lineState.heightScale;
});

console.log('\n最终 currentY:', currentY);

const buffer = canvas.toBuffer('image/png');
console.log('PNG buffer 长度:', buffer.length);