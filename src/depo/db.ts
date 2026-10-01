import Dexie, { type EntityTable } from "dexie";
import { ORNEK_MARKA, ornekBelgeler } from "../model/ornek";
import type { Belge, HavuzSorusu, Kaynak, Marka } from "../model/tipler";

interface Ayar {
  anahtar: string;
  deger: unknown;
}

// Bütün veri kullanıcının tarayıcısında kalır; sunucu yok.
const db = new Dexie("kagit-atolyesi") as Dexie & {
  belgeler: EntityTable<Belge, "id">;
  ayarlar: EntityTable<Ayar, "anahtar">;
  kaynaklar: EntityTable<Kaynak, "id">;
  havuz: EntityTable<HavuzSorusu, "id">;
};

db.version(1).stores({
  belgeler: "id, tur, guncelleme",
  ayarlar: "anahtar",
});
db.version(2).stores({
  kaynaklar: "id, eklenme",
  havuz: "id, eklenme, kaynakId",
});

export interface Veri {
  belgeler: Belge[];
  marka: Marka;
  kaynaklar: Kaynak[];
  havuz: HavuzSorusu[];
}

export async function yukle(): Promise<Veri> {
  let belgeler = await db.belgeler.orderBy("guncelleme").toArray();
  if (belgeler.length === 0) {
    belgeler = ornekBelgeler();
    await db.belgeler.bulkPut(belgeler);
  }
  const kayit = await db.ayarlar.get("marka");
  return {
    belgeler,
    marka: (kayit?.deger as Marka | undefined) ?? ORNEK_MARKA,
    kaynaklar: await db.kaynaklar.orderBy("eklenme").toArray(),
    havuz: await db.havuz.orderBy("eklenme").toArray(),
  };
}

export const belgeKaydet = (belge: Belge) => db.belgeler.put(belge);
export const belgeSil = (id: string) => db.belgeler.delete(id);
export const markaKaydet = (marka: Marka) => db.ayarlar.put({ anahtar: "marka", deger: marka });
export const kaynakKaydet = (kaynak: Kaynak) => db.kaynaklar.put(kaynak);
export const kaynakSil = (id: string) => db.kaynaklar.delete(id);
export const soruKaydet = (soru: HavuzSorusu) => db.havuz.put(soru);
export const soruSil = (id: string) => db.havuz.delete(id);

/** Tarayıcıdan, yer açmak için bu sitenin verisini kendiliğinden silmemesini ister. */
export function kaliciDepoIste(): void {
  void navigator.storage?.persist?.();
}
