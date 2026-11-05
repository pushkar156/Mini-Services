// Generate minimal, crisp PNG icons for the Chrome extension using pure Node.js (zero dependencies)
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPng(width, height, drawFn) {
  // RGBA buffer
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rgba[idx] = r;
      rgba[idx + 1] = g;
      rgba[idx + 2] = b;
      rgba[idx + 3] = a;
    }
  }

  // PNG filter type 0 (None) per line
  const filtered = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (width * 4 + 1)] = 0; // Filter byte: 0
    rgba.copy(filtered, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(filtered);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk("IHDR", ihdr);

  // IDAT chunk
  const idatChunk = createChunk("IDAT", deflated);

  // IEND chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);

  const crcTarget = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Icon design: Dark luxury circle with gold/platinum star glyph
function drawIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 1;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background circle (Dark obsidian #0E1013)
  if (dist > r) return [0, 0, 0, 0];

  // Subtle border ring
  if (dist >= r - 1.5) {
    return [205, 198, 187, 180]; // #CDC6BB platinum border
  }

  // 4-pointed sparkle star in center
  const scale = w / 32;
  const nx = Math.abs(dx) / scale;
  const ny = Math.abs(dy) / scale;

  // Star equation: x^0.5 + y^0.5 <= radius
  if (Math.sqrt(nx) + Math.sqrt(ny) <= 3.2) {
    return [205, 198, 187, 255]; // Warm platinum
  }

  // Dark interior
  return [14, 16, 19, 255];
}

const iconsDir = path.join(__dirname, "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const buf = createPng(size, size, drawIcon);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`✓ Generated ${outPath} (${size}x${size})`);
});

