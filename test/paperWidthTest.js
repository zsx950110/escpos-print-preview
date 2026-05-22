const http = require('http');

const testHex = '1b4d301b45001d21001b2d301b61301b321d420020b6a9b5a5b1e0bac5a3ba44534f323630343238313334303139383732300a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7c3fbb3c6a3bad2bdd3c3cdb8c3f7d6cacbe1c4c6b7f3ccf90a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7d0cdbac5a3babad00a1b4d301b45001d21001b2d301b61301b321d4200b2fac6b7b9e6b8f1a3ba32356d6c7835c6ac0a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1d6a428b1b8b0b829b1e0bac5a3ba32303233323134303236320a1b4d301b45001d21001b2d301b61301b321d4200d7a2b2e1c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45011d21001b2d301b61301b321d4200b1b8b0b8c8cba3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac6f3d2b5a3bababcd6ddd6d0cacac9faceefbfc6bcbcd3d0cfdeb9abcbbe0a1b4d301b45001d21001b2d301b61301b321d4200c9fab2fac5fabac5a3ba32303236303330310a1b4d301b45001d21001b2d301b61301b321d4200cbddd4b4c2eba3ba323630333239313432303039343631340a1b4d301b45001d21001b2d301b61301b321d4200b9bac2f2cafdc1bfa3ba310a1b4d301b45001d21001b2d301b61301b321d4200b5a5bcdba3ba302e30310a1b4d301b45001d21001b2d301b61301b321d4200bdf0b6eea3ba302e30310a1b4d301b45001d21001b2d301b61311b321d42002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b4d301b45001d21001b2d301b61301b321d4200c1e3cadbc6f3d2b5c3fbb3c63a20cfcdbfcdd0c5cfa2beadcffab2e2cad40a1b4d301b45001d21001b2d301b61301b321d4200b5d8d6b7a3bab9e3b6abcaa1c9eedbdacad0c4cfc9bdc7f8d4c1baa3bdd6b5c00a1b4d301b45001d21001b2d301b61301b321d4200b5e7bbb0a3ba2031353937393135313735310a1b4d301b45001d21001b2d301b61301b321d4200cffacadbc8d5c6daa3ba20323032362d30352d32302032313a35353a32370a1b4d301b45001d21001b2d301b61301b321d42000a0a0a1d5631';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('测试不同纸张宽度...\n');

  for (const width of ['58mm', '57mm', '80mm']) {
    try {
      const result = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/preview',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { hex: testHex, paperWidth: width });

      console.log(`${width}:`);
      console.log(`  width: ${result.width}, height: ${result.height}`);
      console.log(`  dataUrl 长度: ${result.dataUrl ? result.dataUrl.length : 0}`);
    } catch (e) {
      console.error(`${width} 失败:`, e.message);
    }
  }
}

test();