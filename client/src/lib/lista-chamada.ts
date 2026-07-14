// Gera a "Lista de Chamada / Presença" de um curso como um PDF REAL (vetorial, via jsPDF),
// no papel timbrado do IDASAM, com os alunos específicos do curso. Antes isto usava a janela
// de impressão do navegador (window.print de um iframe), o que NÃO funciona no celular — o
// Chrome mobile acabava "fotografando" a tela do app em vez da lista. Agora o documento é
// desenhado diretamente no PDF e baixado, funcionando igual no desktop e no celular.
import idasamLogoSvg from './idasam-logo-chamada-svg';
import type { Course } from '@shared/schema';

export type ChamadaCurso = Pick<
  Course,
  'title' | 'instructor' | 'workload' | 'schedule' | 'startDate' | 'endDate' | 'location' | 'address'
>;
export type ChamadaAluno = { fullName: string | null; cpf: string | null };

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

// Paleta (mesmas cores do modelo HTML anterior).
const FOREST: [number, number, number] = [28, 74, 43]; // #1c4a2b
const SAND: [number, number, number] = [245, 242, 234]; // #f5f2ea
const LINE: [number, number, number] = [216, 216, 207]; // #d8d8cf
const INK: [number, number, number] = [31, 41, 55]; // #1f2937
const GRAY: [number, number, number] = [107, 114, 128]; // #6b7280
const ROW_ALT: [number, number, number] = [250, 250, 247]; // #fafaf7

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

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageW = 210;
  const pageH = 297;
  const marginX = 12;
  const contentW = pageW - marginX * 2; // 186
  const footerY = pageH - 16; // acima do rodapé fixo

  const ano = (course.startDate ?? '').split('-')[0] || String(new Date().getFullYear());
  const periodo = `${formatDateBR(course.startDate)} a ${formatDateBR(course.endDate)}`;

  const ordenados = [...alunos].sort((a, b) =>
    (a.fullName ?? '').localeCompare(b.fullName ?? '', 'pt-BR', { sensitivity: 'base' }),
  );

  // ---- Cabeçalho (timbre) ----
  function drawHeader(): number {
    const top = 14;
    let textX = marginX;
    if (logo) {
      const logoH = 13;
      const logoW = (logoH * 1772) / 1080;
      try {
        pdf.addImage(logo, 'PNG', marginX, top, logoW, logoH);
        textX = marginX + logoW + 5;
      } catch {
        textX = marginX;
      }
    }
    pdf.setTextColor(...FOREST);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('IDASAM', textX, top + 4.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GRAY);
    const nome = 'Instituto de Desenvolvimento Ambiental e Social da Amazônia';
    pdf.text(nome, textX, top + 8.5);
    pdf.text(`Capacitação Profissional · Programa ${ano}`, textX, top + 12);

    // Tag à direita
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GRAY);
    pdf.text('CONTROLE DE FREQUÊNCIA', pageW - marginX, top + 4.5, { align: 'right' });

    const ruleY = top + 16;
    pdf.setDrawColor(...FOREST);
    pdf.setLineWidth(0.8);
    pdf.line(marginX, ruleY, pageW - marginX, ruleY);
    return ruleY;
  }

  // ---- Cabeçalho da tabela (repetido em toda página) ----
  const colNumW = 12;
  const colCpfW = 30;
  const colAssW = 52;
  const colNomeW = contentW - colNumW - colCpfW - colAssW;
  const xNum = marginX;
  const xNome = xNum + colNumW;
  const xCpf = xNome + colNomeW;
  const xAss = xCpf + colCpfW;
  const rowH = 8;

  function drawTableHeader(y: number): number {
    pdf.setFillColor(...FOREST);
    pdf.rect(marginX, y, contentW, rowH, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    const midY = y + rowH / 2;
    pdf.text('Nº', xNum + colNumW / 2, midY, { align: 'center', baseline: 'middle' });
    pdf.text('NOME COMPLETO', xNome + 2, midY, { baseline: 'middle' });
    pdf.text('CPF', xCpf + 2, midY, { baseline: 'middle' });
    pdf.text('ASSINATURA', xAss + 2, midY, { baseline: 'middle' });
    return y + rowH;
  }

  function drawPageFooter() {
    pdf.setDrawColor(...FOREST);
    pdf.setLineWidth(0.6);
    pdf.line(marginX, footerY + 3, pageW - marginX, footerY + 3);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...FOREST);
    pdf.text('www.idasam.org', pageW / 2, footerY + 7.5, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...GRAY);
    pdf.text('Instituto de Desenvolvimento Ambiental e Social da Amazônia', pageW / 2, footerY + 11, {
      align: 'center',
    });
  }

  // ---- Página 1: cabeçalho + título + metadados ----
  let y = drawHeader();

  // Título
  y += 9;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(...FOREST);
  pdf.text('LISTA DE PRESENÇA', pageW / 2, y, { align: 'center' });
  y += 5.5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(...GRAY);
  const subtitle = pdf.splitTextToSize(course.title || '', contentW - 10) as string[];
  for (const ln of subtitle.slice(0, 2)) {
    pdf.text(ln, pageW / 2, y, { align: 'center' });
    y += 4.5;
  }

  // Caixa de metadados
  y += 2;
  const meta: Array<[string, string]> = [
    ['Carga horária:', `${course.workload}h`],
    ['Horário:', course.schedule || '—'],
    ['Período:', periodo],
    ['Local:', course.location || '—'],
  ];
  if (course.address) meta.push(['Endereço:', course.address]);
  meta.push(['Instrutor(a):', course.instructor || '—']);

  const rows2col = Math.ceil(meta.length / 2);
  const metaBoxH = rows2col * 5.5 + 6;
  pdf.setFillColor(...SAND);
  pdf.setDrawColor(...LINE);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(marginX, y, contentW, metaBoxH, 2, 2, 'FD');

  const colX = [marginX + 5, marginX + contentW / 2 + 2];
  const colValMax = contentW / 2 - 7;
  let my = y + 5.5;
  pdf.setFontSize(8.5);
  meta.forEach(([label, value], i) => {
    const c = i % 2;
    if (c === 0 && i > 0) my += 5.5;
    const cx = colX[c];
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...FOREST);
    pdf.text(label, cx, my);
    const labelW = pdf.getTextWidth(label);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...INK);
    const val = (pdf.splitTextToSize(value, colValMax - labelW - 2) as string[])[0] || '';
    pdf.text(val, cx + labelW + 2, my);
  });
  y += metaBoxH + 5;

  // "Data da aula: __/__/__"
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...FOREST);
  pdf.text('Data da aula:  ____ / ____ / ______', pageW - marginX, y, { align: 'right' });
  y += 5;

  // ---- Tabela de alunos ----
  y = drawTableHeader(y);
  pdf.setDrawColor(...LINE);
  pdf.setLineWidth(0.2);

  ordenados.forEach((a, i) => {
    if (y + rowH > footerY) {
      drawPageFooter();
      pdf.addPage();
      y = 16;
      y = drawTableHeader(y);
    }
    // fundo alternado
    if (i % 2 === 1) {
      pdf.setFillColor(...ROW_ALT);
      pdf.rect(marginX, y, contentW, rowH, 'F');
    }
    // bordas das células
    pdf.setDrawColor(...LINE);
    pdf.rect(xNum, y, colNumW, rowH);
    pdf.rect(xNome, y, colNomeW, rowH);
    pdf.rect(xCpf, y, colCpfW, rowH);
    pdf.rect(xAss, y, colAssW, rowH);

    const midY = y + rowH / 2;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...GRAY);
    pdf.text(String(i + 1).padStart(2, '0'), xNum + colNumW / 2, midY, {
      align: 'center',
      baseline: 'middle',
    });
    pdf.setTextColor(...INK);
    const nome = (pdf.splitTextToSize(a.fullName ?? '', colNomeW - 4) as string[])[0] || '';
    pdf.text(nome, xNome + 2, midY, { baseline: 'middle' });
    pdf.text(formatCpf(a.cpf), xCpf + 2, midY, { baseline: 'middle' });
    y += rowH;
  });

  // ---- Assinaturas + legenda ----
  const closingH = 30;
  if (y + closingH > footerY) {
    drawPageFooter();
    pdf.addPage();
    y = 20;
  } else {
    y += 12;
  }
  const half = contentW / 2;
  const sigW = half - 12;
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

  y += 12;
  pdf.setFontSize(7);
  pdf.setTextColor(...GRAY);
  const legenda = `Documento gerado para controle de frequência · ${ordenados.length} inscritos · Carga horária total de ${course.workload}h · Imprimir uma via por dia de aula.`;
  pdf.text(pdf.splitTextToSize(legenda, contentW) as string[], pageW / 2, y, { align: 'center' });

  // Rodapé em todas as páginas + numeração
  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    drawPageFooter();
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...GRAY);
    pdf.text(`Página ${p} de ${total}`, pageW - marginX, footerY + 11, { align: 'right' });
  }

  pdf.save(`Lista de Chamada - ${sanitizeFileName(course.title)}.pdf`);
}
