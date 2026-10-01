import { useEffect, useState, type ReactNode } from "react";
import { numarala } from "../dizgi/numarala";
import { GORSEL_OLCEGI } from "../dizgi/olculer";
import { CevapSecici } from "../havuz/CevapSecici";
import { gorselAdresi, useHavuz } from "../havuz/havuzBaglami";
import { AILE_RENKLERI } from "../model/ornek";
import {
  KUTU_ADI,
  type Belge,
  type Blok,
  type HavuzSorusu,
  type KutuCesidi,
  type Marka,
  type SablonAilesi,
  type SutunSayisi,
} from "../model/tipler";
import { MarkaFormu } from "./MarkaFormu";
import { SikDuzenleyici } from "./SikDuzenleyici";

type Kimliksiz<T> = T extends unknown ? Omit<T, "id"> : never;
type YeniBlok = Kimliksiz<Blok>;

const kutu = (cesit: KutuCesidi): YeniBlok => ({ tur: "kutu", cesit, maddeler: [""] });

/** Konu anlatımı blokları: ad, ne işe yaradığı ve boş bloğu üreten fonksiyon. */
const ANLATIM: Array<[string, string, () => YeniBlok]> = [
  ["Paragraf", "Düz anlatım metni", () => ({ tur: "paragraf", metin: "" })],
  ["Ara başlık", "Bölüm başlığı", () => ({ tur: "araBaslik", metin: "" })],
  ["Örnek", "Çözümlü soru", () => ({ tur: "ornek", soru: "", cozum: "" })],
  ["Sıra Sizde", "Öğrencinin çözeceği soru", () => ({ tur: "siraSizde", soru: "", alan: 120 })],
  ["Not", "Bilgi kutusu", () => kutu("not")],
  ["Dikkat", "Uyarı kutusu", () => kutu("dikkat")],
  ["Kural", "Kural kutusu", () => kutu("kural")],
  ["Tanım", "Tanım kutusu", () => kutu("tanim")],
  ["Püf noktası", "İpucu kutusu", () => kutu("puf")],
];
const yaziliSoru = (): YeniBlok => ({ tur: "soru", kok: "", siklar: ["", "", "", "", ""] });

const AILELER: Array<[SablonAilesi, string]> = [
  ["canli", "Canlı"],
  ["teknik", "Teknik"],
];

const duzMetin = (s: string) => s.replace(/\*\*|\$/g, "") || "(boş — yazmak için tıklayın)";

function ozet(blok: Blok, no?: number): [string, string] {
  switch (blok.tur) {
    case "paragraf":
      return ["Paragraf", duzMetin(blok.metin)];
    case "araBaslik":
      return ["Ara başlık", duzMetin(blok.metin)];
    case "kutu":
      return [KUTU_ADI[blok.cesit], duzMetin(blok.maddeler[0] ?? "")];
    case "ornek":
      return [`Örnek ${no}`, duzMetin(blok.soru)];
    case "siraSizde":
      return ["Sıra Sizde", duzMetin(blok.soru)];
    case "soru":
      return [`Soru ${no}`, duzMetin(blok.kok)];
    case "gorselSoru":
      return [`Soru ${no}`, "PDF'ten kırpılmış"];
  }
}

interface Props {
  belge: Belge;
  marka: Marka;
  seciliId: string | null;
  onSec: (id: string | null) => void;
  onDegistir: (degisiklik: Partial<Belge>) => void;
  onMarkaDegistir: (degisiklik: Partial<Marka>) => void;
  onHavuzGuncelle: (havuzId: string, degisiklik: Partial<HavuzSorusu>) => void;
  onKirpmayaGit: () => void;
}

type Sekme = "icerik" | "gorunum";

/**
 * Belge ekranının sol paneli. İki sekme: İçerik (ekleme + blok listesi) ve Görünüm (şablon, düzen, kurum).
 * Bir blok seçiliyken İçerik sekmesi o bloğun formunu gösterir.
 */
