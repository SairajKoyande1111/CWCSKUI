import { WhamoNode, WhamoEdge } from './store';

// ─── Layout constants ─────────────────────────────────────────────────────────
const R   = 9;                       // circle node radius
const RRW = 42; const RRH = 26;      // reservoir / flowBoundary (w × h)
const STW = 20; const STH = 32;      // surgeTank (w × h)
const SX  = 150;                     // column pitch (px)
const SY  = 90;                      // row pitch (px)
const MG  = 85;                      // canvas margin

// ─── Bright colours per type ──────────────────────────────────────────────────
const COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  reservoir:    { fill: '#2196F3', stroke: '#1565C0', text: '#fff' },
  surgeTank:    { fill: '#FF6D00', stroke: '#BF360C', text: '#fff' },
  flowBoundary: { fill: '#9C27B0', stroke: '#6A1B9A', text: '#fff' },
  node:         { fill: '#90A4AE', stroke: '#546E7A', text: '#fff' },
  junction:     { fill: '#F44336', stroke: '#B71C1C', text: '#fff' },
  pump:         { fill: '#00BCD4', stroke: '#006064', text: '#fff' },
  checkValve:   { fill: '#37474F', stroke: '#102027', text: '#fff' },
  turbine:      { fill: '#FF5722', stroke: '#BF360C', text: '#fff' },
};
function col(t: string) { return COLORS[t] ?? COLORS.node; }

// Connection-point half-extents
function nHW(t: string) {
  if (t === 'reservoir' || t === 'flowBoundary') return RRW / 2;
  if (t === 'surgeTank') return STW / 2;
  return R;
}
function nHH(t: string) {
  if (t === 'surgeTank') return STH / 2;
  if (t === 'reservoir' || t === 'flowBoundary') return RRH / 2;
  return R;
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Node shape ────────────────────────────────────────────────────────────────
function renderNode(type: string, x: number, y: number, label: string, srcId: string, srcType: string): string {
  const hh = nHH(type);
  const hw = nHW(type);
  const c  = col(type);

  let shape = '';
  let lbl   = '';

  if (type === 'reservoir' || type === 'flowBoundary') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="5"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y + 4}" text-anchor="middle" font-size="11"
      font-weight="700" fill="${c.text}" font-family="Arial,sans-serif">${esc(label)}</text>`;
  } else if (type === 'surgeTank') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="4"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
      <line x1="${x - hw + 2}" y1="${y - hh + 10}" x2="${x + hw - 2}" y2="${y - hh + 10}"
        stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y - hh - 8}" text-anchor="middle" font-size="11"
      font-weight="600" fill="#111" font-family="Arial,sans-serif">${esc(label)}</text>`;
  } else {
    shape = `<circle cx="${x}" cy="${y}" r="${R}"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y - R - 7}" text-anchor="middle" font-size="11"
      font-weight="600" fill="#111" font-family="Arial,sans-serif">${esc(label)}</text>`;
  }

  return `<g class="ng" data-srcid="${esc(srcId)}" data-srctype="${esc(srcType)}" style="cursor:pointer">
  ${shape}
  ${lbl}
</g>`;
}

// ─── Get the canvas y-position for any node (real or virtual inline element) ──
function getCanvasY(
  id: string,
  srcType: string,
  srcId: string,
  nodes: WhamoNode[],
  edges: WhamoEdge[],
): number {
  if (srcType === 'node') {
    const n = nodes.find(n => n.id === srcId);
    return n?.position.y ?? 0;
  }
  // Virtual node (inline pump / checkValve / turbine) — midpoint of its edge endpoints
  const e = edges.find(e => e.id === srcId);
  if (!e) return 0;
  const src = nodes.find(n => n.id === e.source);
  const tgt = nodes.find(n => n.id === e.target);
  return ((src?.position.y ?? 0) + (tgt?.position.y ?? 0)) / 2;
}

