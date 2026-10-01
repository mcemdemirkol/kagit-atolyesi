import { useState } from "react";
import { Dizgi } from "../dizgi/Dizgi";
import { Duzenleyici } from "../duzenleyici/Duzenleyici";
import type { Belge, HavuzSorusu, Marka } from "../model/tipler";

interface Props {
  belge: Belge;
  marka: Marka;
  onGeri: () => void;
  onDegistir: (degisiklik: Partial<Belge>) => void;
  onMarkaDegistir: (degisiklik: Partial<Marka>) => void;
  onHavuzGuncelle: (havuzId: string, degisiklik: Partial<HavuzSorusu>) => void;
  onKirpmayaGit: () => void;
}

/** Bir belgenin düzenlendiği ekran: solda düzenleyici, sağda canlı kâğıt. */
export function BelgeEkrani({ belge, marka, onGeri, onDegistir, onMarkaDegistir, onHavuzGuncelle, onKirpmayaGit }: Props) {
  const [seciliId, setSeciliId] = useState<string | null>(null);

  return (
    <div className="ekran">
      <header className="ust">
        <button type="button" onClick={onGeri}>
          ← Belgelerim
        </button>
        <input
          className="baslik-girdisi"
          value={belge.baslik}
          onChange={(olay) => onDegistir({ baslik: olay.target.value })}
          aria-label="Belge başlığı"
          placeholder="Belge başlığı"
        />
        <button type="button" className="birincil" onClick={() => window.print()}>
          Yazdır / PDF
        </button>
      </header>
      <div className="calisma">
        <Duzenleyici
          belge={belge}
          marka={marka}
          seciliId={seciliId}
          onSec={setSeciliId}
          onDegistir={onDegistir}
          onMarkaDegistir={onMarkaDegistir}
          onHavuzGuncelle={onHavuzGuncelle}
          onKirpmayaGit={onKirpmayaGit}
        />
        <Dizgi belge={belge} marka={marka} seciliId={seciliId} onBlokSec={setSeciliId} />
      </div>
    </div>
  );
}