export function Duzenleyici(p: Props) {
  const { belge, seciliId, onSec, onDegistir, onHavuzGuncelle } = p;
  const havuz = useHavuz();
  const [sekme, setSekme] = useState<Sekme>("icerik");
  const [havuzAcik, setHavuzAcik] = useState(false);
  const numaralar = numarala(belge.bloklar);
  const seciliSira = belge.bloklar.findIndex((b) => b.id === seciliId);
  const secili = belge.bloklar[seciliSira];

  // Kâğıtta bir bloğa tıklanınca formu görünsün.
  useEffect(() => {
    if (seciliId) setSekme("icerik");
  }, [seciliId]);

  const ekle = (icerik: YeniBlok) => {
    const blok = { ...icerik, id: crypto.randomUUID() } as Blok;
    onDegistir({ bloklar: [...belge.bloklar, blok] });
    // Yazılacak bir şeyi olan blokların formu hemen açılır; havuz soruları peş peşe eklenebilsin diye açılmaz.
    if (blok.tur !== "gorselSoru") onSec(blok.id);
  };
  const guncelle = (id: string, degisiklik: Partial<YeniBlok>) =>
    onDegistir({ bloklar: belge.bloklar.map((b) => (b.id === id ? ({ ...b, ...degisiklik } as Blok) : b)) });
  const tasi = (i: number, yon: -1 | 1) => {
    const bloklar = [...belge.bloklar];
    const [blok] = bloklar.splice(i, 1);
    bloklar.splice(i + yon, 0, blok!);
    onDegistir({ bloklar });
  };
  const sil = (id: string) => {
    onDegistir({ bloklar: belge.bloklar.filter((b) => b.id !== id) });
    if (id === seciliId) onSec(null);
  };

  const form = (blok: Blok): ReactNode => {
    switch (blok.tur) {
      case "paragraf":
        return <Yazi etiket="Metin" deger={blok.metin} onYaz={(metin) => guncelle(blok.id, { metin })} satir={6} odak />;
      case "araBaslik":
        return <Yazi etiket="Başlık" deger={blok.metin} onYaz={(metin) => guncelle(blok.id, { metin })} satir={1} odak />;
      case "kutu":
        return (
          <>
            <label className="alan">
              Kutu türü
              <select value={blok.cesit} onChange={(olay) => guncelle(blok.id, { cesit: olay.target.value as KutuCesidi })}>
                {Object.entries(KUTU_ADI).map(([cesit, ad]) => (
                  <option key={cesit} value={cesit}>
                    {ad}
                  </option>
                ))}
              </select>
            </label>
            <Yazi
              etiket="Maddeler (her satır bir madde)"
              deger={blok.maddeler.join("\n")}
              onYaz={(metin) => guncelle(blok.id, { maddeler: metin.split("\n") })}
              satir={5}
              odak
            />
          </>
        );
      case "ornek":
        return (
          <>
            <Yazi etiket="Soru" deger={blok.soru} onYaz={(soru) => guncelle(blok.id, { soru })} odak />
            <Yazi etiket="Çözüm" deger={blok.cozum} onYaz={(cozum) => guncelle(blok.id, { cozum })} satir={5} />
          </>
        );
      case "siraSizde":
        return (
          <>
            <Yazi etiket="Soru" deger={blok.soru} onYaz={(soru) => guncelle(blok.id, { soru })} odak />
            <label className="alan">
              Öğrencinin çözüm alanı
              <input
                type="range"
                min={40}
                max={400}
                step={10}
                value={blok.alan}
                onChange={(olay) => guncelle(blok.id, { alan: Number(olay.target.value) })}
              />
            </label>
          </>
        );
      case "soru":
        return (
          <>
            <Yazi etiket="Soru" deger={blok.kok} onYaz={(kok) => guncelle(blok.id, { kok })} satir={4} odak />
            <SikDuzenleyici siklar={blok.siklar} dogru={blok.dogru} onDegis={(siklar, dogru) => guncelle(blok.id, { siklar, dogru })} />
          </>
        );
      case "gorselSoru": {
        const soru = havuz.get(blok.havuzId);
        if (!soru) return <p className="ipucu">Bu soru havuzdan silinmiş. Bloğu silebilirsiniz.</p>;
        return (
          <>
            <img className="kucuk-resim" src={gorselAdresi(soru.gorsel)} alt="" />
            {soru.siklar ? (
              <SikDuzenleyici siklar={soru.siklar} dogru={soru.cevap} onDegis={(siklar, cevap) => onHavuzGuncelle(soru.id, { siklar, cevap })} />
            ) : (
              <div className="alan">
                Doğru cevap
                <CevapSecici deger={soru.cevap} onSec={(cevap) => onHavuzGuncelle(soru.id, { cevap })} />
              </div>
            )}
            <label className="onay">
              <input
                type="checkbox"
                checked={soru.siklar !== undefined}
                onChange={(olay) => onHavuzGuncelle(soru.id, { siklar: olay.target.checked ? ["", "", "", "", ""] : undefined })}
              />
              Şıkları uygulama bassın (görselde yalnızca soru var)
            </label>
            <label className="alan">
              Görsel boyutu
              <input
                type="range"
                min={0.5}
                max={1.2}
                step={0.05}
                value={blok.olcek ?? GORSEL_OLCEGI}
                onChange={(olay) => guncelle(blok.id, { olcek: Number(olay.target.value) })}
              />
            </label>
          </>
        );
      }
    }
  };

  // ---- seçili bloğun formu ----
  if (sekme === "icerik" && secili) {
    const [ad] = ozet(secili, numaralar.get(secili.id));
    return (
      <aside className="yan">
        <div className="detay-ust">
          <button type="button" onClick={() => onSec(null)}>
            ← İçerik listesi
          </button>
          <div className="grup">
            <button type="button" disabled={seciliSira === 0} onClick={() => tasi(seciliSira, -1)} title="Yukarı taşı">
              ↑
            </button>
            <button type="button" disabled={seciliSira === belge.bloklar.length - 1} onClick={() => tasi(seciliSira, 1)} title="Aşağı taşı">
              ↓
            </button>
            <button type="button" onClick={() => sil(secili.id)}>
              Sil
            </button>
          </div>
        </div>
        <h2 className="detay-adi">{ad}</h2>
        <div className="form" key={secili.id}>
          {form(secili)}
        </div>
        {secili.tur !== "gorselSoru" && (
          <p className="ipucu">
            Formül için <code>$x^2$</code>, kesir için <code>{"$\\frac{1}{2}$"}</code>, kalın için <code>**metin**</code> yazın.
          </p>
        )}
        <button type="button" className="birincil" onClick={() => onSec(null)}>
          Tamam
        </button>
      </aside>
    );
  }

  const soruBolumu = (
    <section className="bolum">
      <h3>Soru ekle</h3>
      <div className="secenekler">
        <button type="button" onClick={p.onKirpmayaGit}>
          <strong>PDF'ten kırp</strong>
          <span>Kitaptan ya da görselden soruyu kesin</span>
        </button>
        <button type="button" aria-expanded={havuzAcik} onClick={() => setHavuzAcik(!havuzAcik)}>
          <strong>Havuzdan seç</strong>
          <span>Daha önce kırptıklarınız ({havuz.size})</span>
        </button>
        <button type="button" onClick={() => ekle(yaziliSoru())}>
          <strong>Yazarak ekle</strong>
          <span>Soruyu ve şıkları kendiniz yazın</span>
        </button>
      </div>
      {havuzAcik && <HavuzSecici belge={belge} onSec={(havuzId) => ekle({ tur: "gorselSoru", havuzId })} onKirpmayaGit={p.onKirpmayaGit} />}
    </section>
  );
  const anlatimBolumu = (
    <section className="bolum">
      <h3>Konu anlatımı ekle</h3>
      <div className="secenekler ikili-izgara">
        {ANLATIM.map(([ad, aciklama, uret]) => (
          <button key={ad} type="button" onClick={() => ekle(uret())}>
            <strong>{ad}</strong>
            <span>{aciklama}</span>
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <aside className="yan">
      <div className="sekmeler" role="tablist">
        <button type="button" role="tab" aria-selected={sekme === "icerik"} onClick={() => setSekme("icerik")}>
          İçerik
        </button>
        <button type="button" role="tab" aria-selected={sekme === "gorunum"} onClick={() => setSekme("gorunum")}>
          Görünüm ve ayarlar
        </button>
      </div>

      {sekme === "icerik" ? (
        <>
          {belge.tur === "test" ? soruBolumu : anlatimBolumu}
          <details className="diger">
            <summary>{belge.tur === "test" ? "Konu anlatımı da ekle" : "Soru da ekle"}</summary>
            {belge.tur === "test" ? anlatimBolumu : soruBolumu}
          </details>

          <section className="bolum">
            <h3>Belgedekiler ({belge.bloklar.length})</h3>
            {belge.bloklar.length === 0 ? (
              <p className="ipucu">Belge boş. Yukarıdan bir şey ekleyin; burada sırayla listelenir.</p>
            ) : (
              <p className="ipucu">Düzenlemek için buradan ya da kâğıttan tıklayın.</p>
            )}
            <ol className="bloklar">
              {belge.bloklar.map((blok, i) => {
                const [ad, metin] = ozet(blok, numaralar.get(blok.id));
                return (
                  <li key={blok.id}>
                    <button type="button" className="blok-satiri" onClick={() => onSec(blok.id)}>
                      <strong>{ad}</strong>
                      <span className="kisalt ipucu">{metin}</span>
                    </button>
                    <button type="button" className="ikon" disabled={i === 0} onClick={() => tasi(i, -1)} aria-label={`${ad} yukarı taşı`}>
                      ↑
                    </button>
                    <button
                      type="button"
                      className="ikon"
                      disabled={i === belge.bloklar.length - 1}
                      onClick={() => tasi(i, 1)}
                      aria-label={`${ad} aşağı taşı`}
                    >
                      ↓
                    </button>
                    <button type="button" className="ikon" onClick={() => sil(blok.id)} aria-label={`${ad} sil`}>
                      ×
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      ) : (
        <>
          <section className="bolum">
            <h3>Şablon</h3>
            <div className="grup">
              {AILELER.map(([aile, ad]) => (
                <button
                  key={aile}
                  type="button"
                  aria-pressed={p.marka.aile === aile}
                  onClick={() => p.onMarkaDegistir({ aile, ...AILE_RENKLERI[aile] })}
                >
                  {ad}
                </button>
              ))}
            </div>
          </section>
          <section className="bolum">
            <h3>Sayfa düzeni</h3>
            <div className="grup">
              {([1, 2] as SutunSayisi[]).map((sutun) => (
                <button key={sutun} type="button" aria-pressed={belge.sutun === sutun} onClick={() => onDegistir({ sutun })}>
                  {sutun === 1 ? "Tek sütun" : "İki sütun"}
                </button>
              ))}
            </div>
            <label className="alan">
              Soruların altındaki işlem boşluğu
              <input
                type="range"
                min={0}
                max={160}
                step={4}
                value={belge.soruBoslugu ?? 44}
                onChange={(olay) => onDegistir({ soruBoslugu: Number(olay.target.value) })}
              />
            </label>
            <label className="onay">
              <input type="checkbox" checked={belge.cevapAnahtari ?? false} onChange={(olay) => onDegistir({ cevapAnahtari: olay.target.checked })} />
              Son sayfanın altına cevap anahtarı ekle
            </label>
          </section>
          <section className="bolum">
            <h3>Başlıktaki bilgiler</h3>
            <div className="ikili">
              <label className="alan">
                Ders
                <input value={belge.ders} onChange={(olay) => onDegistir({ ders: olay.target.value })} />
              </label>
              <label className="alan">
                Sınıf
                <input value={belge.sinif} onChange={(olay) => onDegistir({ sinif: olay.target.value })} />
              </label>
            </div>
          </section>
          <section className="bolum">
            <h3>Kurum kimliği (bütün belgelerde)</h3>
            <MarkaFormu marka={p.marka} onDegistir={p.onMarkaDegistir} />
          </section>
        </>
      )}
    </aside>
  );
}

interface HavuzSeciciProps {
  belge: Belge;
  onSec: (havuzId: string) => void;
  onKirpmayaGit: () => void;
}

function HavuzSecici({ belge, onSec, onKirpmayaGit }: HavuzSeciciProps) {
  const havuz = useHavuz();
  const sorular = [...havuz.values()].reverse();
  const belgedekiler = new Set(belge.bloklar.flatMap((b) => (b.tur === "gorselSoru" ? [b.havuzId] : [])));

  if (sorular.length === 0) {
    return (
      <div className="havuz-secici">
        <p className="ipucu">Havuz boş. Önce bir PDF'ten soru kırpın.</p>
        <button type="button" onClick={onKirpmayaGit}>
          PDF'ten kırp →
        </button>
      </div>
    );
  }
  return (
    <div className="havuz-secici">
      <p className="ipucu">Eklemek için soruya tıklayın.</p>
      <ul>
        {sorular.map((soru) => (
          <li key={soru.id}>
            <button type="button" className={belgedekiler.has(soru.id) ? "eklenmis" : ""} onClick={() => onSec(soru.id)}>
              <img src={gorselAdresi(soru.gorsel)} alt="Havuz sorusu" loading="lazy" />
              {belgedekiler.has(soru.id) && <span className="rozet">Belgede</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface YaziProps {
  etiket: string;
  deger: string;
  onYaz: (deger: string) => void;
  satir?: number;
  /** Form açılınca imleç bu alana gelsin. */
  odak?: boolean;
}

function Yazi({ etiket, deger, onYaz, satir = 3, odak }: YaziProps) {
  return (
    <label className="alan">
      {etiket}
      {satir === 1 ? (
        <input value={deger} autoFocus={odak} onChange={(olay) => onYaz(olay.target.value)} />
      ) : (
        <textarea value={deger} rows={satir} autoFocus={odak} onChange={(olay) => onYaz(olay.target.value)} />
      )}
    </label>
  );
}
