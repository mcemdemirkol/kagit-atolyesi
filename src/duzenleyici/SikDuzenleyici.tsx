import { CevapSecici } from "../havuz/CevapSecici";

interface Props {
  siklar: string[];
  dogru: number | undefined;
  onDegis: (siklar: string[], dogru: number | undefined) => void;
}

/** Şık metinleri, şık sayısı ve doğru cevap. Yazılı ve kırpılmış sorularda ortak. */
export function SikDuzenleyici({ siklar, dogru, onDegis }: Props) {
  return (
    <>
      {siklar.map((sik, i) => (
        <label className="sik-satiri" key={i}>
          <b>{String.fromCharCode(65 + i)})</b>
          <input
            value={sik}
            onChange={(olay) =>
              onDegis(
                siklar.map((s, k) => (k === i ? olay.target.value : s)),
                dogru,
              )
            }
          />
        </label>
      ))}
      <div className="satir-arasi">
        <button type="button" disabled={siklar.length >= 5} onClick={() => onDegis([...siklar, ""], dogru)}>
          + Şık
        </button>
        <button
          type="button"
          disabled={siklar.length <= 2}
          onClick={() => onDegis(siklar.slice(0, -1), dogru === siklar.length - 1 ? undefined : dogru)}
        >
          − Şık
        </button>
      </div>
      <div className="alan">
        Doğru cevap
        <CevapSecici deger={dogru} adet={siklar.length} onSec={(yeni) => onDegis(siklar, yeni)} />
      </div>
    </>
  );
}
