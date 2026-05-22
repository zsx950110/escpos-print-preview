const { createCanvas } = require('@napi-rs/canvas');

function measureText(text, fontSize = 16, widthScale = 1, isBold = false) {
  const defaultWidth = 12 * widthScale;
  let width = 0;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
      width += defaultWidth * 2;
    } else {
      width += defaultWidth;
    }
  }

  return {
    width: width,
    height: fontSize * 1.5
  };
}

function drawText(ctx, text, x, y, state) {
  const fontSize = 16 * state.heightScale;

  ctx.font = `${state.bold ? 'bold ' : ''}${fontSize}px Arial, "Microsoft YaHei", SimHei, SimSun, sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  let effectiveX = x;

  if (state.align === 'center') {
    const textWidth = measureText(text, fontSize, state.widthScale, state.bold).width;
    effectiveX = (state.paperWidth - textWidth) / 2;
  } else if (state.align === 'right') {
    const textWidth = measureText(text, fontSize, state.widthScale, state.bold).width;
    effectiveX = state.paperWidth - textWidth;
  }

  ctx.save();
  if (state.widthScale !== 1) {
    ctx.scale(state.widthScale, 1);
    ctx.fillText(text, effectiveX / state.widthScale, y);
  } else {
    ctx.fillText(text, effectiveX, y);
  }
  ctx.restore();

  if (state.underline) {
    const textWidth = measureText(text, fontSize, state.widthScale, state.bold).width;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(effectiveX, y + fontSize + 2);
    ctx.lineTo(effectiveX + textWidth, y + fontSize + 2);
    ctx.stroke();
  }

  return effectiveX + measureText(text, fontSize, state.widthScale, state.bold).width;
}

module.exports = { measureText, drawText };