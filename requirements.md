
# ESC/POS HEX 文字预览系统设计文档（最终版）

## 1. 项目目标

本项目用于把用户输入的 ESC/POS HEX 解析成可视化预览结果，要求：

- 只处理文字内容
- 不处理图片、二维码、条码
- 预览效果尽可能接近最终热敏打印结果
- 使用 Node.js 或纯 JavaScript
- 输出方式以 Canvas 位图 为准，HTML 只负责展示图片

---

## 2. 核心结论

如果目标是“预览效果和最终打印保持一致”，那么最合适的方案是：

ESC/POS HEX
    ↓
解析
    ↓
打印状态机
    ↓
Canvas 位图渲染
    ↓
PNG
    ↓
HTML 预览

不要直接用 HTML 的 div/span 去模拟排版。

因为 HTML 排版引擎和热敏打印机的字宽、行高、对齐、倍宽倍高表现并不一致。

---

## 3. 目标范围

### 3.1 支持内容

- 普通文本
- 换行
- 回车
- 左对齐 / 居中 / 右对齐
- 加粗
- 下划线
- 字号倍宽倍高
- 初始化命令
- 文字编码处理（GBK / UTF-8）

### 3.2 不支持内容

- 图片
- 条码
- 二维码
- 图形
- 厂商私有扩展图像命令

---

## 4. 技术路线

推荐路线：

- Node.js 负责解析与渲染
- 使用 node-canvas 生成位图
- HTML 页面只负责显示最终 PNG

原因：

1. 热敏打印机本质是位图输出设备
2. Canvas 可以更接近真实打印效果
3. PNG 可以直接用于预览
4. 便于统一“预览”和“打印”的结果

---

## 5. 总体架构

用户输入 HEX
    ↓
HEX 归一化
    ↓
HEX → Buffer
    ↓
ESC/POS Parser
    ↓
打印状态机
    ↓
Canvas 渲染
    ↓
PNG 输出
    ↓
HTML 预览

---

## 6. 项目结构

escpos-text-preview/
├── package.json
├── src/
│   ├── app.js
│   ├── parser/
│   │   ├── normalizeHex.js
│   │   ├── hexToBuffer.js
│   │   ├── escposParser.js
│   │   ├── commandTable.js
│   │   └── codepage.js
│   ├── model/
│   │   ├── printState.js
│   │   └── nodes.js
│   ├── renderer/
│   │   ├── virtualPrinter.js
│   │   ├── textRenderer.js
│   │   └── exportPng.js
│   └── server/
│       └── api.js
└── public/
    └── index.html

---

## 7. 输入格式

支持以下输入：

1B401B610148656C6C6F0A1D5600

或者：

1B 40 1B 61 01 48 65 6C 6C 6F

或者：

0x1B 0x40 ...

---

## 8. HEX 归一化规则

输入前统一处理：

- 删除空格、换行、Tab
- 删除 0x
- 转成大写
- 校验是否为偶数长度
- 校验是否只包含 [0-9A-F]

归一化后：

1B401B610148656C6C6F0A1D5600

---

## 9. Parser 设计

Parser 职责：

- 读取 Buffer
- 识别 ESC/POS 命令
- 更新打印状态
- 提取普通文本
- 输出节点流

建议输出结构：

[
  { type: 'reset' },
  { type: 'align', value: 'center' },
  { type: 'bold', value: true },
  { type: 'text', value: 'Hello' },
  { type: 'newline' }
]

---

## 10. 打印状态机

状态结构：

{
  x: 0,
  y: 0,
  align: 'left',
  bold: false,
  underline: false,
  inverse: false,
  widthScale: 1,
  heightScale: 1,
  lineHeight: 32,
  paperWidth: 576,
  codepage: 'gbk'
}

状态来源：

- ESC @：重置
- ESC a n：对齐
- ESC E n：加粗
- ESC - n：下划线
- GS ! n：倍宽倍高

---

## 11. 支持的 ESC/POS 命令

第一版支持：

