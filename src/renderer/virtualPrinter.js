const { createCanvas } = require('@napi-rs/canvas');
const PrintState = require('../model/printState');
const { drawText } = require('./textRenderer');

function renderToCanvas(nodes, options = {}) {
  const paperWidth = options.paperWidth || 576;
  const marginLeft = options.marginLeft || 0;
  const marginRight = options.marginRight || 0;

  const state = new PrintState();
  state.paperWidth = paperWidth;

  let maxY = 0;
  const lines = [];
  let currentLine = { content: [], state: state.clone() };

  nodes.forEach(node => {
    if (node.type === 'text') {
      currentLine.content.push({ type: 'text', value: node.value });
    } else if (node.type === 'newline') {
      if (currentLine.content.length > 0) {
        lines.push(currentLine);
        maxY += state.lineHeight * state.heightScale;
      }
      currentLine = { content: [], state: state.clone() };
    } else if (node.type === 'cut') {
      if (currentLine.content.length > 0) {
        lines.push(currentLine);
        maxY += state.lineHeight * state.heightScale;
      }
      maxY += 40;
      currentLine = { content: [], state: state.clone() };
    } else {
      state.applyNode(node);
      currentLine.state = state.clone();
    }
  });

  if (currentLine.content.length > 0) {
    lines.push(currentLine);
    maxY += state.lineHeight * state.heightScale;
  }

  maxY = Math.max(maxY, 100);

  const canvas = createCanvas(paperWidth, maxY);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, paperWidth, maxY);

  let currentY = 0;

  lines.forEach(line => {
    const lineState = line.state;
    let currentX = marginLeft;

    line.content.forEach(item => {
      if (item.type === 'text') {
        currentX = drawText(ctx, item.value, currentX, currentY, lineState);
      }
    });

    currentY += lineState.lineHeight * lineState.heightScale;
  });

  return { canvas, width: paperWidth, height: maxY };
}

module.exports = renderToCanvas;