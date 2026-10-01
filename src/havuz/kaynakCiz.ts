import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import isciAdresi from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { SAYFA_GENISLIGI } from "../dizgi/olculer";
import type { Kaynak } from "../model/tipler";
import type { MetinParcasi } from "./sikBul";

pdfjs.GlobalWorkerOptions.workerSrc = isciAdresi;

// PDF birimi 1/72 inç, kâğıt düzenimiz 96 dpi. Baskıda keskin çıksın diye bunun 2,5 katında çizilir.
const PT_PX = 96 / 72;
const KESKINLIK = 2.5;

const gorevler = new Map<string, Promise<PDFDocumentLoadingTask>>();

function pdfAc(kaynak: Kaynak): Promise<PDFDocumentProxy> {
  let gorev = gorevler.get(kaynak.id);
  if (!gorev) {
    gorev = kaynak.veri.arrayBuffer().then((veri) => pdfjs.getDocument({ data: veri }));
    gorevler.set(kaynak.id, gorev);
  }
  return gorev.then((g) => g.promise);
}

export function kaynakKapat(id: string): void {
  void gorevler.get(id)?.then((g) => g.destroy());
  gorevler.delete(id);
}

export const pdfMi = (kaynak: Kaynak) => kaynak.mime === "application/pdf";

export interface CizilmisSayfa {
  tuval: HTMLCanvasElement;
  /** Sayfanın kâğıt üstündeki genişliği (96 dpi px). */
  genislik: number;
  sayfaSayisi: number;
  /** PDF'in metin katmanı; taranmış PDF ve görsellerde boştur. */
  metin: MetinParcasi[];
}

/** Kaynağın bir sayfasını yüksek çözünürlükte tuvale çizer. Görsel kaynaklar tek sayfadır. */
export async function sayfaCiz(kaynak: Kaynak, sayfaNo: number): Promise<CizilmisSayfa> {
  const tuval = document.createElement("canvas");

  if (!pdfMi(kaynak)) {
    const resim = await createImageBitmap(kaynak.veri);
    tuval.width = resim.width;
    tuval.height = resim.height;
    const cizim = tuval.getContext("2d")!;
    cizim.fillStyle = "#fff";
    cizim.fillRect(0, 0, tuval.width, tuval.height);
    cizim.drawImage(resim, 0, 0);
    resim.close();
    return { tuval, genislik: Math.min(resim.width, SAYFA_GENISLIGI), sayfaSayisi: 1, metin: [] };
  }

  const belge = await pdfAc(kaynak);
  const sayfa = await belge.getPage(sayfaNo);
  const gorunum = sayfa.getViewport({ scale: PT_PX * KESKINLIK });
  tuval.width = Math.floor(gorunum.width);
  tuval.height = Math.floor(gorunum.height);
  await sayfa.render({ canvas: tuval, viewport: gorunum }).promise;

  const duz = sayfa.getViewport({ scale: 1 });
  const icerik = await sayfa.getTextContent();
  const metin = icerik.items.flatMap((parca): MetinParcasi[] => {
    if (!("str" in parca) || !parca.str.trim()) return [];
    const [x, y] = duz.convertToViewportPoint(parca.transform[4], parca.transform[5]);
    return [{ s: parca.str.trim(), x: x / duz.width, y: y / duz.height }];
  });
  return { tuval, genislik: gorunum.width / KESKINLIK, sayfaSayisi: belge.numPages, metin };
}
