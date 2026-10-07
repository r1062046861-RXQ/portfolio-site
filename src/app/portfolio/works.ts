// 作品内容来源：《2026作品集8（跨页）.pdf》（2021—2025 任玄奇作品集）
// 替换内容时改此文件即可：标题/年份/媒介/介绍/代表图（public/works/ 下同名 jpg）
export type Work = {
  id: string;
  /** 目录编号，如 Ⅰ-01 */
  no: string;
  /** 板块：艺术创作 / 科研课题 / 商业项目 */
  category: string;
  title: string;
  year: string;
  medium: string;
  description: string;
  /** 代表图路径（public/works/），新增作品可先留空 */
  image?: string;
  /** 循环影像预览（public/works/） */
  gif?: string;
  /** 减弱动效时使用的静态帧（public/works/） */
  poster?: string;
  /** 多图自动播放组（public/works/） */
  gallery?: string[];
  /** 标签主色相（0-360），图片加载失败时的兜底色 */
  hue: number;
  /** 作品资料尚未完整时显示为可替换占位卡 */
  reserved?: boolean;
};

export const works: Work[] = [
  /* ---------- Ⅰ 艺术创作 ---------- */
  {
    id: "work-01",
    no: "Ⅰ-01",
    category: "艺术创作",
    title: "千禧幻像合成器",
    year: "2025",
    medium: "数字影像 / AIGC",
    description:
      "以梦核美学重构千禧年记忆：Windows XP 开机画面、电子宠物、雪花屏电视等公共符号，与童年日记中的纸飞机、光盘、卡带等私密意象拼贴交织。保留噪点与畸变的「记忆晶体」，指向赛博空间中新型集体无意识的萌生。",
    image: "/works/work-01.jpg",
    hue: 215,
  },
  {
    id: "work-02",
    no: "Ⅰ-02",
    category: "艺术创作",
    title: "不眠",
    year: "2023",
    medium: "AIGC 实验影像 · 2分30秒",
    description:
      "以电信号元素为起点，结合 AIGC 训练生成的传统建筑意象，将「生长」作为核心隐喻，映射 AI 时代在数据与物质层面同时迸发的巨大生命力。生长、繁盛、消解、荒芜——所有过往，皆为序章。",
    image: "/works/work-02.jpg",
    hue: 200,
  },
  {
    id: "work-03",
    no: "Ⅰ-03",
    category: "艺术创作",
    title: "苏醒",
    year: "2024",
    medium: "实验影像 / AI 生成",
    description:
      "融合 AI 生成技术与艺术想象，探索人工智能从无意识到自我觉醒的可能。以微观粒子为叙事主体，呼应博尔赫斯的巴别图书馆意象，构建无限延展的「影像图书馆」。",
    image: "/works/work-03.jpg",
    gif: "/works/gif/wake.gif",
    poster: "/works/gif/wake-poster.jpg",
    hue: 195,
  },
  {
    id: "work-04",
    no: "Ⅰ-04",
    category: "艺术创作",
    title: "坍缩",
    year: "2025",
    medium: "三屏 AI 实验影像",
    description:
      "以阿兹海默症患者的主观感受为叙事核心，三个章节对应病程早期、中期与晚期，呈现记忆与感知世界逐渐坍塌中的孤独与悲怆。",
    image: "/works/work-04.jpg",
    gif: "/works/gif/collapse.gif",
    poster: "/works/gif/collapse-poster.jpg",
    hue: 275,
  },
  {
    id: "work-05",
    no: "Ⅰ-05",
    category: "艺术创作",
    title: "逆流",
    year: "2024",
    medium: "Kinect 交互影像装置 · 四屏",
    description:
      "装置捕捉屏幕前的观众并将形象层层拆解：观者慢慢失去对自己映射形象的控制权，最终化作无拘无束的「水流」。灵感源自阿兹海默症画家威廉·尤特莫伦的自画像系列，河流象征人类思维的流动。",
    image: "/works/work-05.jpg",
    hue: 150,
  },
  {
    id: "work-06",
    no: "Ⅰ-06",
    category: "艺术创作",
    title: "生物炼金术",
    year: "2024",
    medium: "AIGC 生成艺术",
    description:
      "一场当代炼金实践：「原料」取自清代聂璜《海错图》中已被证伪的虚构生物，经 AI 算法之「火」炼制为新的生命形态。作品在古籍图像、生成模型与数字生命之间建立一条可变的形态链。",
    image: "/works/work-06-cover.jpg",
    gallery: ["/works/work-06-cover.jpg", "/works/layers/work-06-mid.webp", "/works/layers/work-06-bg.jpg"],
    hue: 35,
  },
  {
    id: "work-07",
    no: "Ⅰ-07",
    category: "艺术创作",
    title: "国家艺术基金驻地创作合集",
    year: "2024",
    medium: "数字拼贴 / 三维数字空间",
    description:
      "国家艺术基金《数字博物馆数字艺术人才培训》驻地创作两组：《欲望之镜》数字拼贴以非叙事性符号拼接呈现人类欲望的多维全景；《虚拟交响》三维数字空间融合古典与现代、现实与虚拟，营造不断变化的超现实世界。",
    image: "/works/work-07.jpg",
    gallery: ["/works/work-07.jpg", "/works/layers/work-07-bg.jpg", "/works/layers/work-07-mid.webp", "/works/layers/work-07-fg.webp"],
    hue: 30,
  },
  {
    id: "work-08",
    no: "Ⅰ-08",
    category: "艺术创作",
    title: "数字艺术创作小辑",
    year: "2022—2025",
    medium: "实验摄影 / AI 摄影 / 动态图像",
    description:
      "《梦境遗像》《进化的悖论》《恐龙大王》《燃羽之徒》《失重牧歌》《视域孤岛》等系列：AI 生成的实验摄影探索梦境与现实的边界，质问技术与人性的关系。曾展出于红树林 AI 艺术展（今日美术馆）、费那奇动画周等。",
    image: "/works/work-08.jpg",
    hue: 15,
  },
  /* ---------- Ⅱ 科研课题项目 ---------- */
  {
    id: "work-09",
    no: "Ⅱ-01",
    category: "科研课题",
    title: "设计你的未来",
    year: "2024",
    medium: "交互影像装置",
    description:
      "集传感技术、人工智能与实体输出于一体：测距系统实时感知观众位置，触发 AI 基于「设」「计」主题生成随机图像，计算机视觉捕捉人像并实时融合，最终以热升华技术输出独一无二的纸质作品。2024.05 展于天美美术馆，多次引发排队参与热潮。",
    image: "/works/work-09.jpg",
    hue: 335,
  },
  {
    id: "work-10",
    no: "Ⅱ-02",
    category: "科研课题",
    title: "杨柳青年画非遗数字化焕新",
    year: "2025",
    medium: "非遗数字化 / LoRA 模型训练",
    description:
      "以杨柳青木版年画为载体，通过「视觉解析—风格学习—创新生成」方法训练专属 LoRA 模型，遵循「核心恒定—边缘创新」策略：传承性设计忠实再现经典，融合性设计对话当代，实验性设计突破边界。成果发表于第二届新媒体与非物质文化遗产传承创新学术论坛。",
    image: "/works/work-10.jpg",
    hue: 350,
  },
  {
    id: "work-11",
    no: "Ⅱ-03",
    category: "科研课题",
    title: "《红楼梦》中华美学当代艺术转化",
    year: "2025",
    medium: "AIGC / 跨文化图像再生产",
    description:
      "以清代孙温《红楼梦》绘本为基底炼制 LoRA 模型提炼笔墨气韵，再借 ControlNet 将《雅典学院》《自由引导人民》《创世纪》等西方经典绘画语汇移植进红楼叙事场景——在全球化语境中，让中华美学与他者互映。",
    image: "/works/work-11.jpg",
    hue: 25,
  },
  /* ---------- Ⅲ 商业项目 ---------- */
  {
    id: "work-12",
    no: "Ⅲ-01",
    category: "商业项目",
    title: "中国科学技术馆 · 音乐会音乐可视化",
    year: "2025",
    medium: "音乐可视化 / 沉浸影像",
    description:
      "为中国科技馆「AI 赋能未来 · 未来媒介」创客营音乐会打造的沉浸式可视化：以冷蓝调为基调，抽象光影与音律共振，营造科学与艺术交织的未来幻境。",
    image: "/works/work-12.jpg",
    hue: 210,
  },
  {
    id: "work-13",
    no: "Ⅲ-02",
    category: "商业项目",
    title: "天津市科技美术设计大赛 · 宣传片",
    year: "2025",
    medium: "宣传影像 / 裸眼 3D",
    description:
      "裸眼 3D 开幕式与赛事宣传片：以动态影像呈现大赛的视觉精神与创意能量，搭建高校交流平台，推动设计、科技与美术的深度融合。",
    image: "/works/work-13.jpg",
    hue: 190,
  },
  {
    id: "work-14",
    no: "Ⅲ-03",
    category: "商业项目",
    title: "天津美术学院 2024 毕业季《生如夏花》宣传片",
    year: "2024",
    medium: "宣传影像 / 逐帧风格化渲染",
    description:
      "三维建模与动画制作，结合 ComfyUI 流程和 ControlNet 逐帧风格化渲染，实现油画、数字插画、国画没骨花鸟等多风格转换——每一帧都在数字与传统艺术的交汇中精雕细琢，呈现毕业季的视觉诗意与青春张力。",
    image: "/works/work-14.jpg",
    hue: 320,
  },
  {
    id: "work-15",
    no: "Ⅲ-04",
    category: "商业项目",
    title: "中国日报社 ·《马远的意境诗篇》AI 动画",
    year: "2024",
    medium: "AI 动画 / LoRA 模型",
    description:
      "以马远《水图》为蓝本炼制专属 LoRA 模型，将原作意境与结构提炼为可创作的 AI 模型：层波叠浪、黄河逆流、长江万顷、晓日烘山——千年水墨意境获得全新的三维动态呈现。",
    image: "/works/work-15.jpg",
    hue: 45,
  },
  {
    id: "work-16",
    no: "Ⅲ-05",
    category: "商业项目",
    title: "上海嘉定文旅 ·《嘉定奇旅》AI 动画",
    year: "2025",
    medium: "AI 动画 / 数字特效",
    description:
      "以上海嘉定为创作蓝本，通过 Deforum 瞬息全宇宙、风格转绘等 AI 特效技术与传统 AE 拼贴动画手法，构建多层次、沉浸式的视觉叙事空间，呈现嘉定独特的历史底蕴与当代风貌。",
    image: "/works/work-16.jpg",
    hue: 120,
  },
  {
    id: "work-17",
    no: "Ⅲ-06",
    category: "商业项目",
    title: "快手磁力引擎 2025 宣传片",
    year: "2025",
    medium: "宣传影像 / AI 图像拼贴",
    description:
      "以 AI 生成图像拼贴和连续动态视频为核心技术，打破传统影像边界：智能算法将静态与动态视觉元素融合，创造连贯、丰富、多维的视觉叙事体验。",
    image: "/works/work-17.jpg",
    hue: 55,
  },
  {
    id: "work-18",
    no: "Ⅰ-09",
    category: "艺术创作",
    title: "桥渡牵牛织女星",
    year: "2026",
    medium: "沉浸影像 / VR",
    description: "以汉画像石与戏曲美学为视觉线索，将牛郎织女的分离与重逢转化为可进入的沉浸式空间。AI 参与角色、场景与动作的生成，观众通过移动和观看完成叙事的重新连接。",
    gif: "/works/gif/bridge.gif",
    poster: "/works/gif/bridge-poster.jpg",
    hue: 188,
    reserved: true,
  },
  {
    id: "work-19",
    no: "Ⅰ-10",
    category: "艺术创作",
    title: "一帧",
    year: "2025",
    medium: "ASCII 实验影像 · 1080 × 1080 / 30fps",
    description: "将 ASCII 编码转化为动态编织的文本织物：字符矩阵成为像素单位与数字线纱，数据经线和算法纬线在循环影像中交织，追问编码如何重新定义纤维、图像与叙事。",
    gif: "/works/gif/one-frame.gif",
    poster: "/works/gif/one-frame-poster.jpg",
    hue: 215,
    reserved: true,
  },
  {
    id: "work-20",
    no: "Ⅰ-11",
    category: "艺术创作",
    title: "白日梦不在这里",
    year: "2026",
    medium: "实验影像 · 1280 × 720 / 24fps",
    description: "从一张童年照片出发，把不倒翁、小熊软糖与鸭子重新放进明亮柔和的糖果塑料梦核空间。物件靠近、接触又分开，白日梦只在借旧物返回过去的一刻成立。",
    gif: "/works/gif/white-daydream.gif",
    poster: "/works/gif/white-daydream-poster.jpg",
    hue: 32,
    reserved: true,
  },
  {
    id: "work-21",
    no: "Ⅰ-12",
    category: "艺术创作",
    title: "五行医道",
    year: "2026",
    medium: "交互影像 / 游戏化中医药体验",
    description: "以中医五行关系为结构，将药材、卡牌、巡诊路线与事件选择组织成可探索的视觉系统。观众在游戏化的交互中理解生克关系，也在图像与规则之间观察传统知识如何被重新编排。",
    gif: "/works/gif/wuxing.gif",
    poster: "/works/gif/wuxing-poster.jpg",
    hue: 150,
    reserved: true,
  },
];

