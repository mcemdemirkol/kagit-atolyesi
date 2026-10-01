import { createContext, useContext } from "react";
import type { HavuzSorusu } from "../model/tipler";

/** Havuz soruları, id ile. Kâğıttaki görsel soru blokları görseli buradan bulur. */
export const HavuzBaglami = createContext<Map<string, HavuzSorusu>>(new Map());
export const useHavuz = () => useContext(HavuzBaglami);

const adresler = new WeakMap<Blob, string>();

/** Aynı görsel için hep aynı adresi döndürür; her çizimde yeni adres üretilmez. */
export function gorselAdresi(gorsel: Blob): string {
  let adres = adresler.get(gorsel);
  if (!adres) {
    adres = URL.createObjectURL(gorsel);
    adresler.set(gorsel, adres);
  }
  return adres;
}

export const SIK_HARFLERI = ["A", "B", "C", "D", "E"] as const;
