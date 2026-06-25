// ============================================================
// view.js — 视图层（view 层，原生 DOM，无框架 / 无 Babel）
// 灵台分层：view 只负责把 state 画成关系空间；所有数据来自 data/schema，
// 所有 AI 经 ai-adapter，所有闭环经 flow。视图自身不持有业务规则。
//
// 渲染策略：极简「全量重绘」——每次 state 变化 render(root, ...) 一次。
// DOM 不大（八节点 + 几个面板），全量重绘足够快，且避免引入 vDOM 依赖。
// ============================================================

import { storyDefs, nodeDefs, lifestyleDefs, CENTER, RING, nodePoints } from './ifmNodes.js';
import { t, L, STR } from './i18n.js';
import { FLOW, currentStep } from './lingtaiFlow.js';

// —— 小工具 ——
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style') node.setAttribute('style', v);
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null || c === false) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

// 题写列表（克制的 CRUD，图优先）
function Lines(lang, items, mode, onChange, compact) {
  const list = items || [];
  const cls = 'lines' + (compact ? ' compact' : '');
  if (mode !== 'edit') {
    if (!list.length) return el('div', { class: 'empty', text: '—' });
    const ul = el('ul', { class: cls });
    list.forEach((it) => ul.appendChild(el('li', { text: it })));
    return ul;
  }
  const wrap = el('div', { class: 'lines-edit' + (compact ? ' compact' : '') });
  list.forEach((it, i) => {
    const input = el('input', { value: it, placeholder: t(lang, 'enterText') });
    input.addEventListener('input', (e) => {
      const n = [...list]; n[i] = e.target.value; onChange(n);
    });
    const del = el('button', { class: 'del', 'aria-label': 'delete', text: '－', onClick: () => onChange(list.filter((_, k) => k !== i)) });
    wrap.appendChild(el('div', { class: 'line-row' }, [input, del]));
  });
  wrap.appendChild(el('button', { class: 'addline', text: t(lang, 'add'), onClick: () => onChange([...list, '']) }));
  return wrap;
}

// 印章 / 落款
function Seal(lang, small) {
  return el('div', { class: 'seal' + (small ? ' seal-sm' : ''), title: t(lang, 'credentialFull') }, [
    el('div', { class: 'seal-main', text: lang === 'zh' ? '润圆' : 'RYW' }),
    el('div', { class: 'seal-sub', text: t(lang, 'sealSub') }),
  ]);
}

// 灵台回环条（采集 → 关系显影 → AI 镜照 → 营养师裁断 → 回环）
function FlowBar(lang, state) {
  const active = currentStep(state);
  const steps = STR.flowSteps;
  const bar = el('div', { class: 'flowbar no-print', 'aria-label': t(lang, 'flowTitle') });
  bar.appendChild(el('span', { class: 'flow-label', text: t(lang, 'flowTitle') }));
  FLOW.forEach((stepKey, i) => {
    const label = steps[i][lang === 'zh' ? 0 : 1];
    bar.appendChild(el('span', { class: 'flow-step' + (active === stepKey ? ' on' : ''), text: label }));
    if (i < FLOW.length - 1) bar.appendChild(el('span', { class: 'flow-arrow', text: '→' }));
  });
  bar.appendChild(el('span', { class: 'flow-hint', text: t(lang, 'flowHint') }));
  return bar;
}

