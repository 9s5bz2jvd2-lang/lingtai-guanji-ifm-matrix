// ============================================================
// print.js — 生成矩阵图 PDF（圆酱 P0：唯一对外产出动作）
// 用浏览器原生「打印 / 另存为 PDF」产出一张只含：标题、署名印章、
// 八节点矩阵图、安全说明 的图。无导入/导出按钮；不写文件、不下载 blob，
// 全部交给浏览器 print 对话框（用户在其中选「存为 PDF」）。
// 实现选用「同页 #print-root + @media print」而非弹窗，移动端更稳、不被拦截。
// ============================================================

import { CENTER, RING, nodePoints } from './ifmNodes.js';
import { t, L, esc } from './i18n.js';

// 把一张「只读矩阵图」渲染进 #print-root；@media print 时只显示它。
export function buildPrintSheet(state, lang) {
  const { R } = RING;
  const pts = nodePoints();
  const spokes = pts.map((p) =>
    `<line x1="${p.x.toFixed(2)}" y1="${p.y.toFixed(2)}" x2="50" y2="50" stroke="#cdb988" stroke-width="0.3"/>`
  ).join('');
  const orbs = pts.map((p) => {
    const items = (state.nodes[p.key] && state.nodes[p.key].items) || [];
    const li = items.length ? '<ul>' + items.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '';
    return `<div class="p-orb" style="left:${p.x}%;top:${p.y}%">
      <div class="p-orb-cn">${esc(L(lang, p.zh, p.en))}</div>
      <div class="p-orb-sub">${esc(L(lang, p.zhsub, p.ensub))}</div>${li}</div>`;
  }).join('');

  return `
    <div class="p-head">
      <div class="p-seal"><div class="p-seal-m">${lang === 'zh' ? '润圆' : 'RYW'}</div><div class="p-seal-s">${esc(t(lang, 'sealSub'))}</div></div>
      <div class="p-title">${esc(t(lang, 'printTitle'))}</div>
      <div class="p-for">${esc(t(lang, 'printCase'))}：${esc(state.patient || t(lang, 'unnamed'))}</div>
    </div>
    <div class="p-diagram">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle class="p-ring" cx="50" cy="50" r="${R}"/>
        <circle class="p-ring" cx="50" cy="50" r="${R - 7}"/>
        <circle class="p-ring" cx="50" cy="50" r="${R + 6}"/>
        ${spokes}
      </svg>
      <div class="p-hub">
        <div class="p-hub-name">${esc(t(lang, 'centerName'))}</div>
        <div class="p-hub-cn">${esc(L(lang, CENTER.zh, CENTER.en))}</div>
        <div class="p-hub-sub">${esc(L(lang, CENTER.zhsub, CENTER.ensub))}</div>
      </div>
      ${orbs}
    </div>
    <div class="p-safety">${esc(t(lang, 'printSafety'))}</div>
    <div class="p-foot">${esc(t(lang, 'footer'))}</div>
  `;
}

// 触发打印：先把内容写进 #print-root，再 window.print()。
export function makePdf(state, lang) {
  const root = document.getElementById('print-root');
  if (!root) return;
  root.innerHTML = buildPrintSheet(state, lang);
  // 给浏览器一帧时间排版再唤起打印对话框
  setTimeout(() => { try { window.print(); } catch (e) { /* 友好降级：用户可手动 Ctrl/Cmd+P */ } }, 60);
}
