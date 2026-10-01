import { SIK_HARFLERI } from "./havuzBaglami";

interface Props {
  deger: number | undefined;
  onSec: (deger: number | undefined) => void;
  /** Kaç şık gösterileceği (en çok 5). */
  adet?: number;
}

/** Doğru cevabı işaretleyen A–E düğmeleri. Seçili olana yeniden basmak cevabı kaldırır. */
export function CevapSecici({ deger, onSec, adet = SIK_HARFLERI.length }: Props) {
  return (
    <div className="grup cevap-secici" role="group" aria-label="Doğru cevap">
      {SIK_HARFLERI.slice(0, adet).map((harf, i) => (
        <button key={harf} type="button" aria-pressed={deger === i} onClick={() => onSec(deger === i ? undefined : i)}>
          {harf}
        </button>
      ))}
    </div>
  );
}
