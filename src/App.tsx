import { useEffect, useMemo, useState } from "react";
import * as depo from "./depo/db";
import { AnaSayfa } from "./ekran/AnaSayfa";
import { BelgeEkrani } from "./ekran/BelgeEkrani";
import { HavuzBaglami } from "./havuz/havuzBaglami";
import { HavuzGorunumu } from "./havuz/HavuzGorunumu";
import { kaynakKapat } from "./havuz/kaynakCiz";
import type { Belge, BelgeTuru, HavuzSorusu, Kaynak, Marka } from "./model/tipler";

const KABUL_EDILEN = /^(application\/pdf|image\/(png|jpeg|webp))$/;

/** Üç ekran vardır: belgelerin listelendiği ana sayfa, bir belgenin düzenlendiği ekran ve kırpma ekranı. */
type Ekran = "ana" | "belge" | "kirp";

export function App() {
  const [belgeler, setBelgeler] = useState<Belge[]>([]);
  const [marka, setMarka] = useState<Marka | null>(null);
  const [kaynaklar, setKaynaklar] = useState<Kaynak[]>([]);
  const [havuz, setHavuz] = useState<HavuzSorusu[]>([]);
  const [ekran, setEkran] = useState<Ekran>("ana");
  // Kırpma ekranı ana sayfadan da açılabilir; o zaman açık belge yoktur.
  const [aktifId, setAktifId] = useState<string | null>(null);
  const havuzHaritasi = useMemo(() => new Map(havuz.map((soru) => [soru.id, soru])), [havuz]);

  useEffect(() => {
    void depo.yukle().then((veri) => {
      setBelgeler(veri.belgeler);
      setMarka(veri.marka);
      setKaynaklar(veri.kaynaklar);
      setHavuz(veri.havuz);
    });
  }, []);

  if (!marka) return <p className="bekle">Yükleniyor…</p>;
  const belge = belgeler.find((b) => b.id === aktifId) ?? null;

  const belgeYaz = (yeni: Belge) => {
    setBelgeler((liste) => liste.map((b) => (b.id === yeni.id ? yeni : b)));
    void depo.belgeKaydet(yeni);
  };
  const belgeDegistir = (hedef: Belge, degisiklik: Partial<Belge>) =>
    belgeYaz({ ...hedef, ...degisiklik, guncelleme: Date.now() });

  const belgeAc = (id: string) => {
    setAktifId(id);
    setEkran("belge");
  };
  const yeniBelge = (tur: BelgeTuru) => {
    const onceki = belgeler.at(-1);
    const yeni: Belge = {
      id: crypto.randomUUID(),
      tur,
      baslik: tur === "foy" ? "Yeni föy" : "Yeni test",
      ders: onceki?.ders ?? "",
      sinif: onceki?.sinif ?? "",
      sutun: tur === "test" ? 2 : 1,
      bloklar: [],
      guncelleme: Date.now(),
    };
    setBelgeler((liste) => [...liste, yeni]);
    void depo.belgeKaydet(yeni);
    belgeAc(yeni.id);
  };
  const belgeSil = (silinecek: Belge) => {
    if (!window.confirm(`"${silinecek.baslik}" belgesi silinsin mi? Bu işlem geri alınamaz.`)) return;
    setBelgeler((liste) => liste.filter((b) => b.id !== silinecek.id));
    void depo.belgeSil(silinecek.id);
  };

  const markaDegistir = (degisiklik: Partial<Marka>) => {
    const yeni = { ...marka, ...degisiklik };
    setMarka(yeni);
    void depo.markaKaydet(yeni);
  };

  const kaynakEkle = async (dosyalar: File[]) => {
    const yeniler: Kaynak[] = dosyalar
      .filter((dosya) => KABUL_EDILEN.test(dosya.type))
      .map((dosya, i) => ({
        id: crypto.randomUUID(),
        ad: dosya.name || `Yapıştırılan görsel ${new Date().toLocaleTimeString("tr-TR")}`,
        mime: dosya.type,
        veri: dosya,
        eklenme: Date.now() + i,
      }));
    if (yeniler.length === 0) return undefined;
    depo.kaliciDepoIste();
    await Promise.all(yeniler.map(depo.kaynakKaydet));
    setKaynaklar((liste) => [...liste, ...yeniler]);
    return yeniler[0];
  };
  const kaynakSil = (id: string) => {
    setKaynaklar((liste) => liste.filter((k) => k.id !== id));
    kaynakKapat(id);
    void depo.kaynakSil(id);
  };

  const belgeyeSoruEkle = (hedef: Belge, havuzId: string) =>
    belgeDegistir(hedef, { bloklar: [...hedef.bloklar, { id: crypto.randomUUID(), tur: "gorselSoru", havuzId }] });
  const soruEkle = (soru: HavuzSorusu) => {
    setHavuz((liste) => [...liste, soru]);
    void depo.soruKaydet(soru);
    if (belge) belgeyeSoruEkle(belge, soru.id);
  };
  const soruGuncelle = (id: string, degisiklik: Partial<HavuzSorusu>) => {
    const soru = havuzHaritasi.get(id);
    if (!soru) return;
    const yeni = { ...soru, ...degisiklik };
    setHavuz((liste) => liste.map((s) => (s.id === id ? yeni : s)));
    void depo.soruKaydet(yeni);
  };
  const soruSil = (id: string) => {
    const kullanan = belgeler.filter((b) => b.bloklar.some((blok) => blok.tur === "gorselSoru" && blok.havuzId === id));
    if (kullanan.length > 0) {
      const adlar = kullanan.map((b) => `"${b.baslik}"`).join(", ");
      if (!window.confirm(`Bu soru ${adlar} belgesinde kullanılıyor. Silinirse oradan da kalkar. Silinsin mi?`)) return;
      for (const b of kullanan) {
        belgeDegistir(b, { bloklar: b.bloklar.filter((blok) => !(blok.tur === "gorselSoru" && blok.havuzId === id)) });
      }
    }
    setHavuz((liste) => liste.filter((soru) => soru.id !== id));
    void depo.soruSil(id);
  };

  return (
    <HavuzBaglami.Provider value={havuzHaritasi}>
      {ekran === "belge" && belge ? (
        <BelgeEkrani
          belge={belge}
          marka={marka}
          onGeri={() => setEkran("ana")}
          onDegistir={(degisiklik) => belgeDegistir(belge, degisiklik)}
          onMarkaDegistir={markaDegistir}
          onHavuzGuncelle={soruGuncelle}
          onKirpmayaGit={() => setEkran("kirp")}
        />
      ) : ekran === "kirp" ? (
        <HavuzGorunumu
          kaynaklar={kaynaklar}
          havuz={havuz}
          hedef={belge}
          onGeri={() => setEkran(belge ? "belge" : "ana")}
          onKaynakEkle={kaynakEkle}
          onKaynakSil={kaynakSil}
          onSoruEkle={soruEkle}
          onSoruSil={soruSil}
          onSoruCevap={(id, cevap) => soruGuncelle(id, { cevap })}
          onBelgeyeEkle={(id) => belge && belgeyeSoruEkle(belge, id)}
        />
      ) : (
        <AnaSayfa
          belgeler={belgeler}
          havuzSayisi={havuz.length}
          marka={marka}
          onAc={belgeAc}
          onYeni={yeniBelge}
          onSil={belgeSil}
          onHavuz={() => {
            setAktifId(null);
            setEkran("kirp");
          }}
          onMarkaDegistir={markaDegistir}
        />
      )}
    </HavuzBaglami.Provider>
  );
}
