// ============================================================
// i18n.js — 双语文案（zh / en）
// 试用版边界已写进文案：不存密钥、无导入导出、勿填真实身份信息。
// 产品名（圆酱 final）：灵台·观己 功能医学矩阵绘制台 / Lingtai · Guanji Functional Medicine Matrix Drawing Studio
// ============================================================

export const STR = {
  title: ['灵台·观己 功能医学矩阵绘制台', 'Lingtai · Guanji Functional Medicine Matrix Drawing Studio'],
  subtitle: ['一心万相 · 八维回环 · 圆酱（王润圆） × 灵台', 'Lingtai · Guanji Functional Medicine Matrix Drawing Studio · Yuanjiang (Runyuan Wang) × LingTai'],
  centerName: ['圆酱（王润圆） × 灵台', 'Yuanjiang (Runyuan Wang) × LingTai'],
  sealSub: ['灵台 製', 'by LingTai'],
  credentialFull: [
    '王润圆（圆酱） · 昆明医科大学营养与食品卫生学硕士 · 灵台製',
    'Runyuan Wang (Yuanjiang) · M.Sc. Nutrition & Food Hygiene, Kunming Medical University · made with LingTai',
  ],

  // 灵台小闭环：采集 → 关系显影 → AI 镜照 → 营养师裁断 → 回环
  flowTitle: ['灵台回环', 'LingTai Loop'],
  flowSteps: [
    ['采集', 'Gather'],
    ['关系显影', 'Reveal relations'],
    ['AI 镜照', 'AI mirror'],
    ['营养师裁断', 'Dietitian judges'],
    ['回环', 'Return'],
  ],
  flowHint: [
    'AI 只作协理与镜照，不作诊断裁判；裁断归营养师。',
    'AI only assists and mirrors; it never judges or diagnoses. The dietitian decides.',
  ],

  storyTitle: ['复述您的故事', 'Retelling the Story'],
  lifeTitle: ['可调的生活方式', 'Modifiable Lifestyle'],
  patientPh: ['案主 · 案例名（勿填真实身份信息）', 'Patient / case label (no real identity)'],
  unnamed: ['未具名', 'Unnamed'],
  langBtn: ['EN', '中文'],
  modeView: ['静观', 'View'],
  modeEdit: ['题写', 'Write'],
  enterText: ['题写一句…', 'write a line…'],
  add: ['＋ 添一笔', '＋ add'],

  // 采集区（只此一处粘贴资料）
  dataTitle: ['采集 · 粘贴病例线索', 'Gather · Paste Case Notes'],
  dataHint: [
    '此处只粘贴病史 / 问诊 / 饮食与生活线索。请勿在此填写 API。试用版请勿粘贴真实患者身份信息。',
    'Paste history / interview / diet & lifestyle clues here only. Do NOT enter your API here. In this trial, do not paste real patient identity.',
  ],
  pastePh: [
    '在此粘贴病史、问诊记录、饮食与生活方式线索……\n（API 设置在另一处 → 见「灵台协理 · API 设置」面板）',
    'Paste history, interview notes, diet & lifestyle clues here...\n(API is configured elsewhere → see the "LingTai · API Settings" panel)',
  ],
  analyze: ['请灵台协理初拢（关系显影）', 'Ask LingTai to draft (reveal relations)'],
  analyzing: ['镜照中…', 'mirroring…'],
  mockNote: ['未设密钥：以下为本地示例镜照（不联网）。', 'No key set: this is a local sample mirror (offline).'],
  aiDisclaim: ['灵台只做整理与镜照，不替代润圆与医师的裁断。', 'LingTai only organizes & mirrors; it never replaces clinical judgment.'],

  // AI 设置面板（与采集区分离）
  aiPanelTitle: ['灵台协理 · API 设置', 'LingTai · API Settings'],
  aiPanelWhere: ['☖ API 在此设置（不要粘到采集区）', '☖ Set your API HERE (not in the gather area)'],
  aiPanelIntro: [
    '在此填写 MiMo / OpenAI 兼容接口。仅存于本页内存变量，刷新即清，不写入浏览器存储。',
    'Enter your MiMo / OpenAI-compatible endpoint here. Held only in this page’s memory; cleared on refresh; never written to browser storage.',
  ],
  baseUrl: ['接口地址 Base URL', 'Base URL'],
  model: ['模型 Model', 'Model'],
  apiKey: ['密钥 API Key', 'API Key'],
  temp: ['温度 Temperature', 'Temperature'],
  maxTok: ['最大 Token（推理模型建议 ≥3000）', 'Max tokens (≥3000 for reasoning models)'],
  apply: ['启用（仅本次会话）', 'Apply (this session only)'],
  applied: ['已启用', 'Applied'],
  keyNote: [
    '密钥只活在本页内存变量里：不存 localStorage / cookie，刷新即清。请勿在公共电脑输入真实密钥。',
    'The key lives only in this page’s memory: no localStorage / cookie, cleared on refresh. Never enter a real key on a public computer.',
  ],
  keyMemoryBadge: ['内存暂存', 'in-memory'],

  // 生成矩阵图 PDF（圆酱 P0：唯一对外产出动作，浏览器原生 print）
  pdfBtn: ['生成矩阵图 PDF', 'Make Matrix PDF'],
  pdfHint: [
    '用浏览器「打印 / 存为 PDF」生成只含标题、署名、八节点矩阵图与安全说明的图。在弹出的打印窗口选「另存为 PDF」。',
    'Uses the browser “Print / Save as PDF” to produce a sheet with title, colophon, the 8-node matrix, and the safety note. Choose “Save as PDF” in the print dialog.',
  ],

  clear: ['净卷（清空本次会话）', 'Clear this session'],
  clearConfirm: ['净卷？将清空当前所有题写（本会话）。', 'Clear the whole scroll for this session?'],
  needPaste: ['请先在采集区粘贴问诊资料。', 'Please paste case notes in the gather area first.'],
  aiFail: ['镜照未成：', 'Mirror failed: '],
  corsHint: ['（若为浏览器 CORS，请改用后端代理；试用版前端直连可能被拦。）', '(If this is a browser CORS issue, use a backend proxy; direct front-end calls may be blocked in this trial.)'],

  // 镜照卡（仅会话内存；非导出物）
  cardsTitle: ['镜照卡 · 本会话', 'Mirror Cards · this session'],
  cardEmpty: ['尚无镜照卡。采集线索后请灵台初拢，将在此留下镜照印记。', 'No mirror cards yet. Gather clues and ask LingTai to draft; mirrors appear here.'],
  cardSource: ['来源', 'Source'],
  cardMock: ['本地示例', 'local sample'],
  cardLive: ['在线模型', 'live model'],
  reviewBadge: ['待营养师裁断', 'awaiting dietitian'],

  // 打印视图（仅 PDF 用）
  printTitle: ['灵台·观己 功能医学矩阵绘制台', 'Lingtai · Guanji Functional Medicine Matrix Drawing Studio'],
  printCase: ['案主 · 案例', 'Patient · Case'],
  printSafety: [
    '本图为营养师内部辅助与关系显影，仅供临床参考；AI 仅作镜照，不作诊断或治疗。',
    'This sheet is a dietitian-internal aid and relationship view, for clinical reference only; AI mirrors and does not diagnose or treat.',
  ],

  footer: [
    '王润圆 · 昆明医科大学营养与食品卫生学硕士 × 灵台 · 营养师内部辅助 · 仅供临床参考，不作诊断或治疗',
    'Runyuan Wang · M.Sc. Nutrition & Food Hygiene, Kunming Medical University × LingTai · Dietitian-internal aid · for clinical reference only, not a diagnosis or treatment',
  ],
};

export function t(lang, k) {
  const v = STR[k];
  if (!v) return k;
  return lang === 'zh' ? v[0] : v[1];
}
export function L(lang, zh, en) { return lang === 'zh' ? zh : en; }
export function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