// 主图：向心环形关系空间
function SpaceDiagram(lang, state, mode, setNodes) {
  const pts = nodePoints();
  const { R } = RING;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'space-svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <defs><radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FBF3DD" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#F4E9CE" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#F4E9CE" stop-opacity="0"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="46" fill="url(#halo)"/>
    <circle class="ring" cx="50" cy="50" r="${R}"/>
    <circle class="ring ring-soft" cx="50" cy="50" r="${R - 7}"/>
    <circle class="ring ring-soft" cx="50" cy="50" r="${R + 6}"/>
    ${pts.map((p) => `<line class="spoke" x1="${p.x.toFixed(2)}" y1="${p.y.toFixed(2)}" x2="50" y2="50"/>`).join('')}
    <circle class="flow" cx="50" cy="50" r="${R}"/>
    <circle class="center-core" cx="50" cy="50" r="11"/>
  `;

  const space = el('div', { class: 'space' }, [svg]);

  // 中心
  space.appendChild(el('div', { class: 'hub' }, [
    el('div', { class: 'hub-name', text: t(lang, 'centerName') }),
    el('div', { class: 'hub-cn', text: L(lang, CENTER.zh, CENTER.en) }),
    el('div', { class: 'hub-sub', text: L(lang, CENTER.zhsub, CENTER.ensub) }),
  ]));

  // 八节点环绕
  pts.forEach((p) => {
    const items = (state.nodes[p.key] && state.nodes[p.key].items) || [];
    const orb = el('div', {
      class: 'orb' + (items.length ? ' filled' : ''),
      style: `left:${p.x}%;top:${p.y}%`,
    }, [
      el('div', { class: 'orb-cn', text: L(lang, p.zh, p.en) }),
      el('div', { class: 'orb-sub', text: L(lang, p.zhsub, p.ensub) }),
      Lines(lang, items, mode, (v) => setNodes(p.key, v), true),
    ]);
    space.appendChild(orb);
  });
  return space;
}

// 折叠面板外壳
function AuxPanel(lang, dotText, dotClass, titleKey, open, onToggle, bodyChildren) {
  const toggle = el('button', { class: 'aux-toggle', onClick: onToggle }, [
    el('span', { class: 'aux-dot' + (dotClass ? ' ' + dotClass : ''), text: dotText }),
    t(lang, titleKey),
    el('span', { class: 'chev', text: open ? '▾' : '▸' }),
  ]);
  const children = [toggle];
  if (open) children.push(el('div', { class: 'aux-body' }, bodyChildren));
  return el('section', { class: 'aux no-print' }, children);
}

// 镜照卡（仅会话内存，非导出物）
function MirrorCards(lang, cards) {
  const wrap = el('section', { class: 'cards no-print' });
  wrap.appendChild(el('h3', { class: 'brush', text: t(lang, 'cardsTitle') }));
  if (!cards || !cards.length) {
    wrap.appendChild(el('p', { class: 'card-empty', text: t(lang, 'cardEmpty') }));
    return wrap;
  }
  const grid = el('div', { class: 'card-grid' });
  cards.forEach((c) => {
    const srcLabel = c.source === 'live' ? t(lang, 'cardLive') : t(lang, 'cardMock');
    grid.appendChild(el('div', { class: 'mcard' + (c.source === 'mock' ? ' mock' : '') }, [
      el('div', { class: 'mcard-sum', text: lang === 'zh' ? c.summaryZh : c.summaryEn }),
      el('div', { class: 'mcard-meta' }, [
        el('span', { class: 'mcard-src', text: t(lang, 'cardSource') + ' · ' + srcLabel }),
        el('span', { class: 'mcard-review', text: t(lang, 'reviewBadge') }),
      ]),
    ]));
  });
  wrap.appendChild(grid);
  return wrap;
}

// 顶层渲染：把整页画进 root
export function render(root, state, handlers, ui) {
  const lang = state.lang, mode = state.mode;
  root.innerHTML = '';
  const scroll = el('div', { class: 'scroll' });

  // 题头
  const tools = el('div', { class: 'masthead-tools' }, [
    el('button', { class: 'ghost', text: t(lang, 'langBtn'), onClick: handlers.toggleLang }),
    el('button', { class: 'ghost', text: mode === 'edit' ? t(lang, 'modeView') : t(lang, 'modeEdit'), onClick: handlers.toggleMode }),
    // 生成矩阵图 PDF：圆酱 P0 唯一对外产出动作（浏览器原生 print，非导入/导出按钮）
    el('button', { class: 'ghost pdf', text: t(lang, 'pdfBtn'), title: t(lang, 'pdfHint'), onClick: handlers.makePdf }),
    el('button', { class: 'ghost', text: t(lang, 'clear'), onClick: handlers.clearAll }),
  ]);
  scroll.appendChild(el('header', { class: 'masthead no-print' }, [
    Seal(lang),
    el('div', { class: 'title-block' }, [
      el('div', { class: 'title', text: t(lang, 'title') }),
      el('div', { class: 'subtitle', text: t(lang, 'subtitle') }),
    ]),
    tools,
  ]));

  // 灵台回环条
  scroll.appendChild(FlowBar(lang, state));

  // 案主一行
  const caseLine = el('div', { class: 'case-line no-print' });
  if (mode === 'edit') {
    const input = el('input', { class: 'case-input', value: state.patient, placeholder: t(lang, 'patientPh') });
    input.addEventListener('input', (e) => handlers.setPatient(e.target.value));
    caseLine.appendChild(input);
  } else {
    caseLine.appendChild(el('span', { class: 'case-name', text: state.patient || t(lang, 'unnamed') }));
  }
  scroll.appendChild(caseLine);

  if (ui.err) scroll.appendChild(el('div', { class: 'err no-print', role: 'alert', text: ui.err }));

  // 主画布：图 + 故事三因
  const story = el('aside', { class: 'story-scroll' });
  story.appendChild(el('h3', { class: 'brush', text: t(lang, 'storyTitle') }));
  storyDefs.forEach((d) => {
    story.appendChild(el('div', { class: 'story-item' }, [
      el('div', { class: 'story-h' }, [L(lang, d.zh, d.en), el('small', { text: L(lang, d.zhsub, d.ensub) })]),
      Lines(lang, state.story[d.key] || [], mode, (v) => handlers.setStory(d.key, v), false),
    ]));
  });
  scroll.appendChild(el('main', { class: 'canvas' }, [
    el('section', { class: 'diagram-wrap' }, [SpaceDiagram(lang, state, mode, handlers.setNodes)]),
    story,
  ]));

  // 生活方式
  const lifeGrid = el('div', { class: 'life-grid' });
  lifestyleDefs.forEach((d) => {
    lifeGrid.appendChild(el('div', { class: 'life-item' }, [
      el('div', { class: 'life-h', text: L(lang, d.zh, d.en) }),
      Lines(lang, state.lifestyle[d.key] || [], mode, (v) => handlers.setLife(d.key, v), true),
    ]));
  });
  scroll.appendChild(el('section', { class: 'life-scroll' }, [
    el('h3', { class: 'brush', text: t(lang, 'lifeTitle') }), lifeGrid,
  ]));

  // 采集区（只此一处粘贴资料）
  const paste = el('textarea', { placeholder: t(lang, 'pastePh') });
  paste.value = state.paste;
  paste.addEventListener('input', (e) => handlers.setPaste(e.target.value));
  const analyzeBtn = el('button', {
    class: 'primary', text: ui.busy ? t(lang, 'analyzing') : t(lang, 'analyze'),
    onClick: handlers.runMirror,
  });
  if (ui.busy) analyzeBtn.setAttribute('disabled', 'disabled');
  const dataBody = [
    el('p', { class: 'aux-hint', text: t(lang, 'dataHint') }),
    paste,
    el('div', { class: 'aux-actions' }, [
      analyzeBtn,
      el('small', { class: 'aux-disclaim', text: handlers.hasKey() ? t(lang, 'aiDisclaim') : t(lang, 'mockNote') }),
    ]),
  ];
  scroll.appendChild(AuxPanel(lang, '采', '', 'dataTitle', ui.dataOpen, handlers.toggleData, dataBody));

  // AI 设置面板（与采集区分离）
  const aiGridFields = [
    { key: 'baseUrl', ph: 'https://api.openai.com/v1', type: 'text' },
    { key: 'model', ph: 'gpt-4o-mini / MiMo-…', type: 'text' },
    { key: 'apiKey', ph: 'sk-…', type: 'password' },
    { key: 'temperature', ph: '', type: 'number', step: '0.1', min: '0', max: '2' },
  ];
  const aiGrid = el('div', { class: 'ai-grid' });
  aiGridFields.forEach((f) => {
    const labelKey = f.key === 'temperature' ? 'temp' : (f.key === 'baseUrl' ? 'baseUrl' : f.key);
    const input = el('input', { type: f.type, value: ui.aiDraft[f.key], placeholder: f.ph });
    if (f.step) input.setAttribute('step', f.step);
    if (f.min != null) input.setAttribute('min', f.min);
    if (f.max != null) input.setAttribute('max', f.max);
    input.addEventListener('input', (e) => handlers.setAiDraft(f.key, e.target.value));
    const label = el('label', {}, [t(lang, labelKey), input]);
    if (f.key === 'apiKey') {
      // 给密钥字段加「内存暂存」徽标，强调不落盘
      label.appendChild(el('span', { class: 'key-badge', text: t(lang, 'keyMemoryBadge') }));
    }
    aiGrid.appendChild(label);
  });
  const maxInput = el('input', { type: 'number', min: '256', step: '100', value: ui.aiDraft.maxTokens });
  maxInput.addEventListener('input', (e) => handlers.setAiDraft('maxTokens', e.target.value));
  aiGrid.appendChild(el('label', { class: 'span2' }, [t(lang, 'maxTok'), maxInput]));

  const aiBody = [
    el('p', { class: 'where', text: t(lang, 'aiPanelWhere') }),
    el('p', { class: 'aux-hint', text: t(lang, 'aiPanelIntro') }),
    aiGrid,
    el('div', { class: 'aux-actions' }, [
      el('button', { class: 'primary', text: ui.appliedFlash ? t(lang, 'applied') : t(lang, 'apply'), onClick: handlers.applyAi }),
      el('small', { class: 'aux-disclaim', text: t(lang, 'keyNote') }),
    ]),
  ];
  scroll.appendChild(AuxPanel(lang, 'API', 'api', 'aiPanelTitle', ui.aiOpen, handlers.toggleAi, aiBody));

  // 镜照卡
  scroll.appendChild(MirrorCards(lang, state.mirrorCards));

  // 落款页脚
  scroll.appendChild(el('footer', { class: 'colophon' }, [
    Seal(lang, true),
    el('div', { class: 'colophon-text', text: t(lang, 'footer') }),
  ]));

  root.appendChild(scroll);
}
