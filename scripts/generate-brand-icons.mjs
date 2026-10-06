import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function buildIco(images) {
  // images: Array of { width: number, height: number, buffer: Buffer }
  const headerLength = 6;
  const entryLength = 16;
  const numImages = images.length;
  let offset = headerLength + entryLength * numImages;

  const header = Buffer.alloc(headerLength);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(entryLength);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size of image buffer
    entry.writeUInt32LE(offset, 12); // Offset
    entries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
}

async function generateBrandIcons() {
  const masterIconPath = path.resolve('public/images/brand/noveq-icon-mark.png');
  const publicDir = path.resolve('public');
  const appDir = path.resolve('src/app');

  if (!fs.existsSync(masterIconPath)) {
    throw new Error('Master icon mark not found at ' + masterIconPath);
  }

  // Generate PNGs at required resolutions
  const p16 = await sharp(masterIconPath).resize(16, 16).png().toBuffer();
  const p32 = await sharp(masterIconPath).resize(32, 32).png().toBuffer();
  const p48 = await sharp(masterIconPath).resize(48, 48).png().toBuffer();
  const p96 = await sharp(masterIconPath).resize(96, 96).png().toBuffer();
  const p180 = await sharp(masterIconPath).resize(180, 180).png().toBuffer();
  const p192 = await sharp(masterIconPath).resize(192, 192).png().toBuffer();
  const p512 = await sharp(masterIconPath).resize(512, 512).png().toBuffer();

  // Save standalone PNGs
  fs.writeFileSync(path.join(publicDir, 'icon-48.png'), p48);
  fs.writeFileSync(path.join(publicDir, 'icon-96.png'), p96);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), p512);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);

  fs.writeFileSync(path.join(appDir, 'icon.png'), p192);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), p180);

  // Build binary multi-resolution .ico containing 16x16, 32x32, 48x48
  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: p16 },
    { width: 32, height: 32, buffer: p32 },
    { width: 48, height: 48, buffer: p48 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);

  const b64 = p512.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#111111" />
  <image href="data:image/png;base64,${b64}" width="512" height="512" />
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svg);

  console.log('✅ Generated authentic NOVEQ favicon.ico, SVGs & all high-DPI app icons successfully!');
}

generateBrandIcons().catch(err => {
  console.error('Error generating brand icons:', err);
  process.exit(1);
});
