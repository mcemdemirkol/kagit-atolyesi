import type { Belge, Blok, Marka, SablonAilesi } from "./tipler";

export const AILE_RENKLERI: Record<SablonAilesi, Pick<Marka, "vurgu" | "ikincil">> = {
  canli: { vurgu: "#0f766e", ikincil: "#f59e0b" },
  teknik: { vurgu: "#1d4ed8", ikincil: "#1b1b1b" },
};

export const ORNEK_MARKA: Marka = {
  kurum: "Örnek Akademi",
  ogretmen: "Ayşe Yılmaz",
  iletisim: "ornekakademi.example · 0500 000 00 00",
  logoMetni: "ÖA",
  aile: "canli",
  ...AILE_RENKLERI.canli,
};

const foyBloklari: Blok[] = [
  {
    id: "f1",
    tur: "paragraf",
    metin:
      "İki çokluğun bölme yoluyla karşılaştırılmasına **oran** denir. $a$ sayısının $b$ sayısına oranı $\\frac{a}{b}$ ya da $a : b$ biçiminde yazılır ($b \\neq 0$). İki oranın eşitliğine **orantı** denir.",
  },
  { id: "f2", tur: "araBaslik", metin: "Orantının Özellikleri" },
  {
    id: "f3",
    tur: "kutu",
    cesit: "not",
    maddeler: [
      "$\\frac{a}{b} = \\frac{c}{d}$ ise $a \\cdot d = b \\cdot c$ olur (içler dışlar çarpımı).",
      "Oranın birimi yoktur; karşılaştırılan çokluklar aynı birimle yazılır.",
    ],
  },
  {
    id: "f4",
    tur: "ornek",
    soru: "$\\frac{3}{5} = \\frac{x}{20}$ orantısında $x$ kaçtır?",
    cozum: "İçler dışlar çarpımından $5x = 3 \\cdot 20 = 60$ bulunur. Buradan $x = 12$ olur.",
  },
  {
    id: "f5",
    tur: "kutu",
    cesit: "dikkat",
    maddeler: [
      "Oranda sıra önemlidir: $2 : 3$ ile $3 : 2$ aynı oran değildir.",
      "Paydası sıfır olan bir oran tanımsızdır.",
    ],
  },
  {
    id: "f6",
    tur: "siraSizde",
    soru: "Bir sınıftaki kız öğrencilerin sayısının erkek öğrencilerin sayısına oranı $\\frac{4}{5}$'tir. Sınıfta 36 öğrenci olduğuna göre kız öğrenci sayısını bulunuz.",
    alan: 140,
  },
  { id: "f7", tur: "araBaslik", metin: "Doğru Orantı" },
  {
    id: "f8",
    tur: "paragraf",
    metin:
      "İki çokluktan biri artarken diğeri de aynı oranda artıyor ya da biri azalırken diğeri de aynı oranda azalıyorsa bu çokluklar **doğru orantılıdır**. $x$ ile $y$ doğru orantılı ise $\\frac{y}{x} = k$ sabittir; $k$ sayısına **orantı sabiti** denir.",
  },
  {
    id: "f9",
    tur: "kutu",
    cesit: "kural",
    maddeler: ["$x$ ile $y$ doğru orantılı ise $y = k \\cdot x$ yazılır."],
  },
  {
    id: "f10",
    tur: "ornek",
    soru: "3 kg elma 45 TL olduğuna göre aynı elmadan 7 kg kaç TL'dir?",
    cozum: "Kilogram ile fiyat doğru orantılıdır. $\\frac{45}{3} = \\frac{x}{7}$ yazılır; $3x = 315$ ve $x = 105$ TL bulunur.",
  },
  {
    id: "f11",
    tur: "siraSizde",
    soru: "$x$ ile $y$ doğru orantılıdır. $x = 6$ iken $y = 15$ olduğuna göre $x = 10$ iken $y$ kaçtır?",
    alan: 120,
  },
  { id: "f12", tur: "araBaslik", metin: "Ters Orantı" },
  {
    id: "f13",
    tur: "paragraf",
    metin:
      "İki çokluktan biri artarken diğeri aynı oranda azalıyorsa bu çokluklar **ters orantılıdır**. Ters orantılı çoklukların çarpımı sabittir: $x \\cdot y = k$.",
  },
  {
    id: "f14",
    tur: "ornek",
    soru: "5 işçinin 12 günde bitirdiği bir işi, aynı hızla çalışan 6 işçi kaç günde bitirir?",
    cozum: "İşçi sayısı ile gün sayısı ters orantılıdır. $5 \\cdot 12 = 6 \\cdot x$ eşitliğinden $x = 10$ gün bulunur.",
  },
  {
    id: "f15",
    tur: "kutu",
    cesit: "puf",
    maddeler: ["Önce çoklukların doğru mu ters mi orantılı olduğuna karar verin; eşitliği ondan sonra kurun."],
  },
];

