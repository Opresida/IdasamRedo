// Gera o "Diário de Classe — Controle de Frequência" de um curso como um PDF REAL
// (vetorial, via jsPDF), em PAISAGEM (horizontal), no papel timbrado oficial do IDASAM.
// O documento é desenhado direto no PDF e baixado — funciona igual no desktop e no celular
// (o window.print de iframe não funcionava no Chrome mobile).
//
// Layout espelha o modelo "Diário de Classe": logo IDASAM + cabeçalho institucional (com o
// parceiro do curso), faixa com os dados do curso, tabela com UMA COLUNA POR DIA de aula do
// período (dd/mm + dia da semana) + TOTAL FALTAS, legenda P/F, assinaturas e o rodapé oficial.
import idasamLogoSvg from './idasam-logo-chamada-svg';
import { downloadBlob } from '@/lib/download';
import type { Course } from '@shared/schema';

export type ChamadaCurso = Pick<
  Course,
  'title' | 'instructor' | 'workload' | 'schedule' | 'startDate' | 'endDate' | 'location' | 'address'
>;
export type ChamadaAluno = { fullName: string | null; cpf: string | null; company?: string | null };

// Textos institucionais fixos (do programa / papel timbrado).
const EMAIL = 'institucional-am@idasam.org';
const PARCEIRO_INSTITUCIONAL = 'ITEAM — Instituto Tecnológico Educacional da Amazônia';
const TAGLINE = 'Inovação. Sustentabilidade. Futuro.';

