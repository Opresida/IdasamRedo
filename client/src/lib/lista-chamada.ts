// Gera a "Lista de Chamada / Presença" de um curso no MESMO modelo do arquivo
// output/chamada-fundamentos.html (logo IDASAM, metadados do curso, tabela numerada,
// rodapé fixo www.idasam.org com tfoot espaçador). Saída via janela de impressão do
// navegador (Salvar como PDF / imprimir) — fidelidade total ao modelo (vetorial).
import idasamLogoSvg from './idasam-logo-chamada-svg';
import type { Course } from '@shared/schema';

export type ChamadaCurso = Pick<
  Course,
  'title' | 'instructor' | 'workload' | 'schedule' | 'startDate' | 'endDate' | 'location' | 'address'
>;
export type ChamadaAluno = { fullName: string | null; cpf: string | null };

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

/** 11 dígitos → 000.000.000-00; senão devolve o valor bruto (trim). */
export function formatCpf(raw?: string | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return raw.trim();
}

const STYLE = `
  @page { size: A4 portrait; margin: 14mm 12mm 22mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color:#1f2937; margin:0; }
  :root{ --forest:#1c4a2b; --forest2:#2a6b40; --sand:#f5f2ea; --line:#d8d8cf; }
  .head { display:flex; align-items:center; gap:16px; border-bottom:3px solid var(--forest); padding-bottom:12px; }
  .logo { width:64px; height:64px; flex:0 0 auto; }
  .logo svg { width:100%; height:100%; }
  .head .org { flex:1; }
  .head .org h1 { margin:0; font-size:13px; letter-spacing:.5px; color:var(--forest); text-transform:uppercase; }
  .head .org p { margin:2px 0 0; font-size:10px; color:#6b7280; }
  .doc-tag { text-align:right; font-size:9px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; }
  .title { text-align:center; margin:16px 0 4px; }
  .title h2 { margin:0; font-size:17px; color:var(--forest); text-transform:uppercase; letter-spacing:.5px; }
  .title .sub { font-size:11px; color:#6b7280; margin-top:3px; }
  .meta { background:var(--sand); border:1px solid var(--line); border-radius:8px; padding:10px 14px; margin:14px 0 6px;
          display:grid; grid-template-columns:1fr 1fr; gap:4px 24px; font-size:10.5px; }
  .meta div b { color:var(--forest); }
  .data-field { display:flex; justify-content:flex-end; align-items:center; gap:6px; font-size:11px; margin:8px 0 10px; font-weight:bold; color:var(--forest); }
  .data-field .blank { border-bottom:1.5px solid #374151; display:inline-block; width:42px; height:14px; }
  table { width:100%; border-collapse:collapse; font-size:10.5px; }
  thead th { background:var(--forest); color:#fff; padding:8px 6px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.4px; }
  tbody td { border:1px solid var(--line); padding:0 6px; height:30px; vertical-align:middle; }
  tbody tr:nth-child(even) { background:#fafaf7; }
  .num { width:34px; text-align:center; color:#6b7280; }
  .cpf { width:120px; white-space:nowrap; }
  .ass { width:200px; }
  th.num{text-align:center;}
  .foot { margin-top:22px; display:flex; justify-content:space-between; gap:30px; }
  .sign { flex:1; text-align:center; font-size:10px; color:#374151; }
  .sign .ln { border-top:1px solid #374151; margin-top:34px; padding-top:4px; }
  .legend { margin-top:14px; font-size:8.5px; color:#9ca3af; text-align:center; }
  tbody tr { break-inside: avoid; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tfoot td { border: none; height: 16mm; padding: 0; }
  .page-footer {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    height: 13mm;
    text-align: center;
    border-top: 2px solid var(--forest);
    padding-top: 5px;
    background: #fff;
  }
  .page-footer .site { font-size: 11px; font-weight: bold; color: var(--forest); letter-spacing: .5px; }
  .page-footer .org { font-size: 8px; color: #9ca3af; margin-top: 2px; }
`;

export function buildListaChamadaHtml(course: ChamadaCurso, alunos: ChamadaAluno[]): string {
  const ano = (course.startDate ?? '').split('-')[0] || '2026';
  const periodo = `${formatDateBR(course.startDate)} a ${formatDateBR(course.endDate)}`;

  const metaCells: string[] = [
    `<div><b>Carga horária:</b> ${course.workload}h</div>`,
    `<div><b>Horário:</b> ${esc(course.schedule || '—')}</div>`,
    `<div><b>Período:</b> ${esc(periodo)}</div>`,
    `<div><b>Local:</b> ${esc(course.location || '—')}</div>`,
  ];
  if (course.address) metaCells.push(`<div><b>Endereço:</b> ${esc(course.address)}</div>`);
  metaCells.push(`<div><b>Instrutor(a):</b> ${esc(course.instructor || '_______________________')}</div>`);

  const ordenados = [...alunos].sort((a, b) =>
    (a.fullName ?? '').localeCompare(b.fullName ?? '', 'pt-BR', { sensitivity: 'base' })
  );
  const rows = ordenados
    .map((a, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `<tr><td class="num">${n}</td><td class="nome">${esc(a.fullName ?? '')}</td><td class="cpf">${esc(formatCpf(a.cpf))}</td><td class="ass"></td></tr>`;
    })
    .join('\n');

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Lista de Chamada — ${esc(course.title)}</title>
<style>${STYLE}</style></head>
<body>
  <div class="head">
    <div class="logo">${idasamLogoSvg}</div>
    <div class="org">
      <h1>IDASAM — Instituto de Desenvolvimento Ambiental e Social da Amazônia</h1>
      <p>Capacitação Profissional · Programa ${esc(ano)}</p>
    </div>
    <div class="doc-tag">Cautela<br>de Chamada</div>
  </div>

  <div class="title">
    <h2>Lista de Presença</h2>
    <div class="sub">${esc(course.title)}</div>
  </div>

  <div class="meta">
    ${metaCells.join('\n    ')}
  </div>

  <div class="data-field">Data da aula: <span class="blank"></span>/<span class="blank"></span>/<span class="blank"></span></div>

  <table>
    <thead><tr><th class="num">Nº</th><th>Nome Completo</th><th>CPF</th><th>Assinatura</th></tr></thead>
    <tbody>
${rows}
    </tbody>
    <tfoot><tr><td colspan="4"></td></tr></tfoot>
  </table>

  <div class="foot">
    <div class="sign"><div class="ln">Assinatura do(a) Instrutor(a)</div></div>
    <div class="sign"><div class="ln">Coordenação IDASAM</div></div>
  </div>

  <div class="legend">Documento gerado para controle de frequência · ${ordenados.length} inscritos · Carga horária total de ${course.workload}h · Imprimir uma via por dia de aula.</div>

  <div class="page-footer">
    <div class="site">www.idasam.org</div>
    <div class="org">Instituto de Desenvolvimento Ambiental e Social da Amazônia</div>
  </div>
</body></html>`;
}

/** Renderiza o HTML num iframe oculto e dispara a janela de impressão do navegador. */
export function printHtml(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.srcdoc = html;
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    window.setTimeout(() => iframe.remove(), 1500);
  };
  document.body.appendChild(iframe);
}

export function printListaChamada(course: ChamadaCurso, alunos: ChamadaAluno[]): void {
  printHtml(buildListaChamadaHtml(course, alunos));
}