const testSorulari: Array<[string, string[], number]> = [
  ["$\\frac{12}{18}$ oranının en sade hâli aşağıdakilerden hangisidir?", ["$\\frac{2}{3}$", "$\\frac{3}{4}$", "$\\frac{3}{5}$", "$\\frac{5}{6}$"], 0],
  ["$\\frac{4}{7} = \\frac{x}{21}$ orantısında $x$ kaçtır?", ["9", "12", "14", "16"], 1],
  ["Bir sınıfta 12 kız ve 16 erkek öğrenci vardır. Kız öğrenci sayısının erkek öğrenci sayısına oranı kaçtır?", ["$\\frac{3}{4}$", "$\\frac{4}{3}$", "$\\frac{3}{7}$", "$\\frac{4}{7}$"], 0],
  ["3 kg elma 45 TL olduğuna göre aynı elmadan 7 kg kaç TL'dir?", ["90", "95", "105", "115"], 2],
  ["$\\frac{a}{b} = \\frac{2}{5}$ ve $a + b = 28$ olduğuna göre $a$ kaçtır?", ["8", "10", "12", "20"], 0],
  ["Bir haritada 1 cm, gerçekte 5 km'yi göstermektedir. Haritada 3,5 cm olan yol gerçekte kaç km'dir?", ["15", "17,5", "18", "35"], 1],
  ["$x$ ile $y$ doğru orantılıdır. $x = 6$ iken $y = 15$ olduğuna göre $x = 10$ iken $y$ kaçtır?", ["20", "24", "25", "30"], 2],
  ["Aşağıdaki oranlardan hangisi $\\frac{3}{4}$ ile orantı oluşturur?", ["$\\frac{6}{9}$", "$\\frac{9}{12}$", "$\\frac{12}{15}$", "$\\frac{15}{18}$"], 1],
  ["5 işçinin 12 günde bitirdiği bir işi, aynı hızla çalışan 6 işçi kaç günde bitirir?", ["8", "9", "10", "14"], 2],
  ["35 TL, iki kardeş arasında $2 : 5$ oranında paylaştırılıyor. Az alan kardeş kaç TL alır?", ["10", "14", "15", "25"], 0],
  ["Bir araç 3 saatte 210 km yol almaktadır. Aynı hızla 5 saatte kaç km yol alır?", ["300", "330", "350", "420"], 2],
  ["Bir musluk bir havuzu 8 saatte doldurmaktadır. Aynı özellikte 4 musluk birlikte aynı havuzu kaç saatte doldurur?", ["1", "2", "4", "32"], 1],
  ["Aşağıdaki çokluk çiftlerinden hangisi ters orantılıdır?", ["Bir karenin kenar uzunluğu ile çevresi", "Alınan ekmek sayısı ile ödenen para", "Sabit bir yolda aracın hızı ile yolu tamamlama süresi", "Bir işçinin çalıştığı gün sayısı ile aldığı ücret"], 2],
  ["$\\frac{x}{4} = \\frac{9}{x}$ olduğuna göre pozitif $x$ değeri kaçtır?", ["3", "6", "9", "12"], 1],
];

export function ornekBelgeler(): Belge[] {
  const simdi = Date.now();
  return [
    {
      id: "ornek-foy",
      tur: "foy",
      baslik: "Oran ve Orantı",
      ders: "Matematik",
      sinif: "7. Sınıf",
      sutun: 1,
      bloklar: foyBloklari,
      guncelleme: simdi,
    },
    {
      id: "ornek-test",
      tur: "test",
      baslik: "Oran ve Orantı",
      ders: "Matematik",
      sinif: "7. Sınıf",
      sutun: 2,
      bloklar: testSorulari.map(([kok, siklar, dogru], i) => ({ id: `t${i + 1}`, tur: "soru", kok, siklar, dogru })),
      guncelleme: simdi,
    },
  ];
}
