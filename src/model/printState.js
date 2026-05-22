class PrintState {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.align = 'left';
    this.bold = false;
    this.underline = false;
    this.inverse = false;
    this.widthScale = 1;
    this.heightScale = 1;
    this.lineHeight = 32;
    this.paperWidth = 576;
    this.codepage = 'gbk';
    this.fontSize = 0;
  }

  applyNode(node) {
    switch (node.type) {
      case 'reset':
        this.reset();
        break;
      case 'align':
        this.align = node.value;
        break;
      case 'bold':
        this.bold = node.value;
        break;
      case 'underline':
        this.underline = node.value;
        break;
      case 'fontSize':
        this.widthScale = node.widthScale;
        this.heightScale = node.heightScale;
        break;
      case 'codePage':
        this.codepage = node.value === 30 ? 'utf8' : 'gbk';
        break;
      case 'defaultLineSpacing':
        this.lineHeight = 32;
        break;
      case 'setLineSpacing':
        if (node.value === 0) {
          this.lineHeight = 32;
        } else {
          this.lineHeight = Math.max(node.value, 24);
        }
        break;
      case 'newline':
        this.x = 0;
        this.y += this.lineHeight * this.heightScale;
        break;
      case 'cut':
        this.y += 40;
        break;
    }
  }

  clone() {
    const cloned = new PrintState();
    cloned.x = this.x;
    cloned.y = this.y;
    cloned.align = this.align;
    cloned.bold = this.bold;
    cloned.underline = this.underline;
    cloned.inverse = this.inverse;
    cloned.widthScale = this.widthScale;
    cloned.heightScale = this.heightScale;
    cloned.lineHeight = this.lineHeight;
    cloned.paperWidth = this.paperWidth;
    cloned.codepage = this.codepage;
    cloned.fontSize = this.fontSize;
    return cloned;
  }
}

module.exports = PrintState;