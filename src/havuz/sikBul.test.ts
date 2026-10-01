import { describe, expect, it } from "vitest";
import { siklariBul, type MetinParcasi } from "./sikBul";

const secim = { x: 0.1, y: 0.2, w: 0.35, h: 0.1 };
const p = (s: string, x: number, y: number): MetinParcasi => ({ s, x, y });

describe("siklariBul", () => {
  it("tek satırdaki şıkları okur", () => {
    const parcalar = [
      p("limitinin değeri kaçtır?", 0.1, 0.29),
      ...["A)", "B)", "C)", "D)", "E)"].flatMap((etiket, i) => [p(etiket, 0.1 + i * 0.07, 0.33), p(String(i + 3), 0.13 + i * 0.07, 0.33)]),
    ];
    expect(siklariBul(parcalar, secim, 5)).toEqual(["3", "4", "5", "6", "7"]);
  });

  it("iki satıra yayılan şıkları ve etiketle bitişik metni okur", () => {
    const parcalar = [p("A) Yalnız I", 0.1, 0.33), p("B)", 0.3, 0.33), p("Yalnız II", 0.33, 0.33), p("C) I ve II", 0.1, 0.36), p("D) II ve III", 0.3, 0.36)];
    expect(siklariBul(parcalar, secim, 4)).toEqual(["Yalnız I", "Yalnız II", "I ve II", "II ve III"]);
  });

  it("kesirli şıkkı boş bırakır", () => {
    const parcalar = [
      p("A)", 0.1, 0.33),
      p("1", 0.13, 0.322),
      p("4", 0.13, 0.338),
      p("B)", 0.2, 0.33),
      p("2", 0.23, 0.33),
    ];
    expect(siklariBul(parcalar, secim, 2)).toEqual(["", "2"]);
  });

  it("şık etiketleri eksikse null döner", () => {
    expect(siklariBul([p("A)", 0.1, 0.33), p("B)", 0.2, 0.33)], secim, 4)).toBeNull();
  });

  it("başka sütundaki şıkları almaz", () => {
    const parcalar = ["A)", "B)"].map((etiket, i) => p(etiket, 0.6 + i * 0.07, 0.33));
    expect(siklariBul(parcalar, secim, 2)).toBeNull();
  });
});
