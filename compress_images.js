const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查是否安装了 sharp，如果没有则自动安装
try {
  require.resolve('sharp');
} catch (e) {
  console.log('正在安装图片处理依赖 sharp...');
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
}

const sharp = require('sharp');

const dir = path.join(__dirname, 'public/images');
const MAX_SIZE = 400 * 1024; // 400KB

async function compressImage(filePath) {
  const stat = fs.statSync(filePath);
  
  if (stat.size <= MAX_SIZE) {
    console.log(`[跳过] ${path.basename(filePath)} (大小: ${(stat.size / 1024).toFixed(1)}KB)`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const backupPath = filePath + '.bak';
  
  // 备份原图以防万一
  fs.copyFileSync(filePath, backupPath);

  console.log(`[压缩中] ${path.basename(filePath)} (原大小: ${(stat.size / 1024).toFixed(1)}KB)`);

  let quality = 85;
  let success = false;
  
  // 循环尝试降低质量和尺寸，直到文件大小达标
  while (!success && quality >= 20) {
    try {
      const img = sharp(backupPath);
      const metadata = await img.metadata();
      
      // 如果图片太宽，进行缩放（通常网页展示 1600px 宽度足够）
      let width = metadata.width;
      if (width > 1600) {
         width = 1600;
      }

      let buffer;
      if (ext === '.png') {
        buffer = await img.resize({ width, withoutEnlargement: true }).png({ quality, compressionLevel: 9 }).toBuffer();
      } else if (ext === '.jpg' || ext === '.jpeg') {
        buffer = await img.resize({ width, withoutEnlargement: true }).jpeg({ quality, progressive: true }).toBuffer();
      } else {
        // 其他格式转为 jpeg 处理
        buffer = await img.resize({ width, withoutEnlargement: true }).jpeg({ quality, progressive: true }).toBuffer();
      }

      if (buffer.length <= MAX_SIZE) {
        fs.writeFileSync(filePath, buffer);
        console.log(`[成功] -> ${(buffer.length / 1024).toFixed(1)}KB (Quality: ${quality}, Width: ${width})`);
        success = true;
      } else {
        quality -= 10;
      }
    } catch (e) {
      console.error(`处理 ${filePath} 失败:`, e.message);
      break;
    }
  }

  // 如果降到很低质量依然大于400k，强制写出最后一次的 buffer
  if (!success) {
      const finalImg = sharp(backupPath).resize({ width: 1200 });
      const buffer = ext === '.png' 
         ? await finalImg.png({ quality: 50 }).toBuffer()
         : await finalImg.jpeg({ quality: 50 }).toBuffer();
      fs.writeFileSync(filePath, buffer);
      console.log(`[强制压缩] -> ${(buffer.length / 1024).toFixed(1)}KB`);
  }

  // 删除备份文件
  fs.unlinkSync(backupPath);
}

async function run() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const filePath = path.join(dir, file);
      await compressImage(filePath);
    }
  }
  console.log('\n✅ 所有图片压缩完成！');
}

run();