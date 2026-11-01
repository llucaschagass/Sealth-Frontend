/** Caminho da bula em PDF: minúsculo, sem acentos e com hífen no lugar de espaços. */
export function medicinePdfUrl(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
  return `/assets/pdf/${slug}.pdf`;
}
