// Relatórios da Capacitação em PDF no papel timbrado oficial do IDASAM.
// Corpo em HTML com CORES HEX INLINE (html2canvas não lê oklch).
import { generateLetterheadPdf, generateLetterheadPdfBlob } from '@/lib/letterhead-pdf';

export type CapAnalytics = {
  certificadosEmitidos: number;
  alunosFormados: number;
  cursosConcluidos: number;
  totalCursos: number;
  totalMatriculas: number;
  matriculasComEmpresa: number;
  matriculasSemEmpresa: number;
  rankingCursos: { id: string; title: string; enrolledCount: number; certifiedCount: number; status: string; program?: string }[];
  rankingEmpresas: { empresa: string; count: number }[];
  resumoProgramas?: { program: string; cursos: number; matriculas: number; certificados: number; cursosConcluidos: number }[];
};

const PROGRAM_LABEL: Record<string, string> = { proindi: 'PROINDI 4.0', pti: 'PTI' };
const programLabel = (p?: string) => PROGRAM_LABEL[p ?? 'pti'] ?? (p ?? '—');

export type AlunoFicha = {
  fullName: string | null;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  totalInscricoes: number;
  totalConcluidos: number;
  totalCertificados: number;
  cursos: { title: string; status: string; concluido: boolean }[];
  naListaNotificacoes: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Aberto', closed: 'Fechado', coming_soon: 'Em Breve', completed: 'Concluído',
};

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hoje(): string {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── blocos reutilizáveis (hex inline) ──
function introCard(label: string, titulo: string, sub: string): string {
  return `<div style="background:#F0F7F4;border-left:4px solid #2A5B46;padding:18px 22px;margin-bottom:26px;border-radius:0 6px 6px 0;">
    <div style="font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;color:#6B7280;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${esc(label)}</div>
    <div style="font-family:'Georgia',serif;font-size:18px;font-style:italic;font-weight:700;color:#2A5B46;margin-bottom:8px;line-height:1.3;">${esc(titulo)}</div>
    <div style="font-size:11px;color:#374151;">${sub}</div>
  </div>`;
}

function table(headers: string[], rows: string[][]): string {
  const th = headers.map((h) => `<th style="border:1px solid #C8DDD5;padding:7px 10px;text-align:left;background:#2A5B46;color:#fff;font-weight:700;">${esc(h)}</th>`).join('');
  const body = rows.map((row, ri) => {
    const bg = ri % 2 === 0 ? '#F0F7F4' : '#ffffff';
    const tds = row.map((cell) => `<td style="border:1px solid #C8DDD5;padding:7px 10px;text-align:left;background:${bg};color:#374151;">${cell}</td>`).join('');
    return `<tr>${tds}</tr>`;
  }).join('');
  return `<div style="margin:6px 0 22px 0;"><table style="width:100%;border-collapse:collapse;font-size:11px;font-family:'Inter',sans-serif;"><tr>${th}</tr>${body}</table></div>`;
}

// ── Relatório de Analytics ──
export function buildRelatorioAnalyticsHTML(d: CapAnalytics): string {
  const pctEmpresa = d.totalMatriculas > 0 ? Math.round((d.matriculasComEmpresa / d.totalMatriculas) * 100) : 0;
  let h = introCard('Relatório de Indicadores', 'Programa de Capacitação Profissional', `Emitido em ${esc(hoje())}`);

  h += `<h3>Resumo geral</h3>`;
  h += table(['Indicador', 'Valor'], [
    ['Certificados emitidos', `<b>${d.certificadosEmitidos}</b>`],
    ['Alunos formados (pessoas distintas)', `<b>${d.alunosFormados}</b>`],
    ['Cursos concluídos', `<b>${d.cursosConcluidos}</b> de ${d.totalCursos}`],
    ['Total de matrículas', `<b>${d.totalMatriculas}</b>`],
    ['Matrículas vindas de empresa', `<b>${d.matriculasComEmpresa}</b> (${pctEmpresa}%)`],
    ['Matrículas sem indicação de empresa', `<b>${d.matriculasSemEmpresa}</b>`],
  ]);

  if (d.resumoProgramas && d.resumoProgramas.length > 0) {
    h += `<h3>Resumo por programa</h3>`;
    h += table(['Programa', 'Cursos', 'Concluídos', 'Matrículas', 'Certificados'],
      d.resumoProgramas.map((p) => [
        `<b>${esc(programLabel(p.program))}</b>`,
        String(p.cursos),
        String(p.cursosConcluidos),
        `<b>${p.matriculas}</b>`,
        `<b>${p.certificados}</b>`,
      ]));
  }

  h += `<h3>Ranking de cursos por matrículas</h3>`;
  h += table(['#', 'Curso', 'Programa', 'Matrículas', 'Certificados', 'Status'],
    d.rankingCursos.map((c, i) => [String(i + 1), esc(c.title), `<b>${esc(programLabel(c.program))}</b>`, String(c.enrolledCount), String(c.certifiedCount), esc(STATUS_LABEL[c.status] ?? c.status)]));

  h += `<h3>Empresas de origem dos alunos</h3>`;
  if (d.rankingEmpresas.length === 0) {
    h += `<p style="font-size:11px;color:#6B7280;">Nenhum aluno indicou empresa até o momento.</p>`;
  } else {
    h += table(['#', 'Empresa', 'Nº de alunos'],
      d.rankingEmpresas.map((e, i) => [String(i + 1), esc(e.empresa), String(e.count)]));
  }
  return h;
}

export async function baixarRelatorioAnalytics(d: CapAnalytics): Promise<void> {
  await generateLetterheadPdf(buildRelatorioAnalyticsHTML(d), 'Relatório de Capacitação', 'Relatorio_Capacitacao_IDASAM.pdf');
}

// ── Ficha do aluno ──
export function buildFichaAlunoHTML(a: AlunoFicha): string {
  const nome = a.fullName || 'Aluno';
  const veioEmpresa = !!(a.company && a.company.trim());
  let h = introCard('Ficha do Aluno', nome, `CPF: ${esc(a.cpf || '—')} &bull; Emitida em ${esc(hoje())}`);

  h += `<h3>Identificação</h3>`;
  h += table(['Campo', 'Informação'], [
    ['Nome completo', esc(a.fullName || '—')],
    ['CPF', esc(a.cpf || '—')],
    ['Telefone', esc(a.phone || '—')],
    ['E-mail', esc(a.email || '—')],
    ['Veio de empresa?', veioEmpresa ? `<b style="color:#2A5B46;">Sim</b>` : 'Não'],
    ['Empresa de origem', veioEmpresa ? esc(a.company) : '—'],
  ]);

  h += `<h3>Situação na Capacitação</h3>`;
  h += table(['Indicador', 'Valor'], [
    ['Cursos em que está inscrito', `<b>${a.totalInscricoes}</b>`],
    ['Cursos concluídos', `<b>${a.totalConcluidos}</b>`],
    ['Certificados emitidos', `<b>${a.totalCertificados}</b>`],
    ['Consta na lista de Notificações', a.naListaNotificacoes ? `<b style="color:#2A5B46;">Sim</b>` : 'Não'],
  ]);

  h += `<h3>Cursos do aluno</h3>`;
  if (a.cursos.length === 0) {
    h += `<p style="font-size:11px;color:#6B7280;">Nenhuma inscrição encontrada.</p>`;
  } else {
    h += table(['Curso', 'Status do curso', 'Concluído pelo aluno'],
      a.cursos.map((c) => [
        esc(c.title),
        esc(STATUS_LABEL[c.status] ?? c.status),
        c.concluido ? `<b style="color:#2A5B46;">Sim</b>` : 'Não',
      ]));
  }
  return h;
}

/** Nome de arquivo padrão da ficha (sem extensão). */
export function nomeArquivoFicha(a: Pick<AlunoFicha, 'fullName'>): string {
  return `Ficha_${(a.fullName || 'aluno').replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export async function baixarFichaAluno(a: AlunoFicha): Promise<void> {
  await generateLetterheadPdf(buildFichaAlunoHTML(a), 'Ficha do Aluno', `${nomeArquivoFicha(a)}.pdf`);
}

/**
 * Gera a ficha do aluno e devolve o **Blob** (sem baixar) — pra empacotar várias num ZIP.
 * ⚠️ Chamar sequencialmente (ver `generateLetterheadPdfBlob`).
 */
export async function gerarFichaAlunoBlob(a: AlunoFicha): Promise<Blob> {
  return await generateLetterheadPdfBlob(buildFichaAlunoHTML(a), 'Ficha do Aluno');
}
