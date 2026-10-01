import type { Marka } from "../model/tipler";

interface Props {
  marka: Marka;
  onDegistir: (degisiklik: Partial<Marka>) => void;
}

const LOGO_SINIRI = 400_000;

/** Kurum kimliği: bir kez girilir, bütün belgelerin başlığında ve alt bilgisinde basılır. */
export function MarkaFormu({ marka, onDegistir }: Props) {
  const logoYukle = (dosya: File | undefined) => {
    if (!dosya) return;
    if (dosya.size > LOGO_SINIRI) {
      window.alert("Logo dosyası 400 KB'den küçük olmalı.");
      return;
    }
    const okuyucu = new FileReader();
    okuyucu.onload = () => onDegistir({ logo: okuyucu.result as string });
    okuyucu.readAsDataURL(dosya);
  };
  const alan = (etiket: string, anahtar: "kurum" | "ogretmen" | "iletisim" | "logoMetni") => (
    <label className="alan">
      {etiket}
      <input value={marka[anahtar]} onChange={(olay) => onDegistir({ [anahtar]: olay.target.value })} />
    </label>
  );

  return (
    <div className="form">
      <div className="ikili">
        {alan("Kurum / okul adı", "kurum")}
        {alan("Öğretmen adı", "ogretmen")}
      </div>
      {alan("İletişim satırı (alt bilgide basılır)", "iletisim")}
      <div className="ikili">
        {alan("Logo kısaltması", "logoMetni")}
        <div className="alan">
          Logo görseli
          <div className="satir-arasi">
            <label className="dugme">
              {marka.logo ? "Değiştir" : "Yükle"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                hidden
                onChange={(olay) => logoYukle(olay.target.files?.[0])}
              />
            </label>
            {marka.logo && (
              <button type="button" onClick={() => onDegistir({ logo: undefined })}>
                Kaldır
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="ikili">
        <label className="alan">
          Vurgu rengi
          <input type="color" value={marka.vurgu} onChange={(olay) => onDegistir({ vurgu: olay.target.value })} />
        </label>
        <label className="alan">
          İkincil renk
          <input type="color" value={marka.ikincil} onChange={(olay) => onDegistir({ ikincil: olay.target.value })} />
        </label>
      </div>
    </div>
  );
}
