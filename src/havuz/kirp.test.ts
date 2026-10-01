import { describe, expect, it } from "vitest";
import { icerikSiniri } from "./kirp";

/** Beyaz zemin üstünde, verilen dikdörtgeni siyah olan RGBA verisi üretir. */
function resim(w: number, h: number, kutu?: [number, number, number, number]): Uint8ClampedArray {
  const veri = new Uint8ClampedArray(w * h * 4).fill(255);
  if (kutu) {
    const [x0, y0, x1, y1] = kutu;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) veri.fill(0, (y * w + x) * 4, (y * w + x) * 4 + 3);
  }
  return veri;
}

describe("icerikSiniri", () => {
  it("içeriğin sınırlarını bulur", () => {
    expect(icerikSiniri(resim(20, 10, [3, 2, 9, 7]), 20, 10)).toEqual({ x0: 3, y0: 2, x1: 9, y1: 7 });
  });

  it("boş alanda null döner", () => {
    expect(icerikSiniri(resim(8, 8), 8, 8)).toBeNull();
  });

  it("kâğıt beyazına yakın gri tonları boş sayar", () => {
    const veri = resim(4, 4);
    veri.fill(245, 0, 3);
    expect(icerikSiniri(veri, 4, 4)).toBeNull();
  });
});
