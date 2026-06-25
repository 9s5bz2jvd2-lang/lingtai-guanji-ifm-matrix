// ============================================================
// ifmNodes.js — 静态 IFM 关系模型（数据层 / data layer）
// 灵台分层：data 层只描述「关系空间」的结构，不含任何视图或副作用。
// 八节点 + 三因 + 五生活方式 + 中心，全部双语；纯数据，可被 schema/view 复用。
// ============================================================

// 复述故事的三因（前置 / 触发 / 介导）
export const storyDefs = [
  { key: 'antecedents', zh: '前置因素', en: 'Antecedents', zhsub: '基因 · 早期环境', ensub: 'Genes · early environment' },
  { key: 'triggers', zh: '触发因素', en: 'Triggers', zhsub: '催化剂 · 诱发事件', ensub: 'Catalysts · provoking events' },
  { key: 'mediators', zh: '介导因素', en: 'Mediators', zhsub: '参与 · 维持因素', ensub: 'Participating · perpetuating factors' },
];

// 八节点：环形排布（angle 单位为度，0°在正上方，顺时针）
export const nodeDefs = [
  { key: 'assimilation', zh: '同化代谢', en: 'Assimilation', zhsub: '消化 · 吸收 · 微生态', ensub: 'Digestion · absorption · microbiome', angle: 0 },
  { key: 'biotransformation', zh: '生物转化与排泄', en: 'Biotransformation & Elimination', zhsub: '毒素暴露 · 解毒', ensub: 'Toxin exposure · detoxification', angle: 45 },
  { key: 'defense', zh: '防御与修复', en: 'Defense & Repair', zhsub: '免疫调节 · 炎症', ensub: 'Immune regulation · inflammation', angle: 90 },
  { key: 'energy', zh: '能量生成', en: 'Energy', zhsub: '线粒体 · 氧化压力', ensub: 'Mitochondria · oxidative stress', angle: 135 },
  { key: 'transport', zh: '输运系统', en: 'Transport', zhsub: '心血管 · 脂质 · 淋巴', ensub: 'Cardiovascular · lipids · lymphatics', angle: 180 },
  { key: 'communication', zh: '传讯系统', en: 'Communication', zhsub: '内分泌 · 神经递质', ensub: 'Endocrine · neurotransmitters', angle: 225 },
  { key: 'structural', zh: '结构完整', en: 'Structural Integrity', zhsub: '关节 · 肌肉 · 细胞膜', ensub: 'Joints · muscles · membranes', angle: 270 },
  { key: 'mindbody', zh: '身心一体', en: 'Mind–Body', zhsub: '认知 · 情绪 · 行为', ensub: 'Cognition · emotion · behavior', angle: 315 },
];

// 中心：圆酱（王润圆） × 灵台
export const CENTER = {
  zh: '心 · 神 · 意义',
  en: 'Mental · Emotional · Spiritual',
  zhsub: '一心万相 · 万相归元',
  ensub: 'One heart, ten-thousand forms',
};

// 可调的生活方式
export const lifestyleDefs = [
  { key: 'sleep', zh: '睡眠与休息', en: 'Sleep & Relaxation' },
  { key: 'movement', zh: '运动与活动', en: 'Movement & Activity' },
  { key: 'nutrition', zh: '营养与水分', en: 'Nutrition & Hydration' },
  { key: 'stress', zh: '压力调适', en: 'Stress' },
  { key: 'relationships', zh: '人际关系', en: 'Relationships' },
];

// 环形几何：把 angle 解算成百分比坐标（视图与镜照报告共用）
export const RING = { R: 38, cx: 50, cy: 50 };
export function nodePoints() {
  const { R, cx, cy } = RING;
  return nodeDefs.map((d) => {
    const rad = ((d.angle - 90) * Math.PI) / 180; // 0°在上方
    return { ...d, x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  });
}
