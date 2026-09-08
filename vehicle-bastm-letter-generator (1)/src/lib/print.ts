/**
 * Cetak dokumen: document.title diganti sementara agar nama file PDF yang
 * diusulkan browser mengikuti nama dokumen, lalu dipulihkan setelah cetak.
 */
export function printWithFileName(fileName: string): void {
  const previousTitle = document.title;
  document.title = fileName;
  const restore = () => {
    document.title = previousTitle;
  };
  window.addEventListener("afterprint", restore, { once: true });
  window.setTimeout(restore, 2000);
  window.print();
}
