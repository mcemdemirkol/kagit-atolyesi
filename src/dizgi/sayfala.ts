// Dizgi motorunun çekirdeği. DOM'dan habersiz saf fonksiyon: ölçülmüş blok
// yüksekliklerini alır, hangi bloğun hangi sayfanın hangi sütununa düştüğünü döndürür.

export interface Oge {
  yukseklik: number;
  /** Ara başlık gibi: sütunun dibinde tek başına kalmasın, sonraki öğeyle birlikte taşınsın. */
  sonrakiyleKal?: boolean;
}

export interface SayfalaSecenek {
  sutunSayisi: number;
  /** İlk sayfada başlık bandı yer kapladığı için sütun daha kısadır. */
  ilkSayfaYuksekligi: number;
  sayfaYuksekligi: number;
  /** Aynı sütundaki iki öğe arasındaki dikey boşluk. */
  bosluk: number;
}

export interface Yerlesim {
  /** sayfalar[sayfa][sutun] = öğe sıra numaraları */
  sayfalar: number[][][];
  /** Boş bir sütuna bile sığmayan öğeler. Bölme desteği gelene kadar taşarak basılır. */
  tasanlar: number[];
}

// Tarayıcı ölçümleri kesirli piksel döndürür; yuvarlama farkı yüzünden sütun atlamasın.
const TOLERANS = 0.5;

export function sayfala(ogeler: Oge[], secenek: SayfalaSecenek): Yerlesim {
  const { sutunSayisi, ilkSayfaYuksekligi, sayfaYuksekligi, bosluk } = secenek;
  const bosSayfa = (): number[][] => Array.from({ length: sutunSayisi }, () => []);

  const sayfalar: number[][][] = [bosSayfa()];
  const tasanlar: number[] = [];
  let sayfa = 0;
  let sutun = 0;
  let dolu = 0;

  const kapasite = () => (sayfa === 0 ? ilkSayfaYuksekligi : sayfaYuksekligi);
  const sonrakiSutun = () => {
    sutun += 1;
    if (sutun >= sutunSayisi) {
      sayfa += 1;
      sutun = 0;
      sayfalar.push(bosSayfa());
    }
    dolu = 0;
  };
  const koy = (i: number) => {
    sayfalar[sayfa]![sutun]!.push(i);
    dolu = (dolu > 0 ? dolu + bosluk : 0) + ogeler[i]!.yukseklik;
  };

  let i = 0;
  while (i < ogeler.length) {
    // Birlikte taşınacak grup: sonrakiyleKal zinciri + zincirin bağlandığı öğe.
    let son = i;
    while (ogeler[son]!.sonrakiyleKal && son + 1 < ogeler.length) son += 1;

    let grupYuksekligi = 0;
    for (let k = i; k <= son; k++) grupYuksekligi += ogeler[k]!.yukseklik + (k > i ? bosluk : 0);

    const gereken = (dolu > 0 ? dolu + bosluk : 0) + grupYuksekligi;
    if (gereken <= kapasite() + TOLERANS) {
      for (let k = i; k <= son; k++) koy(k);
      i = son + 1;
      continue;
    }

    if (dolu > 0) {
      sonrakiSutun();
      continue;
    }

    // Boş sütuna bile sığmıyor: birliktelik kuralını bırak, ilk öğeyi tek başına yerleştir.
    if (ogeler[i]!.yukseklik > kapasite() + TOLERANS) tasanlar.push(i);
    koy(i);
    i += 1;
  }

  return { sayfalar, tasanlar };
}

/**
 * Sütunların altına tam genişlikte basılacak bir şeride (cevap anahtarı) yer arar.
 * Son sayfanın en dolu sütununun altında yer varsa o sayfanın sırasını döndürür;
 * yoksa yerleşime boş bir sayfa ekler ve onun sırasını döndürür.
 */
export function altaYerlestir(yerlesim: Yerlesim, ogeler: Oge[], secenek: SayfalaSecenek, yukseklik: number): number {
  const son = yerlesim.sayfalar.length - 1;
  const kapasite = son === 0 ? secenek.ilkSayfaYuksekligi : secenek.sayfaYuksekligi;
  const enDolu = Math.max(
    ...yerlesim.sayfalar[son]!.map((sutun) =>
      sutun.reduce((toplam, sira, k) => toplam + ogeler[sira]!.yukseklik + (k > 0 ? secenek.bosluk : 0), 0),
    ),
  );
  if (enDolu + secenek.bosluk + yukseklik <= kapasite + TOLERANS) return son;
  yerlesim.sayfalar.push(Array.from({ length: secenek.sutunSayisi }, () => []));
  return son + 1;
}