// 原始目录保留；新版主页只派生当前保留作品与待补资料的预留卡。
const removedFromPage = new Set(["work-01", "work-02", "work-05", "work-06", "work-07", "work-08"]);
const portfolioDescriptionOverrides: Record<string, string> = {
  "work-01": "以梦核美学重构千禧年记忆：Windows XP 开机画面、电子宠物、雪花屏电视等公共符号，与童年日记中的纸飞机、光盘、卡带等私密意象拼贴交织。保留噪点与畸变的「记忆晶体」，指向赛博空间中新型集体无意识的萌生。2025 天美毕业季优秀毕业作品。",
  "work-03": "融合 AI 生成技术与艺术想象，探索人工智能从无意识到自我觉醒的可能。以微观粒子为叙事主体，呼应博尔赫斯的巴别图书馆意象，构建无限延展的「影像图书馆」。",
  "work-04": "以阿兹海默症患者的主观感受为叙事核心，三个章节对应病程早期、中期与晚期，呈现记忆与感知世界逐渐坍塌中的孤独与悲怆。",
  "work-06": "一场当代炼金实践：「原料」取自清代聂璜《海错图》中已被证伪的虚构生物，经 AI 算法之「火」炼制为新的生命形态。作品在古籍图像、生成模型与数字生命之间建立一条可变的形态链。",
};
const pageWorks = works
  .filter((work) => work.category === "艺术创作" && !removedFromPage.has(work.id) && !work.reserved)
  .map((work) => portfolioDescriptionOverrides[work.id] ? { ...work, description: portfolioDescriptionOverrides[work.id] } : work);
const reservedWorks = works.filter((work) => work.category === "艺术创作" && work.reserved);
export const studioWorks = [...pageWorks, ...reservedWorks].map((work, index) => ({
  ...work,
  no: `Ⅰ-${String(index + 1).padStart(2, "0")}`,
}));
export const artWorks = studioWorks;
export const heroWorks = ["work-03", "work-04"].flatMap((id) =>
  studioWorks.filter((work) => work.id === id)
);