const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function parseYMD(s?: string | null): Date | null {
  const parts = (s ?? '').split('-').map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
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

// Paleta.
const FOREST: [number, number, number] = [28, 74, 43]; // #1c4a2b
const BAND: [number, number, number] = [237, 244, 239]; // faixa verde-clarinho
const LINE: [number, number, number] = [200, 221, 213]; // bordas da grade
const INK: [number, number, number] = [31, 41, 55]; // #1f2937
const GRAY: [number, number, number] = [107, 114, 128]; // #6b7280
const ROW_ALT: [number, number, number] = [240, 247, 244]; // zebra

/** Garante width/height no <svg> raiz (alguns navegadores mobile dão naturalWidth 0 sem isso). */
function ensureSvgSize(svg: string, w: number, h: number): string {
  if (/<svg[^>]*\swidth=/.test(svg)) return svg;
  return svg.replace(/<svg\b/, `<svg width="${w}" height="${h}"`);
}

/** Rasteriza o SVG do logo para um PNG data URL, para embutir no jsPDF. Devolve null se falhar. */
async function logoToPngDataUrl(): Promise<string | null> {
  try {
    const svg = ensureSvgSize(idasamLogoSvg, 1772, 1080);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cw = 886; // metade do viewBox, resolução boa e leve
        const ch = Math.round((cw * 1080) / 1772);
        const cvs = document.createElement('canvas');
        cvs.width = cw;
        cvs.height = ch;
        const ctx = cvs.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        try {
          resolve(cvs.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

function sanitizeFileName(s: string): string {
  return (s || 'curso').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export async function printListaChamada(course: ChamadaCurso, alunos: ChamadaAluno[]): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const logo = await logoToPngDataUrl();

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const pageW = 297;
  const pageH = 210;
  const marginX = 10;
  const contentW = pageW - marginX * 2; // 277
  const footerY = pageH - 13; // 197 — régua do rodapé
  const tableBottom = footerY - 6; // limite inferior das linhas

  const ano = (course.startDate ?? '').split('-')[0] || String(new Date().getFullYear());
  const periodo = `${formatDateBR(course.startDate)} a ${formatDateBR(course.endDate)}`;

  // Modalidade sai do texto do local: "Manaus – AM (Presencial)" → "Presencial".
  const modMatch = (course.location ?? '').match(/\(([^)]+)\)/);
  const modalidade = modMatch ? modMatch[1].trim() : 'Presencial';

  // Parceiro = empresa predominante entre os inscritos (campo "Empresa" da inscrição).
  // Ignora "IDASAM" (o próprio instituto não é parceiro externo — evita "IDASAM e IDASAM").
  const companyCounts = new Map<string, number>();
  for (const a of alunos) {
    const c = (a.company ?? '').trim();
    if (c && !/idasam/i.test(c)) companyCounts.set(c, (companyCounts.get(c) ?? 0) + 1);
  }
  let partnerFull: string | null = null;
  let bestCount = 0;
  for (const [c, n] of Array.from(companyCounts.entries())) {
    if (n > bestCount) {
      bestCount = n;
      partnerFull = c;
    }
  }
  const partnerUpper = partnerFull ? partnerFull.toUpperCase() : '';

  // Dias de aula: um por dia do período (inclusive). Guard de 60 dias.
  const start = parseYMD(course.startDate);
  const end = parseYMD(course.endDate);
  const days: (Date | null)[] = [];
  if (start && end && end.getTime() >= start.getTime()) {
    const cur = new Date(start);
    let guard = 0;
    while (cur.getTime() <= end.getTime() && guard < 60) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
      guard++;
    }
  }
  if (days.length === 0) days.push(null); // fallback: uma coluna genérica "Data"

  const ordenados = [...alunos].sort((a, b) =>
    (a.fullName ?? '').localeCompare(b.fullName ?? '', 'pt-BR', { sensitivity: 'base' }),
  );

  // ---- Colunas da tabela (larguras) ----
  const colNumW = 10;
  const colCpfW = 32;
  const colTotalW = 20;
  const availNomeDays = contentW - colNumW - colCpfW - colTotalW; // p/ NOME + dias
  const nomeMin = 60;
  const dayColW = Math.min(15, Math.max(9, (availNomeDays - nomeMin) / days.length));
  const colNomeW = availNomeDays - dayColW * days.length;
  const xNum = marginX;
  const xNome = xNum + colNumW;
  const xCpf = xNome + colNomeW;
  const xDay0 = xCpf + colCpfW;
  const xTotal = xDay0 + dayColW * days.length;
  const headerH = 10;
  const rowH = 6.2;

  // ---- Rodapé oficial (papel timbrado), em toda página ----
  function drawPageFooter() {
    pdf.setDrawColor(...FOREST);
    pdf.setLineWidth(0.5);
    pdf.line(marginX, footerY, pageW - marginX, footerY);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...FOREST);
    pdf.text('Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM', pageW / 2, footerY + 3.6, {
      align: 'center',
    });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...GRAY);
    pdf.text(
      'www.idasam.org.br · CNPJ: 02.906.177/0001-87 · Centro Empresarial Art Center, 3694 — Manaus/AM',
      pageW / 2,
      footerY + 7,
      { align: 'center' },
    );
  }

  // ---- Cabeçalho da tabela (repetido em toda página) ----
  function drawTableHeader(y: number): number {
    pdf.setFillColor(...FOREST);
    pdf.rect(marginX, y, contentW, headerH, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    const midY = y + headerH / 2;

    pdf.setFontSize(8);
    pdf.text('Nº', xNum + colNumW / 2, midY, { align: 'center', baseline: 'middle' });
    pdf.text('NOME COMPLETO', xNome + 3, midY, { baseline: 'middle' });
    pdf.text('CPF', xCpf + colCpfW / 2, midY, { align: 'center', baseline: 'middle' });

    pdf.setFontSize(6.8);
    days.forEach((d, i) => {
      const cx = xDay0 + i * dayColW + dayColW / 2;
      const top = d
        ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
        : 'Data';
      const bot = d ? WD[d.getDay()] : '';
      pdf.text(top, cx, midY - 1.4, { align: 'center', baseline: 'middle' });
      if (bot) pdf.text(bot, cx, midY + 2.4, { align: 'center', baseline: 'middle' });
    });
    pdf.text('TOTAL', xTotal + colTotalW / 2, midY - 1.4, { align: 'center', baseline: 'middle' });
    pdf.text('FALTAS', xTotal + colTotalW / 2, midY + 2.4, { align: 'center', baseline: 'middle' });

    // separadores brancos sutis entre colunas
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.2);
    const seps = [xNome, xCpf, xDay0];
    for (let k = 0; k <= days.length; k++) seps.push(xDay0 + k * dayColW);
    seps.push(xTotal);
    seps.forEach((sx) => pdf.line(sx, y + 1, sx, y + headerH - 1));
    return y + headerH;
  }

  function drawRow(a: ChamadaAluno, i: number, y: number) {
    if (i % 2 === 1) {
      pdf.setFillColor(...ROW_ALT);
      pdf.rect(marginX, y, contentW, rowH, 'F');
    }
    pdf.setDrawColor(...LINE);
    pdf.setLineWidth(0.2);
    pdf.rect(xNum, y, colNumW, rowH);
    pdf.rect(xNome, y, colNomeW, rowH);
    pdf.rect(xCpf, y, colCpfW, rowH);
    for (let k = 0; k < days.length; k++) pdf.rect(xDay0 + k * dayColW, y, dayColW, rowH);
    pdf.rect(xTotal, y, colTotalW, rowH);

    const midY = y + rowH / 2;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...GRAY);
    pdf.text(String(i + 1).padStart(2, '0'), xNum + colNumW / 2, midY, { align: 'center', baseline: 'middle' });
    pdf.setTextColor(...INK);
    const nome = (pdf.splitTextToSize(a.fullName ?? '', colNomeW - 4) as string[])[0] || '';
    pdf.text(nome, xNome + 2.5, midY, { baseline: 'middle' });
    pdf.setFontSize(8);
    pdf.text(formatCpf(a.cpf), xCpf + colCpfW / 2, midY, { align: 'center', baseline: 'middle' });
  }

  // ---- Cabeçalho institucional (só página 1) ----
  function drawInstitutionalHeader(): number {
    let yy = 8;
    if (logo) {
      const logoH = 12;
      const logoW = (logoH * 1772) / 1080;
      try {
        pdf.addImage(logo, 'PNG', (pageW - logoW) / 2, yy, logoW, logoH);
        yy += logoH + 3.5;
      } catch {
        yy += 4;
      }
    } else {
      yy += 4;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(...FOREST);
    pdf.text('IDASAM — INSTITUTO DE DESENVOLVIMENTO AMBIENTAL E SOCIAL DA AMAZÔNIA', pageW / 2, yy, {
      align: 'center',
    });
    yy += 4.2;
    if (partnerFull) {
      pdf.setFontSize(8);
      pdf.setTextColor(...INK);
      pdf.text(`em parceria com ${partnerUpper}`, pageW / 2, yy, { align: 'center' });
      yy += 4;
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GRAY);
    pdf.text(`Capacitação Profissional · Programa ${ano} · Parceiro Institucional: ${PARCEIRO_INSTITUCIONAL}`, pageW / 2, yy, {
      align: 'center',
    });
    yy += 6.5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(...FOREST);
    pdf.text('DIÁRIO DE CLASSE — CONTROLE DE FREQUÊNCIA', pageW / 2, yy, { align: 'center' });
    yy += 5.5;
    pdf.setFontSize(10);
    const sub = pdf.splitTextToSize(
      `Curso IDASAM${partnerFull ? ` e ${partnerFull}` : ''} — ${course.title || ''}`,
      contentW - 20,
    ) as string[];
    sub.slice(0, 2).forEach((ln) => {
      pdf.text(ln, pageW / 2, yy, { align: 'center' });
      yy += 4.6;
    });
    return yy + 1;
  }

  // ---- Faixa de informações do curso ----
  function cellKV(x: number, w: number, label: string, value: string, baseline: number) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.3);
    pdf.setTextColor(...FOREST);
    pdf.text(label, x + 2, baseline);
    const lw = pdf.getTextWidth(label);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...INK);
    const val = (pdf.splitTextToSize(value, Math.max(4, w - lw - 4)) as string[])[0] || '';
    pdf.text(val, x + 2 + lw + 1.5, baseline);
  }

  function drawInfoBand(y: number): number {
    const h = 7;
    // Linha 1
    pdf.setFillColor(...BAND);
    pdf.setDrawColor(...LINE);
    pdf.setLineWidth(0.3);
    pdf.rect(marginX, y, contentW, h, 'FD');
    const w1 = [0.2, 0.16, 0.16, 0.16, 0.32].map((f) => f * contentW);
    const r1: Array<[string, string]> = [
      ['Período:', periodo],
      ['Horário:', course.schedule || '—'],
      ['Carga horária:', `${course.workload}h`],
      ['Modalidade:', modalidade],
      ['Instrutor(a):', course.instructor || '—'],
    ];
    let cx = marginX;
    r1.forEach(([l, v], idx) => {
      if (idx > 0) {
        pdf.setDrawColor(...LINE);
        pdf.line(cx, y, cx, y + h);
      }
      cellKV(cx, w1[idx], l, v, y + h / 2 + 1.2);
      cx += w1[idx];
    });
    // Linha 2
    const y2 = y + h;
    pdf.setFillColor(...BAND);
    pdf.rect(marginX, y2, contentW, h, 'FD');
    const w2 = [0.72, 0.28].map((f) => f * contentW);
    const r2: Array<[string, string]> = [
      ['Endereço:', course.address || course.location || '—'],
      ['E-mail:', EMAIL],
    ];
    cx = marginX;
    r2.forEach(([l, v], idx) => {
      if (idx > 0) {
        pdf.setDrawColor(...LINE);
        pdf.line(cx, y2, cx, y2 + h);
      }
      cellKV(cx, w2[idx], l, v, y2 + h / 2 + 1.2);
      cx += w2[idx];
    });
    return y2 + h;
  }

  // ================= Render =================
  let y = drawInstitutionalHeader();
  y = drawInfoBand(y + 1);
  y += 3;
  y = drawTableHeader(y);

  ordenados.forEach((a, i) => {
    if (y + rowH > tableBottom) {
      drawPageFooter();
      pdf.addPage();
      y = 14;
      y = drawTableHeader(y);
    }
    drawRow(a, i, y);
    y += rowH;
  });

  // ---- Legenda + assinaturas + fecho ----
  const closingH = 30;
  if (y + closingH > tableBottom) {
    drawPageFooter();
    pdf.addPage();
    y = 16;
  } else {
    y += 6;
  }
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...INK);
  pdf.text(
    'Legenda: P = Presente · F = Falta · Marcar a frequência de cada aluno na coluna correspondente ao dia da aula.',
    marginX,
    y,
  );
  y += 11;

  const half = contentW / 2;
  const sigW = half - 30;
  const sig1X = marginX + (half - sigW) / 2;
  const sig2X = marginX + half + (half - sigW) / 2;
  pdf.setDrawColor(...INK);
  pdf.setLineWidth(0.3);
  pdf.line(sig1X, y, sig1X + sigW, y);
  pdf.line(sig2X, y, sig2X + sigW, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...INK);
  pdf.text('Assinatura do(a) Instrutor(a)', sig1X + sigW / 2, y + 4, { align: 'center' });
  pdf.text('Coordenação IDASAM', sig2X + sigW / 2, y + 4, { align: 'center' });

  y += 11;
  pdf.setFontSize(7);
  pdf.setTextColor(...GRAY);
  pdf.text(
    `Diário de classe para controle de frequência · ${ordenados.length} inscritos · Carga horária total: ${course.workload}h`,
    pageW / 2,
    y,
    { align: 'center' },
  );
  y += 3.5;
  pdf.text(
    `Realização: IDASAM${partnerFull ? ` e ${partnerFull}` : ''} · Parceiro Institucional: ITEAM · ${TAGLINE}`,
    pageW / 2,
    y,
    { align: 'center' },
  );

  // Rodapé + numeração em todas as páginas.
  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    drawPageFooter();
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...GRAY);
    pdf.text(`Página ${p} de ${total}`, pageW - marginX, footerY + 3.6, { align: 'right' });
  }

  // Não usar pdf.save(): o jsPDF dispara o clique num link solto e o Chrome pode
  // descartar o nome, salvando com o UUID do blob. downloadBlob anexa o link antes.
  downloadBlob(pdf.output('blob'), `Diário de Classe - ${sanitizeFileName(course.title)}.pdf`);
}
