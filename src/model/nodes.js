class Node {
  constructor(type) {
    this.type = type;
  }
}

class ResetNode extends Node {
  constructor() {
    super('reset');
  }
}

class AlignNode extends Node {
  constructor(value) {
    super('align');
    this.value = value;
  }
}

class BoldNode extends Node {
  constructor(value) {
    super('bold');
    this.value = value;
  }
}

class UnderlineNode extends Node {
  constructor(value) {
    super('underline');
    this.value = value;
  }
}

class FontSizeNode extends Node {
  constructor(widthScale, heightScale) {
    super('fontSize');
    this.widthScale = widthScale;
    this.heightScale = heightScale;
  }
}

class TextNode extends Node {
  constructor(value) {
    super('text');
    this.value = value;
  }
}

class NewlineNode extends Node {
  constructor() {
    super('newline');
  }
}

class CutNode extends Node {
  constructor() {
    super('cut');
  }
}

module.exports = {
  Node,
  ResetNode,
  AlignNode,
  BoldNode,
  UnderlineNode,
  FontSizeNode,
  TextNode,
  NewlineNode,
  CutNode
};