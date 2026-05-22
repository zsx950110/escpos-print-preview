function exportPng(canvas) {
  return canvas.toBuffer('image/png');
}

function exportBase64(canvas) {
  return canvas.toBuffer('image/png').toString('base64');
}

module.exports = { exportPng, exportBase64 };