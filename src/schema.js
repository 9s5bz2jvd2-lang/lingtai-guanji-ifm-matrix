// ============================================================
// schema.js — 结构定义与表单状态校验（schema 层）
// 灵台分层：schema 层是「关系空间」的契约。它定义空状态、规范化输入、
// 并把 AI 镜照返回的松散 JSON 收敛回受控结构。
// 不提供任何导入/导出能力：这里只做「会话内」的结构校验。
// ============================================================

import { storyDefs, nodeDefs, lifestyleDefs } from './ifmNodes.js';

// 空状态：一份干净的关系空间（刷新即回到此处，符合试用版边界）
export function emptyState() {
  return {
    lang: 'zh',
    mode: 'view',
    patient: '',
    paste: '',
    story: Object.fromEntries(storyDefs.map((d) => [d.key, []])),
    nodes: Object.fromEntries(nodeDefs.map((d) => [d.key, { items: [] }])),
    lifestyle: Object.fromEntries(lifestyleDefs.map((d) => [d.key, []])),
    // 镜照卡：仅存当前会话内存，刷新即清
    mirrorCards: [],
  };
}

// 内置「schema 形状」——给 AI 看的示例，也用于本地校验
export function ifmSchemaShape() {
  return {
    story: { antecedents: [''], triggers: [''], mediators: [''] },
    nodes: Object.fromEntries(nodeDefs.map((d) => [d.key, { items: [''] }])),
    lifestyle: Object.fromEntries(lifestyleDefs.map((d) => [d.key, ['']])),
  };
}

// 规范化：任意值 → 去空白、去空项的字符串数组
export function arr(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(/\n|;|；|、/).map((x) => x.trim()).filter(Boolean);
  return [];
}

// 校验 + 合并：把 AI/镜照返回的对象安全并入受控 state（按 key/zh/en 三种命中）
export function mergeStructuredInto(state, data) {
  const next = { ...state };
  next.story = { ...state.story };
  next.nodes = { ...state.nodes };
  next.lifestyle = { ...state.lifestyle };

  if (data && data.story) {
    storyDefs.forEach((d) => {
      const a = arr(data.story[d.key] || data.story[d.zh] || data.story[d.en]);
      if (a.length) next.story[d.key] = a;
    });
  }
  if (data && data.nodes) {
    nodeDefs.forEach((d) => {
      const raw = data.nodes[d.key] || data.nodes[d.zh] || data.nodes[d.en];
      if (raw === undefined) return;
      const a = arr(raw && raw.items !== undefined ? raw.items : raw);
      if (a.length) next.nodes[d.key] = { ...(next.nodes[d.key] || {}), items: a };
    });
  }
  if (data && data.lifestyle) {
    lifestyleDefs.forEach((d) => {
      const a = arr(data.lifestyle[d.key] || data.lifestyle[d.zh] || data.lifestyle[d.en]);
      if (a.length) next.lifestyle[d.key] = a;
    });
  }
  return next;
}

// 从模型自由文本里抠出第一段合法 JSON（容忍 ```json 围栏与前后说明文字）
export function safeJsonFromText(text) {
  const raw = String(text || '');
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('未取得 JSON / no JSON found');
  return JSON.parse(body.slice(start, end + 1));
}

// 轻量「完整度」体检：用于关系显影后给营养师一个填充比例（非诊断）
export function coverage(state) {
  let filled = 0;
  nodeDefs.forEach((d) => { if ((state.nodes[d.key]?.items || []).length) filled += 1; });
  return { filled, total: nodeDefs.length };
}
