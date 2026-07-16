// Motor de PDF no PAPEL TIMBRADO OFICIAL do IDASAM, reaproveitado do Suite Documental
// (Gerador de Documentos). Gera um PDF A4 com o cabeçalho/rodapé oficiais a partir de um
// corpo em HTML (use SEMPRE cores hex inline — o html2canvas 1.4.1 não lê `oklch`).
//
// As funções abaixo são cópias fiéis das de client/src/components/suite-documental/
// SuiteDocumental.tsx (createA4Page, autoPaginate, splitTableAcrossPages, sdSanitizeClone,
// buildWhiteLogoDataUrl) — mantidas aqui para não tocar naquele arquivo crítico
// (documentos legais/assinaturas). Importa o suite.css (estilos sd-* obrigatórios).
import '@/components/suite-documental/suite.css';

const LOGO = '/logo-idasam.svg';

async function buildWhiteLogoDataUrl(): Promise<string> {
  const res = await fetch(LOGO, { mode: 'cors' });
  const text = await res.text();
  const blob = new Blob([text], { type: 'image/svg+xml' });
  const blobUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = img.naturalWidth || 600;
      const H = img.naturalHeight || 200;
      const cvs = document.createElement('canvas');
      cvs.width = W;
      cvs.height = H;
      const ctx = cvs.getContext('2d')!;
      ctx.filter = 'brightness(0) invert(1)';
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(blobUrl);
      resolve(cvs.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error('logo load failed')); };
    img.src = blobUrl;
  });
}

// Blindagem html2canvas: reforça min-width/height nos gradientes decorativos (evita
// "canvas with width or height of 0").
function sdSanitizeClone(clonedDoc: Document) {
  const sel = '.sd-topo-stripe, .sd-stripe, .sd-sig-line, .sd-orc-sig-line, .sd-sig-grad-line';
  clonedDoc.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    el.style.minWidth = '1px';
    el.style.minHeight = '1px';
  });
}

function createA4Page(docType: string): HTMLElement {
  const page = document.createElement('div');
  page.className = 'sd-page-a4';
  page.innerHTML = `
    <div class="sd-topo-stripe"></div>
    <div class="sd-header">
      <img src="${LOGO}" class="sd-logo-img" alt="IDASAM" crossorigin="anonymous">
      <div class="sd-header-right">
        <div class="sd-doc-type">${docType}</div>
        <div class="sd-info">CENTRO EMPRESARIAL ART CENTER, 3694 — MANAUS/AM<br>WWW.IDASAM.ORG.BR &bull; CNPJ: 02.906.177/0001-87</div>
      </div>
    </div>
    <div class="sd-stripe"></div>
    <div class="sd-body">
      <div class="sd-watermark"><img src="${LOGO}" alt="" crossorigin="anonymous"></div>
      <div class="sd-corner-detail-2"></div>
      <div class="sd-corner-detail"></div>
      <div class="sd-content"></div>
    </div>
    <div class="sd-footer">
      <div class="sd-footer-left">
        <span class="sd-footer-brand">Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM</span>
        <span class="sd-footer-info">www.idasam.org.br &bull; CNPJ: 02.906.177/0001-87 &bull; Centro Empresarial Art Center, 3694 — Manaus/AM</span>
      </div>
      <div class="sd-footer-right"><span class="sd-page-num"></span></div>
    </div>
  `;
  return page;
}

async function splitTableAcrossPages(
  originalWrapper: HTMLElement,
  originalTable: HTMLTableElement,
  initialBox: HTMLElement,
  LIMIT: number,
  makeNewPage: () => HTMLElement,
): Promise<HTMLElement> {
  const raf2 = async () => {
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
  };
  const allRows = Array.from(originalTable.querySelectorAll('tr'));
  if (allRows.length === 0) {
    initialBox.appendChild(originalWrapper);
    return initialBox;
  }
  const firstHasTh = allRows[0].querySelector('th') !== null;
  const headerRow = firstHasTh ? allRows[0] : null;
  const dataRows = firstHasTh ? allRows.slice(1) : allRows;

  const buildWrapperSkeleton = (): { wrapper: HTMLElement; tbody: HTMLElement } => {
    const wrapper = originalWrapper.cloneNode(false) as HTMLElement;
    const table = originalTable.cloneNode(false) as HTMLTableElement;
    if (headerRow) table.appendChild(headerRow.cloneNode(true));
    const originalTbody = originalTable.querySelector('tbody');
    let tbody: HTMLElement;
    if (originalTbody) {
      const tb = originalTbody.cloneNode(false) as HTMLElement;
      table.appendChild(tb);
      tbody = tb;
    } else {
      tbody = table;
    }
    const chain: HTMLElement[] = [];
    let cur: HTMLElement | null = originalTable.parentElement;
    while (cur && cur !== originalWrapper) {
      chain.unshift(cur);
      cur = cur.parentElement;
    }
    let attachPoint: HTMLElement = wrapper;
    for (const anc of chain) {
      const c = anc.cloneNode(false) as HTMLElement;
      attachPoint.appendChild(c);
      attachPoint = c;
    }
    attachPoint.appendChild(table);
    return { wrapper, tbody };
  };

  let { wrapper, tbody } = buildWrapperSkeleton();
  let contentBox = initialBox;
  contentBox.appendChild(wrapper);
  await raf2();

  for (const row of dataRows) {
    const rowClone = row.cloneNode(true) as HTMLElement;
    tbody.appendChild(rowClone);
    await raf2();
    if (contentBox.scrollHeight > LIMIT) {
      tbody.removeChild(rowClone);
      if (tbody.querySelector('tr:not(:has(th))') === null && !headerRow) {
        tbody.appendChild(rowClone);
        continue;
      }
      contentBox = makeNewPage();
      const skel = buildWrapperSkeleton();
      wrapper = skel.wrapper;
      tbody = skel.tbody;
      contentBox.appendChild(wrapper);
      tbody.appendChild(rowClone);
      await raf2();
    }
  }
  return contentBox;
}

