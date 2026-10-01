import type { Secim } from "./kirp";

/** PDF metin katmanından bir parça. Konumlar sayfaya oranla 0–1 arasıdır; `y` yazının taban çizgisidir. */
export interface MetinParcasi {
  s: string;
  x: number;
  y: number;
}

const ETIKET = /^([A-E])\)\s*(.*)$/;
// A4 yüksekliğine oranla: aynı satır sayılma payı (~3 pt), şıkka ait sayılan dikey yakınlık (~15 pt),
// seçimin altında şık aranan mesafe.
const SATIR = 0.004;
const YAKIN = 0.018;
const ARAMA = 0.22;

/**
 * Kullanıcı yalnızca soru kökünü kırptığında, seçimin hemen altındaki şıkları PDF metninden okur.
 * `adet` kadar şık etiketi (A), B)…) bulunamazsa null döner. Kesir gibi tek satıra sığmayan
 * şıkların metni güvenilir okunamaz; o şıklar boş bırakılır ve kullanıcı elle yazar.
 */
export function siklariBul(parcalar: MetinParcasi[], secim: Secim, adet: number): string[] | null {
  const sol = secim.x - 0.03;
  const sag = secim.x + secim.w + 0.03;
  const ust = secim.y + secim.h - 0.01;
  const bolge = parcalar.filter((p) => p.x >= sol && p.x <= sag && p.y >= ust && p.y <= ust + ARAMA);

  const etiketler: MetinParcasi[] = [];
  for (let k = 0; k < adet; k++) {
    const harf = String.fromCharCode(65 + k);
    const onceki = etiketler[k - 1];
    const aday = bolge
      .filter((p) => ETIKET.exec(p.s)?.[1] === harf)
      // Okuma sırasında bir öncekinden sonra gelmeli: aynı satırda sağında ya da alt satırda.
      .filter((p) => !onceki || p.y > onceki.y + SATIR || (Math.abs(p.y - onceki.y) <= SATIR && p.x > onceki.x))
      .sort((a, b) => a.y - b.y || a.x - b.x)[0];
    if (!aday) return null;
    etiketler.push(aday);
  }

  return etiketler.map((etiket) => {
    const sagdakiler = etiketler.filter((d) => Math.abs(d.y - etiket.y) <= SATIR && d.x > etiket.x).map((d) => d.x);
    const sinir = sagdakiler.length > 0 ? Math.min(...sagdakiler) : sag;
    const hucre = bolge.filter(
      (p) => !etiketler.includes(p) && p.x > etiket.x && p.x < sinir && Math.abs(p.y - etiket.y) < YAKIN,
    );
    if (hucre.some((p) => Math.abs(p.y - etiket.y) > SATIR)) return "";
    const etikettekiMetin = ETIKET.exec(etiket.s)![2]!;
    return [etikettekiMetin, ...hucre.sort((a, b) => a.x - b.x).map((p) => p.s)].filter(Boolean).join(" ");
  });
}
