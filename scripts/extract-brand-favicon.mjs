import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const logoPath = path.resolve('public/images/brand/noveq-logo.jpg');
  const publicDir = path.resolve('public');
  const appDir = path.resolve('src/app');

  // Load master noveq-logo.jpg image (1171x1172)
  const master = sharp(logoPath);

  // In noveq-logo.jpg:
  // 'n' is at minX: 377, maxX: 442 (width: 65), minY: 541, maxY: 620 (height: 79)
  // The underline rule is at y: 655, height: ~5px
  // Let's crop a clean square region enclosing the authentic 'n' and its underline portion!
  // Width around letter n: x from 360 to 456 (width 96)
  // Height: y from 526 to 670 (height 144)
  // Or even better: extract the exact glyph of 'n' + underline cleanly!

  // Let's crop the 'n' letter and its underline
  // Center of 'n': x = 409.5, y = 580.5
  // Total height including underline: y from 541 to 662 (height 121)
  // Center of 'n' + line: y = 601.5

  const cropWidth = 140;
  const cropHeight = 140;
  const left = Math.round(410 - cropWidth / 2);
  const top = Math.round(602 - cropHeight / 2);

  // Crop the authentic brand 'n' and underline directly from the master logo image
  const croppedBuffer = await master
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .toBuffer();

  // Create a 512x512 square canvas with exact background color (#111111)
  // Resize cropped authentic brand glyph to fit nicely with generous padding (~300x300 inside 512x512)
  const resizedGlyph = await sharp(croppedBuffer)
    .resize(320, 320, { fit: 'contain' })
    .toBuffer();

  const base512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: 17, g: 17, b: 17 } // #111111 authentic brand black
    }
  })
    .composite([{ input: resizedGlyph, gravity: 'center' }])
    .png()
    .toBuffer();

  // Also create a version of the full 'noveq' wordmark for wide preview if needed
  // Generate multi-resolution icons
  const p48 = await sharp(base512).resize(48, 48).png().toBuffer();
  const p96 = await sharp(base512).resize(96, 96).png().toBuffer();
  const p180 = await sharp(base512).resize(180, 180).png().toBuffer();
  const p192 = await sharp(base512).resize(192, 192).png().toBuffer();
  const p512 = base512;

  // Save all icons
  fs.writeFileSync(path.join(publicDir, 'icon-48.png'), p48);
  fs.writeFileSync(path.join(publicDir, 'icon-96.png'), p96);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), p512);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), p48);

  fs.writeFileSync(path.join(appDir, 'icon.png'), p192);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), p180);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), p48);

  console.log('✅ Extracted AUTHENTIC brand lowercase "n" from noveq-logo.jpg across all sizes!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
