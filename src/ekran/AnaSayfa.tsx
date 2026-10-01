import { MarkaFormu } from "../duzenleyici/MarkaFormu";
import type { Belge, BelgeTuru, Marka } from "../model/tipler";

interface Props {
  belgeler: Belge[];
  havuzSayisi: number;
  marka: Marka;
  onAc: (id: string) => void;
  onYeni: (tur: BelgeTuru) => void;
  onSil: (belge: Belge) => void;
  onHavuz: () => void;
  onMarkaDegistir: (degisiklik: Partial<Marka>) => void;
}

const tarih = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** Açılış ekranı: yeni belge başlatma, eski belgeler ve bir kez yapılan ayarlar. */
export function AnaSayfa({ belgeler, havuzSayisi, marka, onAc, onYeni, onSil, onHavuz, onMarkaDegistir }: Props) {
  const sirali = [...belgeler].sort((a, b) => b.guncelleme - a.guncelleme);

  return (
    <main className="ana">
      <header className="ana-ust">
        <h1>Kâğıt Atölyesi</h1>
        <p>Kendi sorularınızdan ve anlatımınızdan, baskıya hazır föy ve test.</p>
      </header>

      <section>
        <h2>Yeni belge</h2>
        <div className="buyuk-kartlar">
          <button type="button" onClick={() => onYeni("test")}>
            <strong>Yaprak Test</strong>
            <span>PDF'ten soru kırpın ya da kendiniz yazın. İki sütun, cevap anahtarı.</span>
          </button>
          <button type="button" onClick={() => onYeni("foy")}>
            <strong>Konu Föyü</strong>
            <span>Anlatım, not ve dikkat kutuları, örnek ve “Sıra Sizde” soruları.</span>
          </button>
        </div>
      </section>

      <section>
        <h2>Belgelerim</h2>
        {sirali.length === 0 ? (
          <p className="ipucu">Henüz belge yok. Yukarıdan bir tür seçerek başlayın.</p>
        ) : (
          <ul className="belge-listesi">
            {sirali.map((belge) => (
              <li key={belge.id}>
                <button type="button" className="belge-satiri" onClick={() => onAc(belge.id)}>
                  <span className="rozet">{belge.tur === "foy" ? "FÖY" : "TEST"}</span>
                  <strong className="kisalt">{belge.baslik || "(başlıksız)"}</strong>
                  <span className="ipucu kisalt">
                    {[belge.ders, belge.sinif].filter(Boolean).join(" · ")} · {belge.bloklar.length} blok · {tarih.format(belge.guncelleme)}
                  </span>
                </button>
                <button type="button" onClick={() => onSil(belge)} aria-label={`${belge.baslik} belgesini sil`}>
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Soru havuzu</h2>
        <div className="arac-satiri">
          <p className="ipucu">
            PDF'lerden kırptığınız sorular havuzda birikir ve her testte yeniden kullanılır. Şu an {havuzSayisi} soru var.
          </p>
          <button type="button" onClick={onHavuz}>
            Havuzu aç
          </button>
        </div>
      </section>

      <section>
        <h2>Kurum kimliği</h2>
        <p className="ipucu">Bir kez doldurun; bütün belgelerin başlığında ve alt bilgisinde basılır.</p>
        <MarkaFormu marka={marka} onDegistir={onMarkaDegistir} />
      </section>
    </main>
  );
}
