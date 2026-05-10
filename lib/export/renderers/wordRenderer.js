const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } = require('docx');
const fs = require('fs');

function base64ToBuffer(base64Data) {
  const base64Image = base64Data.split(';base64,').pop();
  return Buffer.from(base64Image, 'base64');
}

const zhNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

async function renderWord(page, profile) {
  const outputPath = profile.outputPath;
  console.log('正在提取网站数据...');

  const siteData = await page.evaluate(() => {
    function getBase64Image(img) {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 600;
      let w = img.naturalWidth || img.width || 800;
      let h = img.naturalHeight || img.height || 600;
      if (w > MAX_WIDTH) {
        h = Math.floor(h * (MAX_WIDTH / w));
        w = MAX_WIDTH;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      return { dataUrl: canvas.toDataURL('image/jpeg', 0.7), width: w, height: h };
    }

    const data = {
      intro: document.querySelector('p.max-w-3xl')?.innerText || '',
      services: [],
      works: [],
      awards: [],
      research: [],
      team: [],
    };

    document.querySelectorAll('#services .rounded-lg').forEach(el => {
      data.services.push({
        title: el.querySelector('h3')?.innerText || '',
        desc: el.querySelector('p')?.innerText || '',
      });
    });

    document.querySelectorAll('#works .group').forEach(el => {
      const img = el.querySelector('img');
      data.works.push({
        category: el.querySelector('.text-xs, .text-sm')?.innerText || '',
        title: el.querySelector('h3')?.innerText || '',
        desc: el.querySelector('p')?.innerText || '',
        image: (img && img.src) ? getBase64Image(img) : null,
      });
    });

    document.querySelectorAll('#awards .group').forEach(el => {
      data.awards.push({
        year: el.querySelector('div')?.innerText || '',
        title: el.querySelector('h3')?.innerText || '',
        desc: el.querySelector('p')?.innerText || '',
      });
    });

    document.querySelectorAll('#research .group').forEach(el => {
      const img = el.querySelector('img');
      data.research.push({
        year: el.querySelector('span')?.innerText || '',
        title: el.querySelector('h3')?.innerText || '',
        desc: el.querySelector('p')?.innerText || '',
        image: (img && img.src) ? getBase64Image(img) : null,
      });
    });

    document.querySelectorAll('#team .border').forEach(el => {
      const allP = el.querySelectorAll('p');
      data.team.push({
        name: el.querySelector('h3')?.innerText || '',
        role: el.querySelector('p')?.innerText || '',
        desc: allP.length > 1 ? Array.from(allP).slice(1).map(p => p.innerText).join('\n') : '',
      });
    });

    return data;
  });

  console.log('正在构建原生 Word 文档结构...');
  const children = [];
  let level1Counter = 0;

  children.push(new Paragraph({
    text: '液态像素艺术工作室',
    heading: HeadingLevel.TITLE,
    alignment: 'center',
    spacing: { after: 400 },
  }));
  children.push(new Paragraph({
    text: siteData.intro,
    alignment: 'center',
    spacing: { after: 600 },
  }));

  level1Counter++;
  children.push(new Paragraph({ text: `${zhNumbers[level1Counter]}、核心服务`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
  let serviceCounter = 0;
  siteData.services.forEach(item => {
    if (!item.title) return;
    serviceCounter++;
    children.push(new Paragraph({ text: `（${zhNumbers[serviceCounter]}）${item.title}`, heading: HeadingLevel.HEADING_3, spacing: { after: 100 } }));
    children.push(new Paragraph({ text: item.desc, spacing: { after: 200 } }));
  });

  level1Counter++;
  children.push(new Paragraph({ text: `${zhNumbers[level1Counter]}、案例展示`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
  let workCounter = 0;
  siteData.works.forEach(item => {
    if (!item.title) return;
    workCounter++;
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `（${zhNumbers[workCounter] || workCounter}）${item.title}`, bold: true, size: 28 }),
        new TextRun({ text: ` - ${item.category}`, color: '666666', size: 24 }),
      ],
      spacing: { before: 200, after: 100 },
    }));
    if (item.image) {
      children.push(new Paragraph({
        children: [
          new ImageRun({
            data: base64ToBuffer(item.image.dataUrl),
            transformation: { width: 500, height: Math.floor(500 * (item.image.height / item.image.width)) },
          }),
        ],
        alignment: 'center',
        spacing: { after: 100 },
      }));
    }
    children.push(new Paragraph({ text: item.desc, spacing: { after: 300 } }));
  });

  level1Counter++;
  children.push(new Paragraph({ text: `${zhNumbers[level1Counter]}、展览与荣誉`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
  let awardCounter = 0;
  siteData.awards.forEach(item => {
    if (!item.title) return;
    awardCounter++;
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${awardCounter}、[${item.year}] ${item.title}`, bold: true }),
        new TextRun({ text: ` - ${item.desc}` }),
      ],
      spacing: { after: 100 },
    }));
  });

  level1Counter++;
  children.push(new Paragraph({ text: `${zhNumbers[level1Counter]}、学术成果`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
  let researchCounter = 0;
  siteData.research.forEach(item => {
    if (!item.title) return;
    researchCounter++;
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `（${zhNumbers[researchCounter] || researchCounter}）[${item.year}] ${item.title}`, bold: true, size: 28 }),
      ],
      spacing: { before: 200, after: 100 },
    }));
    if (item.image) {
      children.push(new Paragraph({
        children: [
          new ImageRun({
            data: base64ToBuffer(item.image.dataUrl),
            transformation: { width: 500, height: Math.floor(500 * (item.image.height / item.image.width)) },
          }),
        ],
        alignment: 'center',
        spacing: { after: 100 },
      }));
    }
    children.push(new Paragraph({ text: item.desc, spacing: { after: 300 } }));
  });

  level1Counter++;
  children.push(new Paragraph({ text: `${zhNumbers[level1Counter]}、团队成员`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
  let teamCounter = 0;
  siteData.team.forEach(item => {
    if (!item.name) return;
    teamCounter++;
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `（${zhNumbers[teamCounter] || teamCounter}）${item.name}`, bold: true, size: 28 }),
        new TextRun({ text: ` - ${item.role}`, color: '666666', size: 24 }),
      ],
      spacing: { before: 200, after: 100 },
    }));
    const descLines = item.desc.split('\n');
    let bulletCounter = 0;
    descLines.forEach(line => {
      if (!line.trim()) return;
      bulletCounter++;
      children.push(new Paragraph({ text: `${bulletCounter}、${line}`, spacing: { after: 50 } }));
    });
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  console.log('正在将数据写入 Word 文件...');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Word 文档已保存至: ${outputPath}`);
}

module.exports = { renderWord };
