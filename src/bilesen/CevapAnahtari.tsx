import { SIK_HARFLERI } from "../havuz/havuzBaglami";

/** Son sayfanın dibinde, sütunların altında tam genişlikte basılan cevap şeridi. */
export function CevapAnahtari({ cevaplar }: { cevaplar: Array<number | undefined> }) {
  return (
    <section className="anahtar" data-anahtar>
      <strong>Cevap Anahtarı</strong>
      <ol>
        {cevaplar.map((cevap, i) => (
          <li key={i}>
            <b>{i + 1}</b>-{cevap === undefined ? "?" : SIK_HARFLERI[cevap]}
          </li>
        ))}
      </ol>
    </section>
  );
}
