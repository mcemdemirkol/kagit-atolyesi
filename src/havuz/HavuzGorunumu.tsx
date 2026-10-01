import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Belge, HavuzSorusu, Kaynak } from "../model/tipler";
import { CevapSecici } from "./CevapSecici";
import { gorselAdresi, SIK_HARFLERI } from "./havuzBaglami";
import { sayfaCiz, type CizilmisSayfa } from "./kaynakCiz";
import { kirp, type Secim } from "./kirp";
import { siklariBul } from "./sikBul";

interface Props {
  kaynaklar: Kaynak[];
  havuz: HavuzSorusu[];
  /** Kırpılan soruların ekleneceği belge. Havuz ana sayfadan açıldıysa yoktur. */
  hedef: Belge | null;
  onGeri: () => void;
  onKaynakEkle: (dosyalar: File[]) => Promise<Kaynak | undefined>;
  onKaynakSil: (id: string) => void;
  onSoruEkle: (soru: HavuzSorusu) => void;
  onSoruSil: (id: string) => void;
  onSoruCevap: (id: string, cevap: number | undefined) => void;
  onBelgeyeEkle: (havuzId: string) => void;
}

const DOSYA_TURLERI = "application/pdf,image/png,image/jpeg,image/webp";
const yaziAlani = (hedef: EventTarget | null) =>
  hedef instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(hedef.tagName);

type Arac = "kirp" | "silgi";
/** 0: şıklar görselin içinde. 4/5: yalnızca kök kırpılır, şıkları uygulama basar. */
type SikModu = 0 | 4 | 5;

