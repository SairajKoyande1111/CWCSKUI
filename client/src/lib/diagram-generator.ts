import { WhamoNode, WhamoEdge } from './store';

// Layout constants
const R = 26;               // circle radius
const RRW = 58; const RRH = 36; // reservoir / flowBoundary rect
const STW = 30; const STH = 52; // surgeTank rect
const SX = 190;             // horizontal spacing (column pitch)
const SY = 120;             // vertical spacing (row pitch)
const MG = 90;              // canvas margin

function nHW(t: string): number {
  if (t === 'reservoir' || t === 'flowBoundary') return RRW / 2;
  if (t === 'surgeTank') return STW / 2;
  return R;
}
function nHH(t: string): number {
  if (t === 'surgeTank') return STH / 2;
  if (t === 'reservoir' || t === 'flowBoundary') return RRH / 2;
  return R;
}

function renderNode(type: string, x: number, y: number, label: string): string {
  const hw = nHW(type);
  const hh = nHH(type);
  const lbl = `<text x="${x}" y="${y + hh + 15}" text-anchor="middle" font-size="11" font-weight="700" fill="#000" font-family="Arial,sans-serif">${escapeXml(label)}</text>`;

  switch (type) {
    case 'reservoir':
      return (
        `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="3" fill="white" stroke="#000" stroke-width="2"/>` +
        `<path d="M${x - hw + 8} ${y - 5} Q${x} ${y - 11} ${x + hw - 8} ${y - 5}" fill="none" stroke="#000" stroke-width="1.5"/>` +
        `<path d="M${x - hw + 8} ${y + 3} Q${x} ${y - 3} ${x + hw - 8} ${y + 3}" fill="none" stroke="#000" stroke-width="1.5"/>` +
        lbl
      );

    case 'surgeTank':
      return (
        `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="2" fill="white" stroke="#000" stroke-width="2"/>` +
        `<line x1="${x - hw}" y1="${y - hh + 14}" x2="${x + hw}" y2="${y - hh + 14}" stroke="#000" stroke-width="1.5"/>` +
        lbl
      );

    case 'flowBoundary':
      return (
        `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="3" fill="white" stroke="#000" stroke-width="2"/>` +
        `<path d="M${x - hw + 8} ${y} Q${x - hw / 2 + 4} ${y - 7} ${x} ${y} Q${x + hw / 2 - 4} ${y + 7} ${x + hw - 8} ${y}" fill="none" stroke="#000" stroke-width="1.5"/>` +
        lbl
      );

    case 'junction':
      return (
        `<circle cx="${x}" cy="${y}" r="${R}" fill="white" stroke="#000" stroke-width="2"/>` +
        `<line x1="${x}" y1="${y + R - 7}" x2="${x}" y2="${y + 2}" stroke="#000" stroke-width="2.5"/>` +
        `<line x1="${x}" y1="${y + 2}" x2="${x - 9}" y2="${y - 10}" stroke="#000" stroke-width="2.5"/>` +
        `<line x1="${x}" y1="${y + 2}" x2="${x + 9}" y2="${y - 10}" stroke="#000" stroke-width="2.5"/>` +
        lbl
      );

    case 'pump':
      return (
        `<circle cx="${x}" cy="${y}" r="${R}" fill="white" stroke="#000" stroke-width="2"/>` +
        `<circle cx="${x}" cy="${y - 2}" r="8" fill="none" stroke="#000" stroke-width="1.5"/>` +
        `<path d="M${x} ${y - 10} Q${x + 12} ${y - 7} ${x + 11} ${y + 3}" stroke="#000" stroke-width="1.5" fill="none"/>` +
        `<path d="M${x} ${y + 6} Q${x - 12} ${y + 3} ${x - 11} ${y - 7}" stroke="#000" stroke-width="1.5" fill="none"/>` +
        lbl
      );

    case 'checkValve':
      return (
        `<circle cx="${x}" cy="${y}" r="${R}" fill="white" stroke="#000" stroke-width="2"/>` +
        `<polygon points="${x - 10},${y - 9} ${x - 10},${y + 9} ${x + 7},${y}" fill="#000"/>` +
        `<line x1="${x + 7}" y1="${y - 11}" x2="${x + 7}" y2="${y + 11}" stroke="#000" stroke-width="2.5"/>` +
        lbl
      );

    case 'turbine':
      return (
        `<circle cx="${x}" cy="${y}" r="${R}" fill="white" stroke="#000" stroke-width="2"/>` +
        `<circle cx="${x}" cy="${y}" r="4" fill="#000"/>` +
        `<path d="M${x} ${y} L${x + 4} ${y - 19} A19 19 0 0 1 ${x + 19} ${y - 4} Z" fill="#000" opacity="0.85"/>` +
        `<path d="M${x} ${y} L${x - 4} ${y + 19} A19 19 0 0 1 ${x - 19} ${y + 4} Z" fill="#000" opacity="0.85"/>` +
        lbl
      );

    case 'node':
    default:
      return (
        `<circle cx="${x}" cy="${y}" r="${R}" fill="white" stroke="#000" stroke-width="2"/>` +
        `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#000" font-family="Arial,sans-serif">${escapeXml(label)}</text>`
      );
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateSystemDiagramSVG(
  nodes: WhamoNode[],
  edges: WhamoEdge[],
  options: { showLabels: boolean } = { showLabels: true }
): string {
  const { showLabels } = options;

  type VN = { id: string; type: string; label: string };
  type VE = { from: string; to: string; label: string; isDummy: boolean };

  // Build virtual graph: edge-based pump/checkValve/turbine → virtual nodes
  const vns: VN[] = nodes.map(n => ({
    id: n.id,
    type: n.type || 'node',
    label: String(n.data?.label || ''),
  }));

  const ves: VE[] = [];

  edges.forEach(e => {
    const etype = String(e.data?.type || '');
    const isElem = etype === 'pump' || etype === 'checkValve' || etype === 'turbine';
    const isDummy = etype === 'dummy';
    const elabel = String(e.data?.label || '');

    if (isElem) {
      const vid = `__v_${e.id}`;
      vns.push({ id: vid, type: etype, label: elabel });
      ves.push({ from: e.source, to: vid, label: '', isDummy: false });
      ves.push({ from: vid, to: e.target, label: '', isDummy: false });
    } else {
      ves.push({ from: e.source, to: e.target, label: elabel, isDummy });
    }
  });

  if (vns.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120"><text x="200" y="65" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#999">No elements to display</text></svg>';
  }

  // BFS level assignment
  const adj: Record<string, string[]> = {};
  const inDeg: Record<string, number> = {};
  vns.forEach(n => { adj[n.id] = []; inDeg[n.id] = 0; });
  ves.forEach(e => {
    if (adj[e.from]) adj[e.from].push(e.to);
    if (e.to in inDeg) inDeg[e.to] = (inDeg[e.to] || 0) + 1;
  });

  const sources = vns.filter(n => !inDeg[n.id]).map(n => n.id);
  const lvl: Record<string, number> = {};
  (sources.length > 0 ? sources : [vns[0].id]).forEach(s => { lvl[s] = 0; });
  const q = sources.length > 0 ? [...sources] : [vns[0].id];

  while (q.length > 0) {
    const u = q.shift()!;
    for (const v of (adj[u] || [])) {
      if (lvl[v] === undefined || lvl[v] <= lvl[u]) {
        lvl[v] = lvl[u] + 1;
        q.push(v);
      }
    }
  }
  vns.forEach(n => { if (lvl[n.id] === undefined) lvl[n.id] = 0; });

  // Group by level
  const byLv: Record<number, string[]> = {};
  vns.forEach(n => {
    const l = lvl[n.id];
    if (!byLv[l]) byLv[l] = [];
    byLv[l].push(n.id);
  });

  const nLevels = Math.max(...Object.keys(byLv).map(Number)) + 1;
  const maxPerLevel = Math.max(...Object.values(byLv).map(a => a.length));

  // Extra vertical space for labels (15px text + some margin)
  const labelExtra = 30;
  const svgW = MG * 2 + (nLevels - 1) * SX + RRW + 60;
  const svgH = Math.max(280, MG * 2 + (maxPerLevel - 1) * SY + STH + labelExtra + 40);

  const pos: Record<string, { x: number; y: number }> = {};
  Object.entries(byLv).forEach(([lStr, ids]) => {
    const l = parseInt(lStr);
    const cx = MG + l * SX;
    const totalH = (ids.length - 1) * SY;
    const startY = (svgH / 2) - (totalH / 2);
    ids.forEach((id, i) => {
      pos[id] = { x: cx, y: startY + i * SY };
    });
  });

  const nm: Record<string, VN> = {};
  vns.forEach(n => { nm[n.id] = n; });

  // SVG output
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="background:white">
<defs>
  <marker id="arr" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
    <polygon points="0 0, 8 3.5, 0 7" fill="#000"/>
  </marker>
</defs>
`;

  // Draw edges first (under nodes)
  ves.forEach(ve => {
    const p1 = pos[ve.from];
    const p2 = pos[ve.to];
    if (!p1 || !p2) return;

    const t1 = nm[ve.from]?.type || 'node';
    const t2 = nm[ve.to]?.type || 'node';
    const x1 = p1.x + nHW(t1);
    const y1 = p1.y;
    const x2 = p2.x - nHW(t2);
    const y2 = p2.y;

    const sty = ve.isDummy
      ? 'stroke="#bbb" stroke-width="1.5" stroke-dasharray="6,4"'
      : 'stroke="#000" stroke-width="1.5"';
    const mk = ve.isDummy ? '' : 'marker-end="url(#arr)"';

    let d: string;
    if (Math.abs(y1 - y2) < 3) {
      d = `M${x1} ${y1} L${x2} ${y2}`;
    } else {
      const mx = x1 + (x2 - x1) * 0.45;
      d = `M${x1} ${y1} L${mx} ${y1} L${mx} ${y2} L${x2} ${y2}`;
    }

    svg += `<path d="${d}" ${sty} fill="none" ${mk}/>\n`;

    if (showLabels && ve.label) {
      const lx = (x1 + Math.min(x1 + (x2 - x1) * 0.45, x2)) / 2;
      const ly = Math.min(y1, y2);
      const lw = ve.label.length * 7 + 14;
      svg += `<rect x="${lx - lw / 2}" y="${ly - 20}" width="${lw}" height="16" rx="8" fill="white" stroke="#000" stroke-width="1"/>\n`;
      svg += `<text x="${lx}" y="${ly - 8}" text-anchor="middle" font-size="10" font-weight="600" fill="#000" font-family="Arial,sans-serif">${escapeXml(ve.label)}</text>\n`;
    }
  });

  // Draw nodes on top
  vns.forEach(vn => {
    const p = pos[vn.id];
    if (!p) return;
    svg += renderNode(vn.type, p.x, p.y, vn.label);
  });

  svg += '</svg>';
  return svg;
}

export const generateSystemDiagram = generateSystemDiagramSVG;
