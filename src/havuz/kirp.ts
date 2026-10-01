/** Sayfa üstünde 0–1 arası oranlarla verilen dikdörtgen. */
export interface Secim {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Sinir {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

// Kâğıt beyazı tam 255 değildir (tarama, JPEG); bu eşiğin üstü boş sayılır.
const BEYAZ_ESIGI = 238;
const KENAR_PAYI = 6;

/**
 * RGBA piksel verisinde beyaz olmayan içeriğin sınırlarını bulur (x1, y1 dahil değil).
 * Seçim kabaca çizilse bile sorunun etrafındaki boşluk böylece atılır. Tamamen boşsa null.
 */
export function icerikSiniri(veri: Uint8ClampedArray, genislik: number, yukseklik: number): Sinir | null {
  let x0 = genislik;
  let y0 = yukseklik;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < yukseklik; y++) {
    for (let x = 0; x < genislik; x++) {
      const i = (y * genislik + x) * 4;
      const dolu =
        veri[i + 3]! > 16 && (veri[i]! < BEYAZ_ESIGI || veri[i + 1]! < BEYAZ_ESIGI || veri[i + 2]! < BEYAZ_ESIGI);
      if (!dolu) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;
  return { x0, y0, x1: x1 + 1, y1: y1 + 1 };
}

export interface Kirpinti {
  gorsel: Blob;
  genislik: number;
  yukseklik: number;
}

/**
 * Sayfa tuvalinden seçimi keser, etrafındaki boşluğu atar ve PNG olarak döndürür.
 * `sayfaGenisligi`: sayfanın kâğıt üstündeki genişliği (96 dpi px); kırpıntının doğal boyutu buna göre hesaplanır.
 */
export async function kirp(tuval: HTMLCanvasElement, secim: Secim, sayfaGenisligi: number): Promise<Kirpinti | null> {
  const sx = Math.max(0, Math.round(secim.x * tuval.width));
  const sy = Math.max(0, Math.round(secim.y * tuval.height));
  const sw = Math.min(tuval.width - sx, Math.round(secim.w * tuval.width));
  const sh = Math.min(tuval.height - sy, Math.round(secim.h * tuval.height));
  if (sw < 4 || sh < 4) return null;

  const piksel = tuval.getContext("2d")!.getImageData(sx, sy, sw, sh);
  const sinir = icerikSiniri(piksel.data, sw, sh);
  if (!sinir) return null;

  const x0 = Math.max(0, sinir.x0 - KENAR_PAYI);
  const y0 = Math.max(0, sinir.y0 - KENAR_PAYI);
  const w = Math.min(sw, sinir.x1 + KENAR_PAYI) - x0;
  const h = Math.min(sh, sinir.y1 + KENAR_PAYI) - y0;

  const cikti = document.createElement("canvas");
  cikti.width = w;
  cikti.height = h;
  cikti.getContext("2d")!.putImageData(piksel, -x0, -y0, x0, y0, w, h);
  const gorsel = await new Promise<Blob | null>((coz) => cikti.toBlob(coz, "image/png"));
  if (!gorsel) return null;

  const oran = sayfaGenisligi / tuval.width;
  return { gorsel, genislik: w * oran, yukseklik: h * oran };
}
