const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../../public/images/products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function createPamSvg({ title, subtitle, colorHex, accentHex, view }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF8F4" />
      <stop offset="100%" stop-color="#F4F1EA" />
    </linearGradient>
    <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2A1B15" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#2A1B15" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="800" height="600" fill="url(#bgGrad)" />

  <!-- Subtle framing border -->
  <rect x="24" y="24" width="752" height="552" fill="none" stroke="#5B4033" stroke-width="1" stroke-opacity="0.25" rx="4" />

  <!-- Technical / Editorial Header Marks -->
  <text x="50" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" letter-spacing="3" fill="#5B4033" font-weight="600">NOVEQ ATELIER</text>
  <text x="750" y="65" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" letter-spacing="3" fill="#A99B90" font-weight="500">DROP 001 // ${view.toUpperCase()}</text>

  <!-- Soft Ground Shadow -->
  <ellipse cx="400" cy="450" rx="260" ry="24" fill="url(#shadowGrad)" />

  <!-- Footwear Silhouette Rendering -->
  <g transform="translate(400, 310)">
    <!-- Sole Foundation -->
    <path d="M-220,95 C-190,92 -100,85 0,85 C100,85 190,92 220,95 C235,97 245,108 240,120 C235,130 220,135 180,135 C-20,135 -140,135 -200,135 C-230,135 -245,128 -240,115 C-235,105 -230,96 -220,95 Z" fill="#2A1B15" />
    <path d="M-215,92 C-185,90 -95,83 0,83 C95,83 185,90 215,92 C230,94 238,102 235,110 C230,118 215,122 175,122 C-20,122 -140,122 -195,122 C-225,122 -238,116 -235,105 C-232,98 -225,93 -215,92 Z" fill="#F4F1EA" stroke="#5B4033" stroke-width="1.5" stroke-opacity="0.4" />

    <!-- Leather Footbed Insole -->
    <path d="M-200,80 C-120,74 -20,74 60,76 C130,78 180,84 200,88 C215,91 210,105 180,105 C-40,105 -140,104 -180,104 C-210,104 -215,88 -200,80 Z" fill="#F4F1EA" />
    <text x="30" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" letter-spacing="3" fill="#5B4033" font-weight="700" opacity="0.6">noveq</text>

    <!-- Upper Leather Vamp / Pam Strap -->
    <path d="M-130,85 C-140,20 -110,-40 -20,-75 C50,-100 120,-85 145,-15 C155,25 150,70 140,88 C115,88 75,70 40,65 C-20,55 -90,75 -130,85 Z" fill="${colorHex}" stroke="#5B4033" stroke-width="1.5" stroke-opacity="0.3" />

    <!-- Leather Grain Highlight / Strap Fold -->
    <path d="M-115,75 C-125,25 -95,-30 -15,-60 C45,-80 105,-68 125,-10 C135,25 130,62 120,78" fill="none" stroke="#FAF8F4" stroke-width="2.5" stroke-opacity="0.2" />

    <!-- Beveled Edge Stitching Line -->
    <path d="M-122,80 C-132,22 -102,-35 -18,-68 C48,-92 112,-78 135,-12 C145,26 140,68 130,82" fill="none" stroke="#FAF8F4" stroke-width="1" stroke-dasharray="4,4" stroke-opacity="0.3" />

    ${view === 'detail' || accentHex ? `
    <!-- Heart Charm Hardware Point (if present) -->
    <g transform="translate(70, 0)">
      <path d="M0,0 C-10,-12 -25,-5 -25,10 C-25,25 0,40 0,40 C0,40 25,25 25,10 C25,-5 10,-12 0,0 Z" fill="#C5A059" stroke="#5B4033" stroke-width="1.5" />
      <circle cx="0" cy="5" r="2.5" fill="#5B4033" />
    </g>` : ''}
  </g>

  <!-- Typography & Model Label -->
  <text x="50" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" fill="#0A0A0A" font-weight="700">${title}</text>
  <text x="50" y="542" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#A99B90" font-weight="400">${subtitle}</text>
</svg>`;
}

function createPackagingSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#FAF8F4" />
  <rect x="24" y="24" width="752" height="552" fill="none" stroke="#5B4033" stroke-width="1" stroke-opacity="0.25" rx="4" />
  <text x="50" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" letter-spacing="3" fill="#5B4033" font-weight="600">NOVEQ PACKAGING</text>
  <text x="750" y="65" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" letter-spacing="3" fill="#A99B90" font-weight="500">DROP 001 SUITE</text>

  <!-- Ground Shadow -->
  <ellipse cx="400" cy="460" rx="280" ry="20" fill="#2A1B15" fill-opacity="0.15" />

  <!-- Slim Brown Kraft Box -->
  <g transform="translate(180, 200)">
    <polygon points="0,90 220,10 440,90 220,170" fill="#C4A482" stroke="#5B4033" stroke-width="1.5" />
    <polygon points="0,90 220,170 220,240 0,160" fill="#A78564" stroke="#5B4033" stroke-width="1.5" />
    <polygon points="220,170 440,90 440,160 220,240" fill="#8C6D4F" stroke="#5B4033" stroke-width="1.5" />
    <text x="220" y="85" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" letter-spacing="4" fill="#2A1B15" font-weight="700">noveq</text>
  </g>

  <!-- Care Card & Shopping Bag Impression -->
  <g transform="translate(480, 310)">
    <rect x="0" y="0" width="130" height="90" fill="#F4F1EA" stroke="#5B4033" stroke-width="1" rx="2" transform="rotate(-6)" />
    <text x="15" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" letter-spacing="2" fill="#5B4033" font-weight="600" transform="rotate(-6)">THANK YOU</text>
    <text x="15" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8" fill="#A99B90" transform="rotate(-6)">Crafted to move.</text>
  </g>

  <text x="50" y="525" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" fill="#0A0A0A" font-weight="700">First-Release Packaging</text>
  <text x="50" y="545" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#A99B90" font-weight="400">Slim brown kraft box · Tissue · Thank-you & care card · Branded bag</text>
</svg>`;
}

