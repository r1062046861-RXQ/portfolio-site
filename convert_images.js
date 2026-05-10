const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'public', 'images');
const TARGET_KB = 200;

const imageRefsInPageTsx = {
  '/images/11.png': true,
  '/images/22.jpg': true,
  '/images/33.png': true,
  '/images/44.png': true,
  '/images/55.png': true,
  '/images/66.png': true,
  '/images/77.png': true,
  '/images/88.png': true,
  '/images/99.png': true,
  '/images/100.png': true,
  '/images/aa.jpg': true,
  '/images/bb.jpg': true,
  '/images/cc.jpg': true,
  '/images/dd.jpeg': true,
  '/images/ee.jpg': true,
  '/images/ff.png': true,
  '/images/rxq.jpg': true,
  '/images/wyf.jpg': true,
  '/images/zsm.png': true,
  '/images/qrcode_dark.jpg': true,
};

async function compressToTarget(filePath, targetKB) {
  const ext = path.extname(filePath).toLowerCase();
  const image = sharp(filePath);
  const metadata = await image.metadata();
  
  let quality = 85;
  let buffer;
  let currentKB = Infinity;
  
  while (currentKB > targetKB && quality >= 5) {
    buffer = await image
      .webp({ quality, effort: 6 })
      .toBuffer();
    currentKB = buffer.length / 1024;
    
    if (currentKB > targetKB) {
      quality -= 10;
    }
  }
  
  if (currentKB > targetKB) {
    buffer = await image
      .webp({ quality: 5, effort: 6 })
      .resize({ width: Math.min(metadata.width, 1200), withoutEnlargement: true })
      .toBuffer();
    currentKB = buffer.length / 1024;
  }
  
  return { buffer, sizeKB: Math.round(currentKB * 10) / 10, quality };
}

async function main() {
  console.log('正在扫描 public/images/ 目录...\n');
  
  const files = fs.readdirSync(IMAGES_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext) && !f.endsWith('.webp');
  });
  
  console.log(`找到 ${files.length} 个图片文件\n`);
  
  const pageTsxPath = path.join(__dirname, 'src', 'app', 'page.tsx');
  let pageTsxContent = fs.readFileSync(pageTsxPath, 'utf-8');
  let totalOriginalKB = 0;
  let totalNewKB = 0;
  
  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const originalStat = fs.statSync(filePath);
    const originalKB = Math.round(originalStat.size / 1024 * 10) / 10;
    totalOriginalKB += originalKB;
    
    const baseName = path.basename(file, path.extname(file));
    const webpName = baseName + '.webp';
    const webpPath = path.join(IMAGES_DIR, webpName);
    
    console.log(`转换: ${file} (${originalKB} KB) → ${webpName} ...`);
    
    const { buffer, sizeKB, quality } = await compressToTarget(filePath, TARGET_KB);
    fs.writeFileSync(webpPath, buffer);
    totalNewKB += sizeKB;
    
    const oldRef = `/images/${file}`;
    const newRef = `/images/${webpName}`;
    
    if (pageTsxContent.includes(oldRef)) {
      pageTsxContent = pageTsxContent.split(oldRef).join(newRef);
      console.log(`  ✓ 压缩到 ${sizeKB} KB (quality: ${quality})，已更新 page.tsx 引用`);
    } else {
      console.log(`  ✓ 压缩到 ${sizeKB} KB (quality: ${quality})，page.tsx 中无引用`);
    }
  }
  
  fs.writeFileSync(pageTsxPath, pageTsxContent, 'utf-8');
  
  console.log('\n========================================');
  console.log(`全部完成！`);
  console.log(`原始总大小: ${Math.round(totalOriginalKB / 1024 * 10) / 10} MB`);
  console.log(`WebP 总大小: ${Math.round(totalNewKB / 1024 * 10) / 10} MB`);
  console.log(`节省: ${Math.round((1 - totalNewKB / totalOriginalKB) * 100)}%`);
  console.log(`page.tsx 图片引用已全部更新为 .webp`);
  console.log('========================================');
}

main().catch(err => { console.error(err); process.exit(1); });
