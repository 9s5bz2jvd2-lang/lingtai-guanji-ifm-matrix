// ============================================================
// app.js — 应用控制层（controller）
// 把 data / schema / view / ai-adapter / flow 接成一台机器。
//
// 状态原则（试用版边界）：
//  - 全部 state 只活在内存（下面的模块变量 state / ui）。
//  - 不读写 localStorage / sessionStorage / indexedDB / cookie。
//  - 刷新页面即回到空状态，这是被接受的边界。
//  - 镜照卡只追加进 state.mirrorCards，亦仅会话内存（非导出物）。
// ============================================================

import { emptyState, mergeStructuredInto } from './schema.js';
import { DEFAULT_AI, setApiKey, hasApiKey } from './aiAdapter.js';
import { runMirror } from './lingtaiFlow.js';
import { render } from './view.js';
import { t } from './i18n.js';
import { makePdf } from './print.js';

const root = document.getElementById('root');

// —— 纯内存状态 ——
let state = emptyState();
// UI 临时态（非领域数据）
let ui = {
  err: '',
  busy: false,
  dataOpen: false,
  aiOpen: false,
  appliedFlash: false,
  // AI 设置草稿：含 apiKey，但「启用」后 key 交给 aiAdapter 的内存变量，
  // 这里随即清空明文，避免视图层长期持有。
  aiDraft: { ...DEFAULT_AI, apiKey: '' },
};
let mirrorSeq = 0; // 镜照调用序号，用于稳定 card id（不依赖随机/时间）

function paint() { render(root, state, handlers, ui); }
function setState(patch) { state = { ...state, ...patch }; paint(); }
function setUi(patch) { ui = { ...ui, ...patch }; paint(); }

const handlers = {
  toggleLang: () => setState({ lang: state.lang === 'zh' ? 'en' : 'zh' }),
  toggleMode: () => setState({ mode: state.mode === 'edit' ? 'view' : 'edit' }),
  setPatient: (v) => { state.patient = v; /* 输入态无需重绘整页 */ },
  setPaste: (v) => { state.paste = v; },

  setStory: (k, v) => setState({ story: { ...state.story, [k]: v } }),
  setNodes: (k, v) => setState({ nodes: { ...state.nodes, [k]: { ...state.nodes[k], items: v } } }),
  setLife: (k, v) => setState({ lifestyle: { ...state.lifestyle, [k]: v } }),

  toggleData: () => setUi({ dataOpen: !ui.dataOpen }),
  toggleAi: () => setUi({ aiOpen: !ui.aiOpen }),
  setAiDraft: (k, v) => { ui.aiDraft = { ...ui.aiDraft, [k]: v }; /* 输入态不重绘 */ },

  hasKey: () => hasApiKey(),

  // 启用 API（仅本会话）：把 key 交给 aiAdapter 内存变量，随即从草稿清掉明文
  applyAi: () => {
    setApiKey(ui.aiDraft.apiKey || '');
    ui.aiDraft = { ...ui.aiDraft, apiKey: '' };
    setUi({ appliedFlash: true });
    setTimeout(() => setUi({ appliedFlash: false }), 1400);
  },

  // 灵台回环之「AI 镜照」：调 flow.runMirror，成功则并入 state + 追加镜照卡
  runMirror: async () => {
    setUi({ err: '' });
    if (!state.paste.trim()) { setUi({ err: t(state.lang, 'needPaste'), dataOpen: true }); return; }
    setUi({ busy: true });
    try {
      mirrorSeq += 1;
      const r = await runMirror(state, ui.aiDraft, mirrorSeq);
      if (!r.ok) {
        const detail = r.error === 'EMPTY_PASTE' ? '' : (r.error || '');
        setUi({ busy: false, err: t(state.lang, 'aiFail') + detail + ' ' + t(state.lang, 'corsHint') });
        return;
      }
      state = mergeStructuredInto(state, r.data);
      state.mirrorCards = [r.card, ...(state.mirrorCards || [])];
      ui.busy = false; ui.dataOpen = false;
      paint();
    } catch (e) {
      setUi({ busy: false, err: t(state.lang, 'aiFail') + ((e && e.message) || e) + ' ' + t(state.lang, 'corsHint') });
    }
  },

  // 生成矩阵图 PDF（浏览器原生 print）
  makePdf: () => makePdf(state, state.lang),

  clearAll: () => {
    if (confirm(t(state.lang, 'clearConfirm'))) {
      const lang = state.lang;
      state = { ...emptyState(), lang };
      paint();
    }
  },
};

paint();
