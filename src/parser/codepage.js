const iconv = require('iconv-lite');

const codePageMap = {
  0: 'cp437',
  1: 'cp932',
  2: 'cp850',
  3: 'cp860',
  4: 'cp863',
  5: 'cp865',
  6: 'cp852',
  7: 'cp855',
  8: 'cp866',
  9: 'cp857',
  10: 'cp861',
  11: 'cp862',
  12: 'cp864',
  13: 'cp737',
  14: 'cp858',
  15: 'cp874',
  16: 'cp936',
  17: 'cp949',
  18: 'cp950',
  19: 'cp875',
  32: 'cp1252',
  33: 'cp1250',
  34: 'cp1251',
  35: 'cp1253',
  36: 'cp1254',
  37: 'cp1255',
  38: 'cp1256',
  39: 'cp1257',
  40: 'cp1258',
  41: 'cp720',
  42: 'cp775',
  43: 'cp856',
  44: 'cp870',
  45: 'cp1006',
  46: 'cp1026',
  47: 'cp1259',
  48: 'cp1047',
  30: 'utf8'
};

function getEncoding(codePage) {
  return codePageMap[codePage] || 'gbk';
}

function decode(buffer, codepage = 'gbk') {
  try {
    return iconv.decode(buffer, codepage);
  } catch (e) {
    throw new Error(`Cannot decode with encoding ${codepage}`);
  }
}

module.exports = { codePageMap, getEncoding, decode };