import type { CSSProperties, ReactNode } from "react";
import { BLOK_BOSLUGU } from "../dizgi/olculer";
import { BELGE_TURU_ADI, type Belge, type Blok, type Marka } from "../model/tipler";
import { BlokGorunum } from "./BlokGorunum";

interface Props {
  belge: Belge;
  marka: Marka;
  /** 1'den başlar; ilk sayfada başlık bandı basılır. */
  no: number;
  sutunlar: Blok[][];
  numaralar: Map<string, number>;
  /** Sütunların altına, alt bilginin üstüne tam genişlikte basılır (cevap anahtarı). */
  alt?: ReactNode;
  /** Yalnızca ekrandaki önizlemede verilir: kâğıtta bloğa tıklayınca düzenleyicide açılır. */
  seciliId?: string | null;
  onBlokSec?: (id: string) => void;
}

/** Tek bir A4 kâğıdı. Hem ekrandaki önizlemede hem ölçüm katmanında aynı bileşen kullanılır. */
export function Sayfa({ belge, marka, no, sutunlar, numaralar, alt, seciliId, onBlokSec }: Props) {
  const stil = {
    "--a": marka.vurgu,
    "--b": marka.ikincil,
    "--sutun": sutunlar.length,
    "--bosluk": `${BLOK_BOSLUGU}px`,
    "--soru-bosluk": `${belge.soruBoslugu ?? 44}px`,
  } as CSSProperties;
  const govdeSinifi = ["govde", belge.tur, sutunlar.length === 2 ? "iki" : ""].join(" ").trim();

  return (
    <article className={`page t-${marka.aile}`} style={stil}>
      {no === 1 && (
        <>
          <header className="hd">
            <div className="logo">{marka.logo ? <img src={marka.logo} alt="" /> : marka.logoMetni}</div>
            <div className="kurum">{marka.kurum}</div>
            <h1>{belge.baslik}</h1>
            <div className="meta">
              <span className="ders">{belge.ders}</span>
              <span className="sinif">{belge.sinif}</span>
            </div>
            <div className="tur">{BELGE_TURU_ADI[belge.tur]}</div>
          </header>
          {belge.tur === "test" && (
            <div className="adsoyad">
              <span>Ad Soyad:</span>
              <span>Sınıf / No:</span>
              <span>Tarih:</span>
            </div>
          )}
        </>
      )}
      <main className={govdeSinifi}>
        {sutunlar.map((bloklar, i) => (
          <div className="sutun" key={i}>
            {bloklar.map((blok) => (
              <div
                className={blok.id === seciliId ? "blok secili" : "blok"}
                data-blok={blok.id}
                key={blok.id}
                onClick={onBlokSec && (() => onBlokSec(blok.id))}
              >
                <BlokGorunum blok={blok} no={numaralar.get(blok.id)} />
              </div>
            ))}
          </div>
        ))}
      </main>
      {alt}
      <footer className="ft">
        <span>
          {marka.ogretmen} · {marka.kurum}
        </span>
        <span className="mid">{marka.iletisim}</span>
        <span className="pn">{no}</span>
      </footer>
    </article>
  );
}
