// ============================================================
// aiAdapter.js — AI 镜照适配层（ai-adapter 层）
// 灵台分层：把「模型」隔离在一个边界后。视图只调用 mirror()，
// 不关心是本地示例还是在线模型。
//
// 安全边界（试用版）：
//  - 密钥只活在本模块的内存变量 _apiKey 里；从不写入 localStorage /
//    sessionStorage / indexedDB / cookie。
//  - 无密钥时走本地示例镜照（mock），完全不联网。
//  - 有密钥时才尝试 OpenAI/MiMo 兼容 fetch；失败返回友好错误，不崩溃。
//  - 不硬编码任何真实密钥。
// ============================================================

import { ifmSchemaShape, safeJsonFromText } from './schema.js';
import { nodeDefs } from './ifmNodes.js';

// —— 默认配置：仅占位，无任何真实密钥 ——
export const DEFAULT_AI = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  temperature: 0.2,
  maxTokens: 3000,
};

// 密钥只存这里（模块作用域内存）。刷新页面 → 模块重载 → 自动清空。
let _apiKey = '';
export function setApiKey(k) { _apiKey = String(k || ''); }
export function hasApiKey() { return _apiKey.trim().length > 0; }
// 注意：不导出 getApiKey()，避免视图层把密钥又抄进可持久化的 state。

// —— 本地示例镜照：无密钥时的占位，确定性、可读、明显是示例 ——
// 关键词 → 节点的极简启发式，仅用于让营养师在无网时也能看到「关系显影」形态。
const HINTS = [
  { key: 'assimilation', re: /(腹胀|胃|肠|消化|便秘|腹泻|食欲|gut|bloat|digest|stool)/i },
  { key: 'biotransformation', re: /(解毒|肝|毒素|重金属|环境|detox|liver|toxin)/i },
  { key: 'defense', re: /(过敏|免疫|炎症|感染|风湿|immune|inflamm|allerg|infect)/i },
  { key: 'energy', re: /(疲劳|乏力|线粒体|能量|fatigue|energy|tired|mitochond)/i },
  { key: 'transport', re: /(血压|血脂|心|淋巴|循环|cholesterol|cardio|lipid|pressure)/i },
  { key: 'communication', re: /(甲状腺|激素|内分泌|血糖|经期|thyroid|hormone|insulin|glucose|menstru)/i },
  { key: 'structural', re: /(关节|肌肉|骨|皮肤|疼痛|joint|muscle|bone|skin|pain)/i },
  { key: 'mindbody', re: /(焦虑|抑郁|压力|睡眠|情绪|认知|anxiet|depress|stress|sleep|mood)/i },
];

function localMirror(paste) {
  const text = String(paste || '');
  const lines = text.split(/\n|;|；|。|\.|、/).map((s) => s.trim()).filter(Boolean);
  const shape = ifmSchemaShape();
  const out = { story: { antecedents: [], triggers: [], mediators: [] }, nodes: {}, lifestyle: {} };
  Object.keys(shape.nodes).forEach((k) => { out.nodes[k] = { items: [] }; });

  lines.forEach((line) => {
    let matched = false;
    HINTS.forEach((h) => {
      if (h.re.test(line)) { out.nodes[h.key].items.push(line); matched = true; }
    });
    // 三因的弱启发式
    if (/(从小|家族|基因|童年|早期|since childhood|family|genetic)/i.test(line)) out.story.antecedents.push(line);
    if (/(开始于|之后|诱发|起因|after|trigger|onset)/i.test(line)) out.story.triggers.push(line);
    if (/(持续|长期|反复|加重|chronic|persist|ongoing)/i.test(line)) out.story.mediators.push(line);
    if (!matched && /(睡|运动|饮食|压力|关系|sleep|exercise|diet|stress|relation)/i.test(line)) {
      // 落到生活方式区，作弱提示（此处从简，留给营养师手补）
    }
  });

  // 若什么都没匹配到，放一条「示例」提示到身心一体，保证视觉有反馈
  const any = Object.values(out.nodes).some((n) => n.items.length) ||
    Object.values(out.story).some((a) => a.length);
  if (!any) {
    out.nodes.mindbody.items.push('〔示例镜照〕未识别明确线索，建议营养师补充问诊 / sample: add interview detail');
  }
  return out;
}

// 构造给模型的提示：只抽取，不诊断
function buildPrompt(paste) {
  const schema = ifmSchemaShape();
  return (
    '请从以下功能医学 / 营养问诊资料中提取 IFM 关系条目。' +
    '只返回 JSON，不要解释，不要诊断，不要给治疗方案。保守临床措辞。' +
    'JSON schema 示例：' + JSON.stringify(schema) + '\n\n资料：\n' + paste
  );
}

// 统一入口。返回 { ok, data?, source:'mock'|'live', error? }
// source='mock' 表示本地示例（无密钥）；'live' 表示在线模型。
export async function mirror(paste, ai) {
  const text = String(paste || '').trim();
  if (!text) return { ok: false, source: 'mock', error: 'EMPTY_PASTE' };

  // —— 无密钥：本地示例镜照，绝不联网 ——
  if (!hasApiKey()) {
    return { ok: true, source: 'mock', data: localMirror(text) };
  }

  // —— 有密钥：尝试 OpenAI/MiMo 兼容调用 ——
  try {
    const cfg = { ...DEFAULT_AI, ...(ai || {}) };
    const url = String(cfg.baseUrl || '').replace(/\/$/, '') + '/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + _apiKey,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: Number(cfg.temperature) || 0.2,
        max_tokens: Number(cfg.maxTokens) || 3000,
        messages: [
          { role: 'system', content: 'You extract structured IFM relationship entries. Return strict JSON only, no prose. Conservative clinical wording; no diagnosis; no treatment plan.' },
          { role: 'user', content: buildPrompt(text) },
        ],
      }),
    });
    if (!res.ok) {
      const body = (await res.text().catch(() => '')).slice(0, 200);
      return { ok: false, source: 'live', error: 'HTTP ' + res.status + ' ' + body };
    }
    const data = await res.json();
    const msg = (data.choices && data.choices[0] && data.choices[0].message) || {};
    const content = msg.content || msg.reasoning_content || '';
    const parsed = safeJsonFromText(content);
    return { ok: true, source: 'live', data: parsed };
  } catch (e) {
    return { ok: false, source: 'live', error: (e && e.message) || String(e) };
  }
}

// 给视图生成一句「镜照印记」摘要（用于镜照卡标题），不作诊断
export function mirrorSummary(data, lang) {
  let n = 0;
  nodeDefs.forEach((d) => { if (data && data.nodes && data.nodes[d.key] && data.nodes[d.key].items && data.nodes[d.key].items.length) n += 1; });
  return lang === 'zh'
    ? `已映出 ${n} / ${nodeDefs.length} 个节点的关系线索`
    : `Reflected relations across ${n} / ${nodeDefs.length} nodes`;
}
