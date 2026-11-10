// Генерирует standalone-assets/icon.ico — ёлка, PNG внутри ICO (16/32/48 px).
// Запуск: node scripts/generate-icon.mjs
import fs from 'fs';
import zlib from 'zlib';

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

// Пиксель в единичных координатах (0..1): [r,g,b,a]
function treePixel(u, v) {
  // ствол
  if (v >= 0.8 && v <= 0.94 && u >= 0.44 && u <= 0.56) return [124, 74, 33, 255];
  // ярусы ели: [верх, низ, полуширина у основания]
  const layers = [
    [0.12, 0.44, 0.2, [22, 101, 52]],
    [0.3, 0.64, 0.3, [21, 128, 61]],
    [0.48, 0.84, 0.4, [22, 163, 74]],
  ];
  for (const [top, bottom, hw, [r, g, b]] of layers) {
    if (v >= top && v <= bottom && Math.abs(u - 0.5) <= hw * ((v - top) / (bottom - top))) {
      return [r, g, b, 255];
    }
  }
  // звезда
  if (Math.hypot(u - 0.5, v - 0.08) <= 0.055) return [251, 191, 36, 255];
  return [0, 0, 0, 0];
}

function renderPng(size) {
  const SS = 4; // суперсэмплинг
  const big = size * SS;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const p = treePixel((x * SS + sx + 0.5) / big, (y * SS + sy + 0.5) / big);
          r += p[0] * p[3]; g += p[1] * p[3]; b += p[2] * p[3]; a += p[3];
        }
      }
      const n = SS * SS;
      const i = row + 1 + x * 4;
      raw[i] = a ? Math.round(r / a) : 0;
      raw[i + 1] = a ? Math.round(g / a) : 0;
      raw[i + 2] = a ? Math.round(b / a) : 0;
      raw[i + 3] = Math.round(a / n);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const sizes = [16, 32, 48];
const images = sizes.map(renderPng);

const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2); // тип: иконка
header.writeUInt16LE(images.length, 4);

let offset = 6 + images.length * 16;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e[0] = sizes[i] === 256 ? 0 : sizes[i];
  e[1] = sizes[i] === 256 ? 0 : sizes[i];
  e[6] = 32; // bit count: 32 bpp
  e.writeUInt16LE(1, 4); // planes
  e.writeUInt16LE(32, 6); // bit count
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});

const ico = Buffer.concat([header, ...entries, ...images]);
fs.mkdirSync('standalone-assets', {recursive: true});
fs.writeFileSync('standalone-assets/icon.ico', ico);
console.log(`icon.ico written (${ico.length} bytes, sizes: ${sizes.join('/')})`);
