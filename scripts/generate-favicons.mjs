import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// SVG with high-contrast luxury serif 'N' and subtle gold border, optimized for 48px+ rendering
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A120E" />
      <stop offset="100%" stop-color="#0A0705" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A67C52" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#5B4033" stop-opacity="0.4" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)" />
  <rect x="8" y="8" width="496" height="496" rx="92" fill="none" stroke="url(#borderGrad)" stroke-width="12" />
  <text x="256" y="356" 
    font-family="Georgia, 'Times New Roman', serif" 
    font-size="340" 
    font-weight="normal" 
    font-style="italic" 
    fill="#FAF8F4" 
    text-anchor="middle">N</text>
  <line x1="150" y1="410" x2="362" y2="410" stroke="#A67C52" stroke-width="14" stroke-linecap="round" />
</svg>
`;

async function main() {
  const publicDir = path.resolve('public');
  const appDir = path.resolve('src/app');

  const svgBuffer = Buffer.from(svgIcon.trim());

  // Save base SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgBuffer);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgBuffer);
  fs.writeFileSync(path.join(publicDir, 'images/brand/favicon.svg'), svgBuffer);

  // Generate PNG sizes: 48, 96, 180 (apple), 192 (pwa/google), 512
  const p48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const p96 = await sharp(svgBuffer).resize(96, 96).png().toBuffer();
  const p180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const p192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const p512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  // Save PNG files to public
  fs.writeFileSync(path.join(publicDir, 'icon.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'icon-48.png'), p48);
  fs.writeFileSync(path.join(publicDir, 'icon-96.png'), p96);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), p512);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);

  // Save to src/app for Next.js metadata convention
  fs.writeFileSync(path.join(appDir, 'icon.png'), p192);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), p180);

  // Generate standard ICO file using 48x48 PNG (Google Favicon crawler reads 48px ICO)
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), p48);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), p48);

  console.log('✅ Generated all favicons (SVG, 48px, 96px, 180px, 192px, 512px, favicon.ico) successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