/** Kaynak kütüphanesi, sayfa üstünde kırpma ve soru havuzu. */
export function HavuzGorunumu(p: Props) {
  const [aktifId, setAktifId] = useState<string | null>(p.kaynaklar[0]?.id ?? null);
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<CizilmisSayfa | null>(null);
  const [yenileme, setYenileme] = useState(0);
  const [hata, setHata] = useState<string | null>(null);
  const [secim, setSecim] = useState<Secim | null>(null);
  const [ciziliyor, setCiziliyor] = useState(false);
  const [arac, setArac] = useState<Arac>("kirp");
  const [sikModu, setSikModu] = useState<SikModu>(5);
  const [bildirim, setBildirim] = useState("");
  const tuvalYuvasi = useRef<HTMLDivElement>(null);
  const baslangic = useRef<{ x: number; y: number } | null>(null);

  const kaynak = p.kaynaklar.find((k) => k.id === aktifId);
  const belgedekiler = new Set((p.hedef?.bloklar ?? []).flatMap((b) => (b.tur === "gorselSoru" ? [b.havuzId] : [])));

  const kaynakAc = (id: string | null) => {
    setAktifId(id);
    setSayfaNo(1);
    setSecim(null);
  };
  const sayfayaGit = (no: number) => {
    if (!sayfa) return;
    setSayfaNo(Math.min(sayfa.sayfaSayisi, Math.max(1, no)));
    setSecim(null);
  };

  // Seçili kaynağın sayfasını çiz. `yenileme` silgiyle kapatılanları geri almak için sayfayı baştan çizdirir.
  useEffect(() => {
    setSayfa(null);
    setHata(null);
    if (!kaynak) return;
    let gecerli = true;
    sayfaCiz(kaynak, sayfaNo).then(
      (cizilen) => gecerli && setSayfa(cizilen),
      () => gecerli && setHata("Bu dosya açılamadı. Dosya bozuk ya da şifreli olabilir."),
    );
    return () => {
      gecerli = false;
    };
  }, [kaynak, sayfaNo, yenileme]);

  useEffect(() => {
    const yuva = tuvalYuvasi.current;
    if (!yuva || !sayfa) return;
    yuva.replaceChildren(sayfa.tuval);
  }, [sayfa]);

  const dosyaEkle = async (dosyalar: File[]) => {
    const ilk = await p.onKaynakEkle(dosyalar);
    if (ilk) kaynakAc(ilk.id);
  };

  const havuzaEkle = async (cevap?: number) => {
    if (!sayfa || !secim || !kaynak) return;
    const kirpinti = await kirp(sayfa.tuval, secim, sayfa.genislik);
    if (!kirpinti) {
      setBildirim("Seçilen alan boş görünüyor.");
      return;
    }
    const okunan = sikModu === 0 ? null : siklariBul(sayfa.metin, secim, sikModu);
    const siklar = sikModu === 0 ? undefined : (okunan ?? Array.from({ length: sikModu }, () => ""));
    p.onSoruEkle({
      id: crypto.randomUUID(),
      ...kirpinti,
      cevap,
      siklar,
      kaynakId: kaynak.id,
      kaynakAdi: kaynak.ad,
      sayfa: sayfaNo,
      eklenme: Date.now(),
    });
    setSecim(null);

    const parcalar = [`Soru eklendi (${cevap === undefined ? "cevapsız" : `cevap ${SIK_HARFLERI[cevap]}`}).`];
    if (siklar) {
      const bos = siklar.filter((sik) => !sik).length;
      if (bos === 0) parcalar.push("Şıklar PDF'ten okundu.");
      else if (bos === siklar.length) parcalar.push("Şık metinleri okunamadı; belgede soruya tıklayıp yazın.");
      else parcalar.push(`${bos} şık okunamadı; belgede soruya tıklayıp tamamlayın.`);
    }
    setBildirim(parcalar.join(" "));
  };

  // Klavye: seçim varken A–E cevabı işaretleyip ekler; ok tuşları sayfa değiştirir.
  useEffect(() => {
    const tus = (olay: KeyboardEvent) => {
      if (yaziAlani(olay.target) || olay.ctrlKey || olay.metaKey || olay.altKey) return;
      const harf = SIK_HARFLERI.indexOf(olay.key.toUpperCase() as (typeof SIK_HARFLERI)[number]);
      if (secim && harf >= 0 && harf < (sikModu || 5)) void havuzaEkle(harf);
      else if (secim && olay.key === "Enter") void havuzaEkle();
      else if (olay.key === "Escape") setSecim(null);
      else if (olay.key === "ArrowRight" || olay.key === "PageDown") sayfayaGit(sayfaNo + 1);
      else if (olay.key === "ArrowLeft" || olay.key === "PageUp") sayfayaGit(sayfaNo - 1);
      else return;
      olay.preventDefault();
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  });

  // Ekran görüntüsü doğrudan yapıştırılabilir.
  useEffect(() => {
    const yapistir = (olay: ClipboardEvent) => {
      const dosyalar = [...(olay.clipboardData?.files ?? [])];
      if (dosyalar.length > 0) void dosyaEkle(dosyalar);
    };
    window.addEventListener("paste", yapistir);
    return () => window.removeEventListener("paste", yapistir);
  });

  const konum = (olay: PointerEvent<HTMLDivElement>) => {
    const kutu = olay.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (olay.clientX - kutu.left) / kutu.width)),
      y: Math.min(1, Math.max(0, (olay.clientY - kutu.top) / kutu.height)),
    };
  };
  const cizmeyeBasla = (olay: PointerEvent<HTMLDivElement>) => {
    if (olay.button !== 0) return;
    olay.currentTarget.setPointerCapture(olay.pointerId);
    baslangic.current = konum(olay);
    setCiziliyor(true);
    setSecim(null);
  };
  const ciz = (olay: PointerEvent<HTMLDivElement>) => {
    const b = baslangic.current;
    if (!b) return;
    const k = konum(olay);
    setSecim({ x: Math.min(b.x, k.x), y: Math.min(b.y, k.y), w: Math.abs(k.x - b.x), h: Math.abs(k.y - b.y) });
  };
  const cizmeyiBitir = () => {
    baslangic.current = null;
    setCiziliyor(false);
    if (arac === "silgi") {
      // Silgi: çizilen alan sayfa tuvalinde beyaza boyanır; sonraki kırpıntılarda görünmez.
      if (sayfa && secim) {
        const { width, height } = sayfa.tuval;
        const cizim = sayfa.tuval.getContext("2d")!;
        cizim.fillStyle = "#fff";
        cizim.fillRect(secim.x * width, secim.y * height, secim.w * width, secim.h * height);
      }
      setSecim(null);
      return;
    }
    // Yanlışlıkla tıklama seçim sayılmasın.
    setSecim((s) => (s && s.w > 0.01 && s.h > 0.01 ? s : null));
  };

  const adim = !kaynak ? 1 : arac === "silgi" ? 0 : secim && !ciziliyor ? 3 : 2;
  const dosyaGirdisi = (
    <input
      type="file"
      accept={DOSYA_TURLERI}
      multiple
      hidden
      onChange={(olay) => {
        void dosyaEkle([...(olay.target.files ?? [])]);
        olay.target.value = "";
      }}
    />
  );

  return (
    <div className="ekran">
      <header className="ust">
        <button type="button" onClick={p.onGeri}>
          ← {p.hedef ? "Belgeye dön" : "Belgelerim"}
        </button>
        <div className="ust-baslik">
          <strong>PDF'ten soru kırp</strong>
          <span className="ipucu kisalt">
            {p.hedef
              ? `Kırptığınız sorular havuza ve “${p.hedef.baslik}” belgesine eklenir.`
              : "Kırptığınız sorular havuza eklenir; sonra istediğiniz teste koyarsınız."}
          </span>
        </div>
      </header>

      <div className="havuz">
        <section className="kirpma">
          <ol className="adimlar">
            <li className={adim === 1 ? "etkin" : ""}>
              <b>1</b> Dosya açın
            </li>
            <li className={adim === 2 ? "etkin" : ""}>
              <b>2</b> {sikModu === 0 ? "Soruyu şıklarıyla" : "Yalnızca soruyu (şıksız)"} çerçeveleyin
            </li>
            <li className={adim === 3 ? "etkin" : ""}>
              <b>3</b> Doğru cevabı seçin
            </li>
          </ol>

          <div className="kirpma-cubugu">
            <label className="onay">
              Dosya
              <select value={aktifId ?? ""} onChange={(olay) => kaynakAc(olay.target.value || null)}>
                {p.kaynaklar.length === 0 && <option value="">(henüz dosya yok)</option>}
                {p.kaynaklar.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ad}
                  </option>
                ))}
              </select>
            </label>
            <label className="dugme">
              + Dosya yükle
              {dosyaGirdisi}
            </label>
            {kaynak && (
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(`"${kaynak.ad}" kaldırılsın mı? Havuza alınmış sorular kalır.`)) return;
                  p.onKaynakSil(kaynak.id);
                  kaynakAc(p.kaynaklar.find((k) => k.id !== kaynak.id)?.id ?? null);
                }}
              >
                Dosyayı kaldır
              </button>
            )}
          </div>

          {!kaynak ? (
            <label className="bos dugme">
              <strong>PDF ya da görsel yükleyin</strong>
              <span>Soru bankası, deneme, kitap sayfası fotoğrafı… Ekran görüntüsünü Ctrl+V ile de yapıştırabilirsiniz. Dosya bu cihazda kalır.</span>
              {dosyaGirdisi}
            </label>
          ) : (
            <>
              <div className="kirpma-cubugu">
                <div className="grup">
                  <button type="button" onClick={() => sayfayaGit(sayfaNo - 1)} disabled={sayfaNo <= 1} aria-label="Önceki sayfa">
                    ‹
                  </button>
                  <label className="sayfa-no">
                    Sayfa
                    <input
                      type="number"
                      min={1}
                      max={sayfa?.sayfaSayisi ?? 1}
                      value={sayfaNo}
                      onChange={(olay) => sayfayaGit(Number(olay.target.value) || 1)}
                      aria-label="Sayfa"
                    />
                    / {sayfa?.sayfaSayisi ?? "…"}
                  </label>
                  <button
                    type="button"
                    onClick={() => sayfayaGit(sayfaNo + 1)}
                    disabled={!sayfa || sayfaNo >= sayfa.sayfaSayisi}
                    aria-label="Sonraki sayfa"
                  >
                    ›
                  </button>
                </div>
                <label className="onay">
                  Şıklar
                  <select value={sikModu} onChange={(olay) => setSikModu(Number(olay.target.value) as SikModu)}>
                    <option value={5}>Uygulama bassın (5 şık)</option>
                    <option value={4}>Uygulama bassın (4 şık)</option>
                    <option value={0}>Görselin içinde kalsın</option>
                  </select>
                </label>
                <div className="grup" role="group" aria-label="Araç">
                  <button type="button" aria-pressed={arac === "kirp"} onClick={() => setArac("kirp")}>
                    Kırp
                  </button>
                  <button
                    type="button"
                    aria-pressed={arac === "silgi"}
                    title="Eski soru numarası gibi istenmeyen yerleri beyaza boyar"
                    onClick={() => {
                      setArac("silgi");
                      setSecim(null);
                    }}
                  >
                    Silgi
                  </button>
                </div>
                {arac === "silgi" && (
                  <button type="button" onClick={() => setYenileme((y) => y + 1)}>
                    Silinenleri geri getir
                  </button>
                )}
              </div>

              <p className="durum" aria-live="polite">
                {arac === "silgi"
                  ? "Silgi açık: kapatmak istediğiniz yerin (eski soru numarası, kenar çizgisi) üstüne dikdörtgen çizin. Bitince “Kırp”a dönün."
                  : bildirim || "Fareyle sorunun etrafına dikdörtgen çizin."}
              </p>

              {hata && <p className="uyari">{hata}</p>}
              {!sayfa && !hata && <p className="ipucu">Sayfa hazırlanıyor…</p>}
              <div className="sayfa-alani" hidden={!sayfa}>
                <div ref={tuvalYuvasi} />
                <div
                  className={`ortu ${arac}`}
                  onPointerDown={cizmeyeBasla}
                  onPointerMove={ciz}
                  onPointerUp={cizmeyiBitir}
                  onPointerCancel={cizmeyiBitir}
                >
                  {secim && (
                    <div
                      className="secim"
                      style={{ left: `${secim.x * 100}%`, top: `${secim.y * 100}%`, width: `${secim.w * 100}%`, height: `${secim.h * 100}%` }}
                    />
                  )}
                  {secim && !ciziliyor && arac === "kirp" && (
                    // Seçimin hemen altında (yer yoksa üstünde) açılan cevap kutusu.
                    <div
                      className="secim-kutusu"
                      style={{
                        // Sağ yarıdaki seçimde kutu sağa yaslanır; sayfanın dışına taşmasın.
                        ...(secim.x > 0.4 ? { right: `${(1 - secim.x - secim.w) * 100}%` } : { left: `${secim.x * 100}%` }),
                        ...(secim.y + secim.h > 0.88
                          ? { bottom: `${(1 - secim.y) * 100}%` }
                          : { top: `${(secim.y + secim.h) * 100}%` }),
                      }}
                      onPointerDown={(olay) => olay.stopPropagation()}
                    >
                      <span>Doğru cevap?</span>
                      <div className="grup">
                        {SIK_HARFLERI.slice(0, sikModu || 5).map((harf, i) => (
                          <button key={harf} type="button" onClick={() => void havuzaEkle(i)}>
                            {harf}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={() => void havuzaEkle()}>
                        Bilmiyorum, yine de ekle
                      </button>
                      <button type="button" className="ikon" aria-label="Seçimden vazgeç" onClick={() => setSecim(null)}>
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="sorular">
          <h2>Havuzdaki sorular ({p.havuz.length})</h2>
          {p.havuz.length === 0 && <p className="ipucu">Kırptığınız sorular burada birikir ve her belgede yeniden kullanılır.</p>}
          <ul className="kartlar">
            {[...p.havuz].reverse().map((soru) => (
              <li key={soru.id}>
                <img src={gorselAdresi(soru.gorsel)} alt="" loading="lazy" />
                {soru.siklar && (
                  <p className="ipucu kisalt">{soru.siklar.map((sik, i) => `${SIK_HARFLERI[i]}) ${sik || "…"}`).join("  ")}</p>
                )}
                <div className="kart-alt">
                  <span className="ipucu">Cevap</span>
                  <CevapSecici deger={soru.cevap} adet={soru.siklar?.length} onSec={(cevap) => p.onSoruCevap(soru.id, cevap)} />
                </div>
                <div className="kart-alt">
                  {p.hedef &&
                    (belgedekiler.has(soru.id) ? (
                      <span className="rozet">Belgede</span>
                    ) : (
                      <button type="button" onClick={() => p.onBelgeyeEkle(soru.id)}>
                        Belgeye ekle
                      </button>
                    ))}
                  <button type="button" onClick={() => p.onSoruSil(soru.id)}>
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
