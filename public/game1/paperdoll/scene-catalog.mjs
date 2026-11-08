import {compileTimeline} from './paperdoll-core.mjs?v=paperdoll-v1-20261108-44';

// These presets use existing approved rig-v9 images. New art remains a separate approval step.
const segment = (id, pose, durationMs, label, prop = null) => ({id, pose, durationMs, label, prop});
export const SCENES = Object.freeze([
  {
    id: 'clothing-shop', name: '服装店', subtitle: '整理 · 试搭 · 照镜',
    outfits: {cat: {top: 6, bottom: 3, accessory: 3}, fox: {top: 9, bottom: 5, accessory: 3}},
    segments: [segment('welcome', 'stand', 1800, '迎客站姿'), segment('fold', 'fold', 2600, '整理衣物'), segment('mirror', 'groom', 2400, '照镜整理'), segment('finish', 'stand', 1600, '回到站姿')],
    newOutfit: '小满：蓝灰针织背心＋奶白衬衣；小夏：暖赭工作衬衫＋橄榄半身围裙。保留猫狐身份与原比例。',
    newMotion: '拿衣架 → 比身试搭 → 叠衣 → 递出；需要独立前后手、衣架和衣物层。',
    missing: '新店员服、衣架/卷尺、试衣动作帧与服装店场景，均待出图审批。'
  },
  {
    id: 'park', name: '公园', subtitle: '舒展 · 小坐 · 喝水',
    outfits: {cat: {top: 8, bottom: 5, accessory: 0}, fox: {top: 5, bottom: 3, accessory: 0}},
    segments: [segment('arrive', 'stand', 1500, '户外站姿'), segment('stretch', 'stretch', 2600, '伸展身体'), segment('bench', 'sit', 2400, '长椅坐姿'), segment('drink', 'standing-sip', 2600, '站立喝水'), segment('finish', 'stand', 1500, '回到站姿')],
    newOutfit: '小满：海盐蓝轻外套＋棉麻长裤；小夏：叶绿开衫＋暖色便装。保持露耳，不加运动帽或挎包。',
    newMotion: '散步循环 → 停下看风景 → 坐凳 → 起身；先做当前视角，再按需要画侧背面。',
    missing: '真正走路周期、长椅前景/座位锚点、公园地图与双人野餐动作待出图。'
  },
  {
    id: 'bookstore', name: '书店', subtitle: '挑书 · 站读 · 坐读',
    outfits: {cat: {top: 7, bottom: 4, accessory: 0}, fox: {top: 6, bottom: 5, accessory: 1}},
    segments: [segment('browse', 'stand', 1500, '书架前站姿'), segment('standing-read', 'standing-read', 3000, '站立读书', 'book'), segment('read', 'read', 3600, '坐下阅读', 'book'), segment('finish', 'stand', 1500, '回到站姿')],
    newOutfit: '小满：靛蓝细纹衬衣＋米色针织背心；小夏：赤陶针织衫＋书店工作围裙。眼镜只保留小满固有一副。',
    newMotion: '从架上取书 → 翻页 → 合书 → 放回；书封、书页与两只手分层绑定。',
    missing: '取书/翻页/递书连续帧、书店柜台与书架遮挡；当前先验证原有独立书本层。'
  },
  {
    id: 'gym', name: '健身房', subtitle: '热身 · 单车 · 补水',
    outfits: {cat: {top: 4, bottom: 2, accessory: 0}, fox: {top: 4, bottom: 2, accessory: 0}},
    segments: [segment('ready', 'stand', 1400, '运动站姿'), segment('warmup', 'stretch', 2500, '热身伸展'), segment('cycle', 'exercise', 3600, '单车骑行姿态'), segment('hydrate', 'standing-sip', 2500, '站立补水'), segment('finish', 'stand', 1400, '回到站姿')],
    newOutfit: '小满：蓝白拼色透气上衣＋深蓝运动裤；小夏：珊瑚橙运动上衣＋灰绿长裤。不恢复旧帽子。',
    newMotion: '肩臂热身 → 单车踏圈 → 哑铃弯举 → 擦汗；脚踏和手持器械分别设锚点。',
    missing: '分腿踏圈、弯举/擦汗帧、独立毛巾/水壶/小哑铃与健身房场景待出图。'
  }
].map(scene => Object.freeze({...scene, approval: 'existing-assets-preview-only', backgroundAvailable: false})));

export const POSE_LABELS = Object.freeze({stand: '站立', sit: '坐下', read: '坐读', sip: '坐着喝水', craft: '手作', cook: '烹饪', fold: '整理', stretch: '伸展', rest: '躺休', water: '浇花', exercise: '骑车姿态', type: '打字', sew: '缝纫', 'standing-read': '站读', 'standing-sip': '站着喝水', groom: '照镜'});
export const LAYER_LABELS = Object.freeze({'body-and-tail': '身体／尾巴复合层', bottom: '下装', top: '上衣', 'front-hands-and-props': '前手／道具复合层', accessory: '配饰', 'held-book': '独立书本', 'held-paper': '独立纸张'});
export const sceneOf = id => {const scene = SCENES.find(s => s.id === id); if (!scene) throw Error('未知场景预设。'); return scene;};
export function sceneTimeline(id) {
  const scene = sceneOf(id);
  return compileTimeline({id: scene.id, loop: true, segments: scene.segments.map(({label, ...segment}) => segment)});
}
