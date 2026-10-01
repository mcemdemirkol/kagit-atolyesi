// Uygulamanın veri modeli. Metin alanlarında $...$ arası KaTeX, **...** arası kalın yazıdır.

export type KutuCesidi = "not" | "dikkat" | "kural" | "tanim" | "puf";

export type Blok =
  | { id: string; tur: "paragraf"; metin: string }
  | { id: string; tur: "araBaslik"; metin: string }
  | { id: string; tur: "kutu"; cesit: KutuCesidi; maddeler: string[] }
  | { id: string; tur: "ornek"; soru: string; cozum: string }
  /** `alan`: öğrencinin çözümü için bırakılan boşluğun yüksekliği (px). */
  | { id: string; tur: "siraSizde"; soru: string; alan: number }
  /** `dogru`: doğru şıkkın sırası (0 = A). Cevap anahtarı için. */
  | { id: string; tur: "soru"; kok: string; siklar: string[]; dogru?: number }
  /** Havuzdaki kırpılmış bir soruyu gösterir; görselin kendisi havuzda durur. */
  /** `olcek`: görselin kaynaktaki boyutuna oranı; verilmezse GORSEL_OLCEGI. */
  | { id: string; tur: "gorselSoru"; havuzId: string; olcek?: number };

export type BlokTuru = Blok["tur"];
export type BelgeTuru = "foy" | "test";
export type SutunSayisi = 1 | 2;

export interface Belge {
  id: string;
  tur: BelgeTuru;
  baslik: string;
  ders: string;
  sinif: string;
  sutun: SutunSayisi;
  bloklar: Blok[];
  /** Açıksa son sayfanın dibine cevap anahtarı basılır. */
  cevapAnahtari?: boolean;
  /** Test sorularının altında bırakılan işlem alanı (px); verilmezse 44. */
  soruBoslugu?: number;
  guncelleme: number;
}

export type SablonAilesi = "canli" | "teknik";

/** Bir kez kurulur, bütün belgelere uygulanır. */
export interface Marka {
  kurum: string;
  ogretmen: string;
  iletisim: string;
  /** Logo görseli yokken amblemde gösterilen kısaltma. */
  logoMetni: string;
  /** Logo görseli (data URL). Varsa kısaltmanın yerine basılır. */
  logo?: string;
  aile: SablonAilesi;
  vurgu: string;
  ikincil: string;
}

export const BELGE_TURU_ADI: Record<BelgeTuru, string> = {
  foy: "Konu Anlatımı",
  test: "Yaprak Test",
};

export const KUTU_ADI: Record<KutuCesidi, string> = {
  not: "Not",
  dikkat: "Dikkat",
  kural: "Kural",
  tanim: "Tanım",
  puf: "Püf Noktası",
};

/** Kullanıcının yüklediği PDF kitap ya da görsel. Dosyanın kendisi tarayıcıda saklanır. */
export interface Kaynak {
  id: string;
  ad: string;
  mime: string;
  veri: Blob;
  eklenme: number;
}

/** Bir kaynaktan kırpılıp havuza alınmış soru görseli. */
export interface HavuzSorusu {
  id: string;
  gorsel: Blob;
  /** Kâğıt üstündeki doğal boyut (96 dpi px). Görsel yüklenmeden yükseklik hesaplanabilsin diye saklanır. */
  genislik: number;
  yukseklik: number;
  /** Doğru şıkkın sırası (0 = A). */
  cevap?: number;
  /**
   * Görsel yalnızca soru köküyse şıkları uygulama basar; metinleri burada durur (boş olabilir).
   * Tanımsızsa şıklar görselin içindedir.
   */
  siklar?: string[];
  kaynakId?: string;
  kaynakAdi?: string;
  sayfa?: number;
  eklenme: number;
}
