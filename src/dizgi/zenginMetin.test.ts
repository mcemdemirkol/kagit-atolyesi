import { describe, expect, it } from "vitest";
import { gorunurUzunluk, zenginMetin } from "./zenginMetin";

describe("zenginMetin", () => {
  it("HTML'i kaçırır", () => {
    expect(zenginMetin("a < b & <script>")).toBe("a &lt; b &amp; &lt;script&gt;");
  });

  it("çift yıldızı kalına çevirir", () => {
    expect(zenginMetin("bu **oran** olur")).toBe("bu <b>oran</b> olur");
  });

  it("dolar arası KaTeX olur, dışı düz metin kalır", () => {
    const html = zenginMetin("önce $x^2$ sonra");
    expect(html.startsWith("önce <span class=\"katex\">")).toBe(true);
    expect(html.endsWith(" sonra")).toBe(true);
  });
});

describe("gorunurUzunluk", () => {
  it("formül işaretlerini saymaz", () => {
    expect(gorunurUzunluk("$\\frac{2}{3}$")).toBe(2);
    expect(gorunurUzunluk("105")).toBe(3);
  });
});
