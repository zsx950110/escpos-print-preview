const express = require('express');
const normalizeHex = require('../parser/normalizeHex');
const hexToBuffer = require('../parser/hexToBuffer');
const parseEscpos = require('../parser/escposParser');
const renderToCanvas = require('../renderer/virtualPrinter');
const { exportPng } = require('../renderer/exportPng');

const router = express.Router();

const PAPER_WIDTHS = {
  '58mm': 384,
  '57mm': 378,
  '80mm': 576
};

router.post('/parse', (req, res) => {
  try {
    const { hex } = req.body;

    if (!hex) {
      return res.status(400).json({ error: 'HEX input is empty' });
    }

    const normalized = normalizeHex(hex);
    const buffer = hexToBuffer(normalized);
    const result = parseEscpos(buffer);

    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/render', (req, res) => {
  try {
    const { nodes, paperWidth } = req.body;

    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ error: 'Invalid nodes data' });
    }

    const width = PAPER_WIDTHS[paperWidth] || parseInt(paperWidth) || 576;
    const { canvas, width: w, height } = renderToCanvas(nodes, { paperWidth: width });
    const pngBuffer = exportPng(canvas);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', pngBuffer.length);
    res.send(pngBuffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/preview', (req, res) => {
  try {
    const { hex, paperWidth } = req.body;

    if (!hex) {
      return res.status(400).json({ error: 'HEX input is empty' });
    }

    const normalized = normalizeHex(hex);
    const buffer = hexToBuffer(normalized);
    const { nodes } = parseEscpos(buffer);

    const width = PAPER_WIDTHS[paperWidth] || parseInt(paperWidth) || 576;
    const { canvas } = renderToCanvas(nodes, { paperWidth: width });

    const pngBuffer = exportPng(canvas);
    const base64 = pngBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    res.json({
      dataUrl,
      pngBuffer: base64,
      width,
      height: canvas.height
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;