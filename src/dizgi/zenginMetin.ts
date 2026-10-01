import katex from "katex";

const kacir = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Düz metni güvenli HTML'e çevirir: $...$ arası KaTeX, **...** arası kalın. */
export function zenginMetin(metin: string): string {
  return metin
    .split(/\$([^$]+)\$/)
    .map((parca, i) =>
      i % 2 === 1
        ? katex.renderToString(parca, { throwOnError: false })
        : kacir(parca).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"),
    )
    .join("");
}

/** Formül işaretleri atılmış yaklaşık görünür uzunluk; şık düzenini seçmek için. */
export function gorunurUzunluk(metin: string): number {
  return metin.replace(/\\[a-zA-Z]+|[${}]/g, "").length;
}