| 命令 | HEX | 含义 |
|---|---|---|
| ESC @ | 1B 40 | 初始化 |
| ESC a n | 1B 61 n | 对齐 |
| ESC E n | 1B 45 n | 加粗 |
| ESC - n | 1B 2D n | 下划线 |
| GS ! n | 1D 21 n | 倍宽倍高 |
| LF | 0A | 换行 |
| CR | 0D | 回车 |
| GS V m | 1D 56 m | 切纸 |

---

## 12. 文本解码

常见编码：

- GBK
- GB2312
- UTF-8

建议：

默认使用：

codepage = 'gbk'

并支持手动切换。

乱码优先排查编码问题。

---

## 13. Canvas 渲染方案

Canvas 更接近真实热敏打印机：

- 固定字体
- 固定字宽
- 固定行高
- 按像素绘制
- 可直接输出 PNG

渲染原则：

- 每一行按状态绘制
- 每个文本片段按样式绘制
- 对齐、粗体、下划线全部在 Canvas 层实现

---

## 14. 纸张宽度

建议做成配置：

{
  paperWidthPx: 576,
  marginLeftPx: 0,
  marginRightPx: 0
}

常见值：

- 58mm：384px
- 80mm：576px

默认推荐：

576px

---

## 15. 文本布局规则

基本原则：

- 以“行”为单位
- 遇到换行结束当前行
- 行内按状态绘制

对齐规则：

左对齐：
x = 0

居中：
x = (paperWidth - textWidth) / 2

右对齐：
x = paperWidth - textWidth

---

## 16. 字体策略

建议：

- 使用固定等宽字体
- 单独准备中文字体
- Node.js 中注册字体
- 不依赖系统字体

---

## 17. 文字效果

### 加粗

使用粗体字体。

### 下划线

在基线下绘制线条。

### 倍宽倍高

根据 GS ! n 重新计算绘制尺寸。

---

## 18. 输出方式

Canvas 输出：

canvas.toBuffer('image/png')

HTML 只展示：

<img src="data:image/png;base64,..." />

不要再使用 div/span 模拟。

---

## 19. 预览页面

页面布局：

左侧：
HEX 输入框

中间：
预览按钮

右侧：
PNG 预览图

流程：

1. 输入 HEX
2. 点击预览
3. 调用解析接口
4. 返回 PNG
5. 页面展示 PNG

---

## 20. API 设计

### parseHex()

parseHex(hexString)

返回：

{
  nodes: [],
  warnings: [],
  errors: []
}

---

### renderReceipt()

renderReceipt(nodes)

返回：

{
  pngBuffer,
  width,
  height
}

---

### previewHex()

previewHex(hexString)

返回：

{
  dataUrl,
  pngBuffer
}

---

## 21. 错误处理

常见错误：

- HEX 非法字符
- HEX 长度不是偶数
- 命令参数不足
- 编码不匹配
- 输入为空

建议错误提示：

第 18 个字符不是合法 HEX 字符

ESC a 命令参数不足，位于偏移 32

当前编码 gbk 无法正确解码

---

## 22. MVP 范围

第一版必须完成：

- HEX 输入
- HEX 校验
- ESC/POS 基础命令解析
- 打印状态机
- Canvas 文字渲染
- PNG 输出
- HTML 图片预览

第一版不处理：

- 图片
- 条码
- 二维码
- 图形
- 多页
- 厂商私有扩展

---

## 23. 设计原则

原则1：

不要把小票当网页。

原则2：

要把小票当位图。

原则3：

预览和打印尽量共享同一渲染结果。

原则4：

先保证文字高保真。

---

## 24. 最终结论

最终推荐方案：

ESC/POS HEX
    ↓
Parser
    ↓
打印状态机
    ↓
Canvas 位图渲染
    ↓
PNG
    ↓
HTML 预览

这是目前最适合“文字热敏小票预览”的方案。

---

## 25. 一句话总结

不要用 HTML 模拟热敏打印。

要直接把小票渲染成图片，再在 HTML 中展示。