const assets = [
  { file: 'cut-black-hero.svg', title: 'The Cut Slide Pam', subtitle: 'Ink Black Full-Grain Cowhide', colorHex: '#0A0A0A', view: 'Hero' },
  { file: 'cut-black-side.svg', title: 'The Cut Slide Pam', subtitle: 'Lateral Arch Profile & Beveled Edges', colorHex: '#141414', view: 'Side' },
  { file: 'cut-black-top.svg', title: 'The Cut Slide Pam', subtitle: 'Asymmetric Vamp Geometry', colorHex: '#0A0A0A', view: 'Top' },
  { file: 'cut-black-sole.svg', title: 'The Cut Slide Pam', subtitle: 'Stitched Sole & Traction Tread', colorHex: '#2A1B15', view: 'Sole' },
  { file: 'cut-black-detail.svg', title: 'The Cut Slide Pam', subtitle: 'Full-Grain Texture & Edge Finish', colorHex: '#1A1A1A', view: 'Detail' },
  { file: 'cut-black-packaging.svg', custom: createPackagingSvg() },

  { file: 'minimalist-espresso-hero.svg', title: 'The Minimalist Pam', subtitle: 'Deep Espresso Vegetable-Tanned Calfskin', colorHex: '#2A1B15', view: 'Hero' },
  { file: 'minimalist-espresso-side.svg', title: 'The Minimalist Pam', subtitle: 'Low Profile 10mm Base', colorHex: '#38231C', view: 'Side' },
  { file: 'minimalist-espresso-top.svg', title: 'The Minimalist Pam', subtitle: 'Clean Straight Vamp Alignment', colorHex: '#2A1B15', view: 'Top' },
  { file: 'minimalist-espresso-detail.svg', title: 'The Minimalist Pam', subtitle: 'Supple Calfskin Tempering', colorHex: '#332018', view: 'Detail' },

  { file: 'artisan-oxblood-hero.svg', title: 'The Artisan Pam', subtitle: 'Oxblood Burnished Leather with Brass Point', colorHex: '#5A2028', accentHex: '#C5A059', view: 'Hero' },
  { file: 'artisan-oxblood-side.svg', title: 'The Artisan Pam', subtitle: 'Heart Charm Balance Anchor', colorHex: '#6B2630', accentHex: '#C5A059', view: 'Side' },
  { file: 'artisan-oxblood-top.svg', title: 'The Artisan Pam', subtitle: 'Burnished Edge Contours', colorHex: '#5A2028', accentHex: '#C5A059', view: 'Top' },
  { file: 'artisan-oxblood-detail.svg', title: 'The Artisan Pam', subtitle: 'Hardware Charm Mount Macro', colorHex: '#5A2028', accentHex: '#C5A059', view: 'Detail' },

  { file: 'packaging-box.svg', custom: createPackagingSvg() },
];

for (const a of assets) {
  const content = a.custom ? a.custom : createPamSvg(a);
  fs.writeFileSync(path.join(targetDir, a.file), content, 'utf8');
}

console.log(`Generated ${assets.length} SVG product assets.`);
