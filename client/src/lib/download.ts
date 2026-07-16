/**
 * Baixa um Blob com o nome de arquivo correto.
 *
 * POR QUE ISTO EXISTE (não use `saveAs` do file-saver nem `pdf.save()` do jsPDF):
 * as duas bibliotecas criam o `<a download>` mas **não anexam ao documento** antes de
 * disparar o clique. Nessa condição o Chrome pode ignorar o atributo `download` e salvar
 * o arquivo com o **UUID do blob, sem extensão** (ex.: "dab58a32-3ef5-45cd-…"), que foi
 * exatamente o que aconteceu no painel. Anexar o link (mesmo oculto) antes de clicar é o
 * padrão confiável — e o Firefox exige isso para o clique sequer funcionar.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoga depois do clique para não invalidar o download em andamento.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
