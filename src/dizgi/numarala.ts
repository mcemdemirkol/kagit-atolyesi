import type { Blok } from "../model/tipler";

/** Örnekler ve sorular (yazılı ya da kırpılmış) kendi içlerinde 1'den numaralanır. Blok id → numara. */
export function numarala(bloklar: Blok[]): Map<string, number> {
  const numaralar = new Map<string, number>();
  let ornek = 0;
  let soru = 0;
  for (const blok of bloklar) {
    if (blok.tur === "ornek") numaralar.set(blok.id, ++ornek);
    else if (blok.tur === "soru" || blok.tur === "gorselSoru") numaralar.set(blok.id, ++soru);
  }
  return numaralar;
}
