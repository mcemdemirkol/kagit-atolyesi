import { GORSEL_OLCEGI } from "../dizgi/olculer";
import { gorunurUzunluk, zenginMetin } from "../dizgi/zenginMetin";
import { gorselAdresi, useHavuz } from "../havuz/havuzBaglami";
import { KUTU_ADI, type Blok } from "../model/tipler";

function Metin({ k }: { k: string }) {
  return <span dangerouslySetInnerHTML={{ __html: zenginMetin(k) }} />;
}

/** Kısa şıklar yan yana, uzunlar alt alta dizilir. */
function sikSutunu(siklar: string[]): number {
  const enUzun = Math.max(...siklar.map(gorunurUzunluk));
  if (enUzun <= 6) return siklar.length;
  if (enUzun <= 20) return 2;
  return 1;
}

function Siklar({ siklar }: { siklar: string[] }) {
  return (
    <ol className="sik" style={{ gridTemplateColumns: `repeat(${sikSutunu(siklar)}, auto)` }}>
      {siklar.map((sik, i) => (
        <li key={i}>
          <Metin k={sik} />
        </li>
      ))}
    </ol>
  );
}

export function BlokGorunum({ blok, no }: { blok: Blok; no?: number }) {
  const havuz = useHavuz();
  switch (blok.tur) {
    case "paragraf":
      return (
        <p>
          <Metin k={blok.metin} />
        </p>
      );
    case "araBaslik":
      return (
        <h2>
          <Metin k={blok.metin} />
        </h2>
      );
    case "kutu":
      return (
        <aside className={`box ${blok.cesit}`}>
          <span className="lbl">{KUTU_ADI[blok.cesit]}</span>
          <ul>
            {blok.maddeler.filter((madde) => madde.trim()).map((madde, i) => (
              <li key={i}>
                <Metin k={madde} />
              </li>
            ))}
          </ul>
        </aside>
      );
    case "ornek":
      return (
        <section className="ex">
          <div className="q">
            <span className="lbl">Örnek {no}</span> <Metin k={blok.soru} />
          </div>
          <div className="sol">
            <span className="sl">Çözüm</span> <Metin k={blok.cozum} />
          </div>
        </section>
      );
    case "siraSizde":
      return (
        <section className="ex sira">
          <div className="q">
            <span className="lbl">Sıra Sizde</span> <Metin k={blok.soru} />
          </div>
          <div className="space" style={{ height: blok.alan }} />
        </section>
      );
    case "soru":
      return (
        <div className="soru">
          <span className="no">{no}</span>
          <div>
            <Metin k={blok.kok} />
            <Siklar siklar={blok.siklar} />
          </div>
        </div>
      );
    case "gorselSoru": {
      const soru = havuz.get(blok.havuzId);
      return (
        <div className="soru">
          <span className="no">{no}</span>
          <div>
            {soru ? (
              // Boyut baştan bellidir: görsel yüklenmeden de blok doğru yükseklikte ölçülür.
              <img
                className="kirpinti"
                src={gorselAdresi(soru.gorsel)}
                alt={`Soru ${no}`}
                style={{
                  width: `min(100%, ${soru.genislik * (blok.olcek ?? GORSEL_OLCEGI)}px)`,
                  aspectRatio: `${soru.genislik} / ${soru.yukseklik}`,
                }}
              />
            ) : (
              <em className="eksik">Bu soru havuzdan silinmiş.</em>
            )}
            {soru?.siklar && <Siklar siklar={soru.siklar} />}
          </div>
        </div>
      );
    }
  }
}
