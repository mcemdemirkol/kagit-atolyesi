import { describe, expect, it } from "vitest";
import { altaYerlestir, sayfala, type Oge, type SayfalaSecenek } from "./sayfala";

const secenek = (ek: Partial<SayfalaSecenek> = {}): SayfalaSecenek => ({
  sutunSayisi: 1,
  ilkSayfaYuksekligi: 100,
  sayfaYuksekligi: 100,
  bosluk: 10,
  ...ek,
});
const ogeler = (...yukseklikler: number[]): Oge[] => yukseklikler.map((yukseklik) => ({ yukseklik }));

describe("sayfala", () => {
  it("boş belge tek boş sayfa verir", () => {
    expect(sayfala([], secenek())).toEqual({ sayfalar: [[[]]], tasanlar: [] });
  });

  it("sığanları aynı sütunda tutar, boşluğu hesaba katar", () => {
    // 40 + 10 + 50 = 100 tam sığar; üçüncü öğe yeni sayfaya geçer.
    expect(sayfala(ogeler(40, 50, 10), secenek()).sayfalar).toEqual([[[0, 1]], [[2]]]);
  });

  it("iki sütunda önce sağ sütuna, sonra yeni sayfaya geçer", () => {
    const y = sayfala(ogeler(60, 60, 60), secenek({ sutunSayisi: 2 }));
    expect(y.sayfalar).toEqual([[[0], [1]], [[2], []]]);
  });

  it("ilk sayfanın kısa sütununu ayrı hesaplar", () => {
    const y = sayfala(ogeler(50, 50, 50), secenek({ ilkSayfaYuksekligi: 60, sayfaYuksekligi: 120 }));
    expect(y.sayfalar).toEqual([[[0]], [[1, 2]]]);
  });

  it("ara başlığı sütun dibinde yalnız bırakmaz", () => {
    const liste: Oge[] = [{ yukseklik: 70 }, { yukseklik: 15, sonrakiyleKal: true }, { yukseklik: 40 }];
    // Başlık tek başına sığardı (70 + 10 + 15), ama ardındaki paragraf sığmadığı için birlikte taşınır.
    expect(sayfala(liste, secenek()).sayfalar).toEqual([[[0]], [[1, 2]]]);
  });

  it("sütundan uzun öğeyi tek başına yerleştirir ve taşan olarak bildirir", () => {
    const y = sayfala(ogeler(30, 150, 30), secenek());
    expect(y.sayfalar).toEqual([[[0]], [[1]], [[2]]]);
    expect(y.tasanlar).toEqual([1]);
  });

  it("kesirli piksel farkı yüzünden sütun atlamaz", () => {
    expect(sayfala(ogeler(45.2, 45.2), secenek()).sayfalar).toEqual([[[0, 1]]]);
  });
});

describe("altaYerlestir", () => {
  it("son sayfada yer varsa şeridi oraya koyar", () => {
    const liste = ogeler(40, 20);
    const y = sayfala(liste, secenek({ sutunSayisi: 2 }));
    // İkisi de sol sütunda: 40 + 10 + 20 = 70 dolu; boşluk ve 20'lik şeritle tam 100.
    expect(altaYerlestir(y, liste, secenek({ sutunSayisi: 2 }), 20)).toBe(0);
    expect(y.sayfalar).toHaveLength(1);
  });

  it("yer yoksa yeni sayfa açar", () => {
    const liste = ogeler(40, 45);
    const y = sayfala(liste, secenek());
    // Sütun 40 + 10 + 45 = 95 dolu; 20'lik şerit sığmaz.
    expect(altaYerlestir(y, liste, secenek(), 20)).toBe(1);
    expect(y.sayfalar).toEqual([[[0, 1]], [[]]]);
  });

  it("boş belgede ilk sayfaya koyar", () => {
    const y = sayfala([], secenek());
    expect(altaYerlestir(y, [], secenek(), 20)).toBe(0);
  });
});
