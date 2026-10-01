import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CevapAnahtari } from "../bilesen/CevapAnahtari";
import { Sayfa } from "../bilesen/Sayfa";
import { useHavuz } from "../havuz/havuzBaglami";
import type { Belge, Blok, Marka } from "../model/tipler";
import { numarala } from "./numarala";
import { BLOK_BOSLUGU, SAYFA_GENISLIGI } from "./olculer";
import { altaYerlestir, sayfala, type Oge, type Yerlesim } from "./sayfala";

const bosSutunlar = (belge: Belge): Blok[][] => Array.from({ length: belge.sutun }, () => []);

interface Props {
  belge: Belge;
  marka: Marka;
  seciliId: string | null;
  onBlokSec: (id: string) => void;
}

interface Olcum {
  belge: Belge;
  yerlesim: Yerlesim;
  /** Cevap anahtarının basılacağı sayfa (0'dan); anahtar kapalıysa -1. */
  anahtarSayfasi: number;
}

/**
 * Belgeyi sayfalara böler ve basar. İki katman vardır:
 *  - ölçüm katmanı: görünmez; bütün bloklar gerçek sütun genişliğinde dizilir ve yükseklikleri okunur,
 *  - kâğıtlar: sayfala() sonucuna göre dağıtılmış gerçek sayfalar.
 * İkisi de aynı Sayfa bileşenini kullandığı için ölçülen ile basılan aynıdır.
 */
export function Dizgi({ belge, marka, seciliId, onBlokSec }: Props) {
  const olcumRef = useRef<HTMLDivElement>(null);
  const alanRef = useRef<HTMLDivElement>(null);
  const [olcum, setOlcum] = useState<Olcum | null>(null);
  const [fontSurumu, setFontSurumu] = useState(0);
  const [olcek, setOlcek] = useState(1);
  const havuz = useHavuz();
  const numaralar = useMemo(() => numarala(belge.bloklar), [belge.bloklar]);

  // Cevap anahtarı açıksa sorulardaki doğru cevaplar, soru sırasıyla.
  const cevaplar = useMemo(() => {
    if (!belge.cevapAnahtari) return null;
    return belge.bloklar.flatMap((blok) =>
      blok.tur === "soru" ? [blok.dogru] : blok.tur === "gorselSoru" ? [havuz.get(blok.havuzId)?.cevap] : [],
    );
  }, [belge, havuz]);
  const anahtar = cevaplar && <CevapAnahtari cevaplar={cevaplar} />;

  // Yazı tipi sonradan yüklenince satır kırılımları değişir; yeniden ölçmek gerekir.
  useEffect(() => {
    const yenile = () => setFontSurumu((s) => s + 1);
    document.fonts.addEventListener("loadingdone", yenile);
    return () => document.fonts.removeEventListener("loadingdone", yenile);
  }, []);

  useLayoutEffect(() => {
    const kok = olcumRef.current;
    if (!kok) return;
    const sutunYuksekligi = (ad: string) => kok.querySelector<HTMLElement>(`[data-olcum="${ad}"] .sutun`)!.clientHeight;
    const yukseklikler = new Map<string, number>();
    kok.querySelectorAll<HTMLElement>("[data-blok]").forEach((el) => {
      yukseklikler.set(el.dataset.blok!, el.getBoundingClientRect().height);
    });
    const ogeler: Oge[] = belge.bloklar.map((blok) => ({
      yukseklik: yukseklikler.get(blok.id) ?? 0,
      sonrakiyleKal: blok.tur === "araBaslik",
    }));
    const secenek = {
      sutunSayisi: belge.sutun,
      ilkSayfaYuksekligi: sutunYuksekligi("ilk"),
      sayfaYuksekligi: sutunYuksekligi("diger"),
      bosluk: BLOK_BOSLUGU,
    };
    const yerlesim = sayfala(ogeler, secenek);
    const anahtarEl = kok.querySelector<HTMLElement>("[data-anahtar]");
    const anahtarSayfasi = anahtarEl ? altaYerlestir(yerlesim, ogeler, secenek, anahtarEl.getBoundingClientRect().height) : -1;
    setOlcum({ belge, yerlesim, anahtarSayfasi });
  }, [belge, marka, havuz, cevaplar, fontSurumu]);

  // Belge değiştiği karede eldeki yerleşim eski belgeye aittir; yenisi ölçülene kadar basılmaz.
  const gecerli = olcum?.belge === belge ? olcum : null;

  // Kâğıt, önizleme alanına sığacak kadar küçültülür; baskıda her zaman 1:1'dir.
  useEffect(() => {
    const alan = alanRef.current;
    if (!alan) return;
    const gozlemci = new ResizeObserver(() => setOlcek(Math.min(1, (alan.clientWidth - 64) / SAYFA_GENISLIGI)));
    gozlemci.observe(alan);
    return () => gozlemci.disconnect();
  }, []);

  // Düzenleyicide seçilen blok kâğıtta görünür olsun.
  useEffect(() => {
    if (!seciliId) return;
    alanRef.current?.querySelector(`.kagitlar [data-blok="${seciliId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [seciliId]);

  const olcumSutunlari = bosSutunlar(belge);
  olcumSutunlari[0] = belge.bloklar;

  return (
    <div className="dizgi" ref={alanRef}>
      <div className="olcum" ref={olcumRef} aria-hidden>
        <div data-olcum="ilk">
          <Sayfa belge={belge} marka={marka} no={1} sutunlar={olcumSutunlari} numaralar={numaralar} />
        </div>
        <div data-olcum="diger">
          <Sayfa belge={belge} marka={marka} no={2} sutunlar={bosSutunlar(belge)} numaralar={numaralar} />
        </div>
        {/* Anahtar ayrı bir sayfada ölçülür; yoksa "diger" sayfasının sütununu kısaltırdı. */}
        {anahtar && <Sayfa belge={belge} marka={marka} no={2} sutunlar={bosSutunlar(belge)} numaralar={numaralar} alt={anahtar} />}
      </div>
      <div className="kagitlar" style={{ zoom: olcek }}>
        {gecerli?.yerlesim.sayfalar.map((sutunlar, i) => (
          <Sayfa
            key={i}
            belge={belge}
            marka={marka}
            no={i + 1}
            sutunlar={sutunlar.map((sutun) => sutun.flatMap((sira) => belge.bloklar[sira] ?? []))}
            numaralar={numaralar}
            alt={i === gecerli.anahtarSayfasi ? anahtar : null}
            seciliId={seciliId}
            onBlokSec={onBlokSec}
          />
        ))}
      </div>
      {gecerli && gecerli.yerlesim.tasanlar.length > 0 && (
        <p className="uyari">
          {gecerli.yerlesim.tasanlar.length} blok tek sütuna sığmıyor ve taşarak basılacak. Bloğu bölün ya da kısaltın.
        </p>
      )}
    </div>
  );
}
