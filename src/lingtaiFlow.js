// ============================================================
// lingtaiFlow.js — 灵台小闭环编排（flow 层）
// 采集 → 关系显影 → AI 镜照 → 营养师裁断 → 回环
//
// 这一层把「思想」落成可运行的状态：每一步是什么、当前在哪一步、
// 一次镜照如何沉淀成一张「镜照卡」（仅会话内存，非导出物）。
// 不玄化：每一步都是具体动作，AI 只在「镜照」一步出现，且永不裁断。
// ============================================================

import { coverage } from './schema.js';
import { mirror, mirrorSummary } from './aiAdapter.js';

// 闭环五步（与 i18n.flowSteps 对齐）
export const FLOW = ['gather', 'reveal', 'mirror', 'judge', 'return'];

// 依据当前 state 推断「灵台回环」走到了哪一步（用于高亮）
export function currentStep(state) {
  const hasPaste = !!(state.paste && state.paste.trim());
  const { filled } = coverage(state);
  const hasMirror = (state.mirrorCards || []).length > 0;
  if (!hasPaste && !filled) return 'gather';
  if (hasPaste && !filled && !hasMirror) return 'reveal';
  if (hasMirror && filled) return 'judge'; // 已显影 + 已镜照 → 待营养师裁断
  if (filled) return 'reveal';
  return 'gather';
}

// 执行一次「AI 镜照」：调用 ai-adapter，并把结果包成一张镜照卡。
// 返回 { ok, data?, card?, source, error? }；卡片仅供会话内存使用。
export async function runMirror(state, ai, seq) {
  const r = await mirror(state.paste, ai);
  if (!r.ok) return r;
  const card = {
    // 用调用序号生成稳定 id（不使用 Date.now / random，便于可复算）
    id: 'mirror-' + (seq || 0),
    source: r.source, // 'mock' | 'live'
    summaryZh: mirrorSummary(r.data, 'zh'),
    summaryEn: mirrorSummary(r.data, 'en'),
    review: 'pending', // 待营养师裁断
  };
  return { ...r, card };
}