// ─── Get the canvas x-position for any node (real or virtual inline element) ──
function getCanvasX(
  id: string,
  srcType: string,
  srcId: string,
  nodes: WhamoNode[],
  edges: WhamoEdge[],
): number {
  if (srcType === 'node') {
    const n = nodes.find(n => n.id === srcId);
    return n?.position.x ?? 0;
  }
  const e = edges.find(e => e.id === srcId);
  if (!e) return 0;
  const src = nodes.find(n => n.id === e.source);
  const tgt = nodes.find(n => n.id === e.target);
  return ((src?.position.x ?? 0) + (tgt?.position.x ?? 0)) / 2;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function generateSystemDiagramSVG(
  nodes: WhamoNode[],
  edges: WhamoEdge[],
  options: { showLabels: boolean } = { showLabels: true }
): string {
  const { showLabels } = options;

  type VN = { id: string; type: string; label: string; srcId: string; srcType: string };
  type VE = { from: string; to: string; label: string; isDummy: boolean; srcEdgeId: string };

  // ── Build virtual graph ────────────────────────────────────────────────────
  // Edge-based elements (pump/checkValve/turbine) become inline virtual nodes.
  const vns: VN[] = nodes.map(n => ({
    id:      n.id,
    type:    n.type || 'node',
    label:   String(n.data?.label ?? ''),
    srcId:   n.id,
    srcType: 'node',
  }));

  const ves: VE[] = [];

  edges.forEach(e => {
    const etype   = String(e.data?.type ?? '');
    const isElem  = etype === 'pump' || etype === 'checkValve' || etype === 'turbine';
    const isDummy = etype === 'dummy';
    const elabel  = String(e.data?.label ?? '');

    if (isElem) {
      const vid = `__v_${e.id}`;
      vns.push({ id: vid, type: etype, label: elabel, srcId: e.id, srcType: 'edge' });
      ves.push({ from: e.source, to: vid,      label: '',     isDummy: false, srcEdgeId: e.id });
      ves.push({ from: vid,      to: e.target, label: '',     isDummy: false, srcEdgeId: e.id });
    } else {
      ves.push({ from: e.source, to: e.target, label: elabel, isDummy, srcEdgeId: e.id });
    }
  });

  if (vns.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120">'
      + '<text x="200" y="65" text-anchor="middle" font-family="Arial,sans-serif"'
      + ' font-size="14" fill="#aaa">No elements to display</text></svg>';
  }

  const nm: Record<string, VN> = {};
  vns.forEach(n => { nm[n.id] = n; });

  // ── Adjacency + in-degree ──────────────────────────────────────────────────
  const adj:   Record<string, string[]> = {};
  const inDeg: Record<string, number>   = {};
  vns.forEach(n => { adj[n.id] = []; inDeg[n.id] = 0; });
  ves.forEach(e => {
    if (adj[e.from])   adj[e.from].push(e.to);
    if (e.to in inDeg) inDeg[e.to] = (inDeg[e.to] || 0) + 1;
  });

  // ── Topological sort (Kahn) ────────────────────────────────────────────────
  const inDegCopy = { ...inDeg };
  const topoQ: string[] = vns.filter(n => !inDegCopy[n.id]).map(n => n.id);
  const topoOrder: string[] = [];
  const visited = new Set<string>();
  while (topoQ.length > 0) {
    const u = topoQ.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    topoOrder.push(u);
    for (const v of (adj[u] || [])) {
      inDegCopy[v] = (inDegCopy[v] || 1) - 1;
      if (inDegCopy[v] <= 0) topoQ.push(v);
    }
  }
  vns.forEach(n => { if (!visited.has(n.id)) topoOrder.push(n.id); });

  // ── Longest-path DP → column index ────────────────────────────────────────
  const lvl: Record<string, number> = {};
  vns.forEach(n => { lvl[n.id] = 0; });
  for (const u of topoOrder) {
    for (const v of (adj[u] || [])) {
      const proposed = (lvl[u] ?? 0) + 1;
      if ((lvl[v] ?? 0) < proposed) lvl[v] = proposed;
    }
  }

  // ── Detect LATERAL nodes ───────────────────────────────────────────────────
  // A root node (in-degree 0) with exactly 1 outgoing edge whose target has
  // level > 0 is "lateral" — it branches off mid-network (e.g. a surge tank).
  // Pull these out of the main horizontal column layout and place them
  // vertically adjacent to their anchor node instead.
  const lateralSet    = new Set<string>();
  const lateralAnchor: Record<string, string> = {};

  vns.forEach(n => {
    if ((inDeg[n.id] ?? 0) !== 0) return;
    const neighbors = adj[n.id] || [];
    if (neighbors.length !== 1) return;
    const anchorId = neighbors[0];
    if ((lvl[anchorId] ?? 0) > 0) {
      lateralSet.add(n.id);
      lateralAnchor[n.id] = anchorId;
    }
  });

  // ── Group non-lateral nodes by column level ────────────────────────────────
  const byLv: Record<number, string[]> = {};
  vns.forEach(n => {
    if (lateralSet.has(n.id)) return;
    const l = lvl[n.id] ?? 0;
    if (!byLv[l]) byLv[l] = [];
    byLv[l].push(n.id);
  });

  // ── Sort each column by CANVAS y-position ─────────────────────────────────
  // This is the key insight: the user's canvas layout already encodes the
  // correct top-to-bottom ordering of branches. We read those positions
  // directly instead of guessing from graph topology.
  Object.values(byLv).forEach(ids => {
    ids.sort((a, b) => {
      const vna = nm[a];
      const vnb = nm[b];
      const ay  = getCanvasY(a, vna.srcType, vna.srcId, nodes, edges);
      const by2 = getCanvasY(b, vnb.srcType, vnb.srcId, nodes, edges);
      return ay - by2;
    });
  });

  // ── Compute SVG dimensions ─────────────────────────────────────────────────
  const nLevels     = Math.max(...Object.keys(byLv).map(Number)) + 1;
  const maxPerLevel = Math.max(...Object.values(byLv).map(a => a.length));

  // Find canvas y-extent of lateral nodes relative to their anchors to size
  // the top/bottom padding correctly.
  let maxAbove = 0; // how far above the main centre a lateral can sit
  lateralSet.forEach(id => {
    const vn  = nm[id];
    const an  = nm[lateralAnchor[id]];
    const idy = getCanvasY(id, vn.srcType, vn.srcId, nodes, edges);
    const acy = getCanvasY(an.id, an.srcType, an.srcId, nodes, edges);
    const diff = acy - idy; // positive → lateral is ABOVE anchor on canvas
    if (diff > 0) maxAbove = Math.max(maxAbove, diff);
  });

  // Extra vertical headroom for lateral nodes above the main layout
  const topPad = lateralSet.size > 0 ? Math.min(maxAbove + 50, 140) : 0;

  const svgW = MG * 2 + (nLevels - 1) * SX + RRW + 80;
  const svgH = Math.max(260, topPad + MG * 2 + (maxPerLevel - 1) * SY + STH + 60);

  // ── Assign 2-D positions ───────────────────────────────────────────────────
  const pos: Record<string, { x: number; y: number }> = {};
  const mainCentreY = topPad + MG + ((svgH - topPad - MG * 2) / 2);

  Object.entries(byLv).forEach(([lStr, ids]) => {
    const l      = parseInt(lStr);
    const cx     = MG + l * SX;
    const totalH = (ids.length - 1) * SY;
    const startY = mainCentreY - totalH / 2;
    ids.forEach((id, i) => {
      pos[id] = { x: cx, y: startY + i * SY };
    });
  });

  // ── Place lateral nodes relative to their anchor ───────────────────────────
  // Determine above/below from canvas positions; preserve the visual intent.
  lateralSet.forEach(id => {
    const vn      = nm[id];
    const ancId   = lateralAnchor[id];
    const an      = nm[ancId];
    const ap      = pos[ancId];
    if (!ap) return;

    const idy  = getCanvasY(id,    vn.srcType, vn.srcId, nodes, edges);
    const acy  = getCanvasY(ancId, an.srcType, an.srcId, nodes, edges);
    const above = idy < acy; // on canvas the lateral sits above the anchor

    // Scale canvas offset to diagram row pitch for natural spacing
    const canvasDiff  = Math.abs(acy - idy);
    const scaleFactor = SY / 120; // 120 px = typical canvas row gap
    const diagOffset  = Math.max(SY * 0.9, Math.min(canvasDiff * scaleFactor, SY * 2));

    pos[id] = { x: ap.x, y: ap.y + (above ? -diagOffset : diagOffset) };
  });

  // ── Detect parallel edges ──────────────────────────────────────────────────
  const pairCount: Record<string, number> = {};
  const pairIndex: Record<string, number> = {};
  ves.forEach(ve => {
    const k = `${ve.from}→${ve.to}`;
    pairIndex[k] = (pairIndex[k] ?? -1) + 1;
    (ve as any)['_idx'] = pairIndex[k];
    pairCount[k] = (pairCount[k] ?? 0) + 1;
  });

  // ── SVG header ────────────────────────────────────────────────────────────
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}"
  viewBox="0 0 ${svgW} ${svgH}" style="background:white;font-family:Arial,sans-serif">
<defs>
  <marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#555"/>
  </marker>
</defs>
<style>
  .ng { cursor: pointer; }
  .cg { cursor: pointer; }
</style>
`;

  // ── Draw edges (under nodes) ───────────────────────────────────────────────
  ves.forEach(ve => {
    const p1 = pos[ve.from];
    const p2 = pos[ve.to];
    if (!p1 || !p2) return;

    const t1 = nm[ve.from]?.type || 'node';
    const t2 = nm[ve.to]?.type   || 'node';

    const isFromLateral = lateralSet.has(ve.from);
    const isToLateral   = lateralSet.has(ve.to);

    // ── Vertical edge for lateral connections (e.g. surge tank → junction) ──
    if (isFromLateral || isToLateral) {
      // Determine which end is the lateral and which is the anchor
      const lateralId  = isFromLateral ? ve.from : ve.to;
      const anchorId   = isFromLateral ? ve.to   : ve.from;
      const lp = pos[lateralId];
      const ap = pos[anchorId];
      if (!lp || !ap) return;
      const lt = nm[lateralId]?.type || 'node';
      const at = nm[anchorId]?.type  || 'node';

      // Connect bottom of upper node to top of lower node
      const [upper, lower, ut, at2] = lp.y < ap.y
        ? [lp, ap, lt, at]
        : [ap, lp, at, lt];

      const x1 = upper.x;
      const y1 = upper.y + nHH(ut);
      const x2 = lower.x;
      const y2 = lower.y - nHH(at2);
      const d  = `M${x1} ${y1} L${x2} ${y2}`;

      svg += `<path d="${d}" stroke="#555" stroke-width="1.5" fill="none" marker-end="url(#arr)"/>\n`;

      if (ve.label) {
        const lx = x1;
        const ly = (y1 + y2) / 2;
        const lw = ve.label.length * 7 + 16;
        const lh = 14;
        svg += `<g class="cg" data-srcid="${esc(ve.srcEdgeId)}" data-srctype="edge" style="pointer-events:all;cursor:pointer">
  <rect class="lbl" x="${lx - lw/2}" y="${ly - lh/2}" width="${lw}" height="${lh}"
    rx="7" fill="white" stroke="#888" stroke-width="1"/>
  <text class="lbl" x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="9"
    font-weight="700" fill="#333" font-family="Arial,sans-serif">${esc(ve.label)}</text>
</g>\n`;
      }
      return;
    }

    // ── Standard horizontal / elbow edge ─────────────────────────────────────
    const k     = `${ve.from}→${ve.to}`;
    const total = pairCount[k] || 1;
    const idx   = (ve as any)['_idx'] as number ?? 0;
    const vOff  = total > 1 ? (idx - (total - 1) / 2) * 12 : 0;

    const x1 = p1.x + nHW(t1);
    const y1 = p1.y + vOff;
    const x2 = p2.x - nHW(t2);
    const y2 = p2.y + vOff;

    const sty = ve.isDummy
      ? 'stroke="#ccc" stroke-width="1.5" stroke-dasharray="5,4"'
      : 'stroke="#555" stroke-width="1.5"';
    const mk = ve.isDummy ? '' : 'marker-end="url(#arr)"';

    let d: string;
    if (Math.abs(y1 - y2) < 3) {
      d = `M${x1} ${y1} L${x2} ${y2}`;
    } else {
      // Elbow: go halfway horizontally, then snap to target row
      const mx = x1 + (x2 - x1) * 0.5;
      d = `M${x1} ${y1} L${mx} ${y1} L${mx} ${y2} L${x2} ${y2}`;
    }

    svg += `<path d="${d}" ${sty} fill="none" ${mk}/>\n`;

    if (ve.label) {
      const lx = Math.abs(y1 - y2) < 3
        ? (x1 + x2) / 2
        : x1 + (x2 - x1) * 0.25;
      const ly = y1;
      const lw = ve.label.length * 7 + 16;
      const lh = 14;
      svg += `<g class="cg" data-srcid="${esc(ve.srcEdgeId)}" data-srctype="edge" style="pointer-events:all;cursor:pointer">
  <rect class="lbl" x="${lx - lw/2}" y="${ly - lh/2}" width="${lw}" height="${lh}"
    rx="7" fill="white" stroke="#888" stroke-width="1"/>
  <text class="lbl" x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="9"
    font-weight="700" fill="#333" font-family="Arial,sans-serif">${esc(ve.label)}</text>
</g>\n`;
    }
  });

  // ── Draw nodes (on top) ────────────────────────────────────────────────────
  vns.forEach(vn => {
    const p = pos[vn.id];
    if (!p) return;
    svg += renderNode(vn.type, p.x, p.y, vn.label, vn.srcId, vn.srcType);
  });

  const labelDisplay = showLabels ? '' : ' .lbl{display:none}';
  svg = svg.replace('<style>', `<style>${labelDisplay}`);
  svg += '</svg>';
  return svg;
}

export const generateSystemDiagram = generateSystemDiagramSVG;