async function autoPaginate(source: HTMLElement, container: HTMLElement, docType: string) {
  await document.fonts.ready;
  container.innerHTML = '';
  const offscreen = document.createElement('div');
  offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;visibility:hidden;pointer-events:none;z-index:-1;';
  document.body.appendChild(offscreen);

  const newPage = () => {
    const p = createA4Page(docType);
    offscreen.appendChild(p);
    return p.querySelector('.sd-content') as HTMLElement;
  };

  let contentBox = newPage();
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));

  const bodyEl = contentBox.closest('.sd-body') as HTMLElement;
  const bodyStyle = window.getComputedStyle(bodyEl);
  const LIMIT = bodyEl.clientHeight - parseFloat(bodyStyle.paddingTop) - parseFloat(bodyStyle.paddingBottom);
  let pageCount = 1;

  const raf2 = async () => {
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
  };

  for (const el of Array.from(source.children)) {
    const clone = el.cloneNode(true) as HTMLElement;
    contentBox.appendChild(clone);
    await raf2();
    if (contentBox.scrollHeight > LIMIT) {
      contentBox.removeChild(clone);
      pageCount++;
      contentBox = newPage();
      contentBox.appendChild(clone);
      await raf2();
      if (contentBox.scrollHeight > LIMIT) {
        const table = clone.querySelector('table') as HTMLTableElement | null;
        if (table) {
          contentBox.removeChild(clone);
          const result = await splitTableAcrossPages(clone, table, contentBox, LIMIT, () => {
            pageCount++;
            contentBox = newPage();
            return contentBox;
          });
          contentBox = result;
        }
      }
    }
  }

  offscreen.querySelectorAll('.sd-page-num').forEach((el, i) => {
    el.textContent = `Página ${i + 1} de ${pageCount} • IDASAM — Documento Oficial`;
  });
  while (offscreen.firstChild) container.appendChild(offscreen.firstChild);
  document.body.removeChild(offscreen);
}

async function capturePagesToBlob(container: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const W = 794, H = 1123;
  const pdf = new jsPDF({ unit: 'px', format: [W, H], orientation: 'portrait' });
  const pages = container.querySelectorAll('.sd-page-a4');

  const whiteLogoUrl = await buildWhiteLogoDataUrl();
  const allLogos = Array.from(container.querySelectorAll('.sd-logo-img')) as HTMLImageElement[];
  allLogos.forEach((img) => { img.src = whiteLogoUrl; img.style.filter = 'none'; });
  await Promise.all(allLogos.map((img) => (img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = () => r(); }))));
  await new Promise((r) => requestAnimationFrame(r));

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i] as HTMLElement, {
      scale: 2, useCORS: true, logging: false, width: W, height: H, windowWidth: W,
      onclone: sdSanitizeClone,
    });
    if (i > 0) pdf.addPage([W, H], 'portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, W, H);
  }
  return pdf.output('blob');
}

/**
 * Gera o PDF no papel timbrado oficial e devolve o **Blob** (sem baixar).
 * Útil pra empacotar vários PDFs (ex.: fichas de todos os alunos num ZIP).
 *
 * ⚠️ Chame de forma **sequencial** (nunca em `Promise.all`): esta função monta um
 * container offscreen no `document.body` e alterna a classe global `sd-exporting`
 * — duas execuções concorrentes disputariam esse estado.
 *
 * @param bodyHtml HTML do corpo (filhos de bloco; use cores hex inline).
 * @param docType  rótulo no topo direito do cabeçalho (ex.: "Ficha do Aluno").
 */
export async function generateLetterheadPdfBlob(bodyHtml: string, docType: string): Promise<Blob> {
  const source = document.createElement('div');
  source.innerHTML = bodyHtml;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;z-index:-1;background:#fff;';
  document.body.appendChild(container);

  document.body.classList.add('sd-exporting');
  try {
    await autoPaginate(source, container, docType);
    return await capturePagesToBlob(container);
  } finally {
    document.body.classList.remove('sd-exporting');
    container.remove();
  }
}

/**
 * Gera e baixa um PDF no papel timbrado oficial do IDASAM.
 * @param bodyHtml HTML do corpo (filhos de bloco; use cores hex inline).
 * @param docType  rótulo no topo direito do cabeçalho (ex.: "Relatório de Capacitação").
 * @param filename nome do arquivo baixado.
 */
export async function generateLetterheadPdf(bodyHtml: string, docType: string, filename: string): Promise<void> {
  const blob = await generateLetterheadPdfBlob(bodyHtml, docType);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
