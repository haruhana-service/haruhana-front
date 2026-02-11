import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');

// SVG 아이콘을 PNG로 변환
const svgPath = join(publicDir, 'icon.svg');

if (!existsSync(svgPath)) {
  console.error('❌ icon.svg 파일을 public 폴더에서 찾을 수 없습니다.');
  console.log('public/icon.svg 파일을 먼저 생성해주세요.');
  process.exit(1);
}

const sizes = [
  { size: 64, name: 'pwa-64x64.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 512, name: 'maskable-icon-512x512.png', maskable: true },
  { size: 180, name: 'apple-touch-icon.png' },
];

console.log('🎨 PWA 아이콘 생성 중...\n');

for (const { size, name, maskable } of sizes) {
  try {
    let image = sharp(svgPath).resize(size, size);
    
    // Maskable 아이콘은 안전 영역을 위해 패딩 추가
    if (maskable) {
      const padding = Math.floor(size * 0.1); // 10% 패딩
      const innerSize = size - padding * 2;
      
      image = sharp(svgPath)
        .resize(innerSize, innerSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 74, g: 105, b: 255, alpha: 1 } // theme color
        });
    }
    
    await image.png().toFile(join(publicDir, name));
    console.log(`✅ ${name} (${size}x${size}) 생성 완료`);
  } catch (error) {
    console.error(`❌ ${name} 생성 실패:`, error.message);
  }
}

// mask-icon.svg 복사 (이미 SVG가 있다면)
try {
  const maskIconPath = join(publicDir, 'mask-icon.svg');
  if (!existsSync(maskIconPath)) {
    const iconSvg = readFileSync(svgPath, 'utf-8');
    // SVG를 단일 색상으로 변환 (Safari용)
    const maskSvg = iconSvg.replace(/fill="[^"]*"/g, 'fill="#4a69ff"');
    await sharp(Buffer.from(maskSvg))
      .png()
      .toFile(join(publicDir, 'mask-icon-temp.png'));
    console.log('✅ mask-icon.svg는 기존 icon.svg를 사용합니다');
  }
} catch (error) {
  console.log('ℹ️  mask-icon.svg는 수동으로 추가해주세요');
}

console.log('\n✨ PWA 아이콘 생성 완료!');
console.log('public 폴더를 확인해주세요.\n');
