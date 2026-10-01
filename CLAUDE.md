# Kâğıt Atölyesi — çalışma kuralları

Öğretmenler için tarayıcıda çalışan föy/test dizgi aracı. Vite + React + TypeScript, Dexie, KaTeX. Sunucu yok.

## Kurallar

- Kod içi adlar (dosya, değişken, tip, CSS sınıfı) ve yorumlar Türkçe; Türkçe karakter yalnızca yorum ve metinlerde, adlarda ASCII (`olcum`, `sutun`).
- `src/dizgi/sayfala.ts` saf kalır: DOM, React ve şablon bilgisi içermez. Her davranış değişikliği `sayfala.test.ts`'e test ekler.
- Kâğıdın görünümü yalnızca `src/sablon/*.css` içinde; aileye özel her kural `.t-<aile>` ile başlar. Renkler `--a` (vurgu) ve `--b` (ikincil) değişkenlerinden gelir, sabit renk yazılmaz.
- Blokların dikey boşluğu marj ile değil sütunun `gap`'i ile verilir (`BLOK_BOSLUGU`); yoksa ölçüm ile basım ayrışır.
- Ölçüm ve basım aynı `Sayfa` bileşenini kullanır. Sütun genişliğini değiştiren bir stil (kenarlık, dolgu) iki sütuna simetrik uygulanır.
- Yazı tipleri yalnızca açık lisanslı ve `@fontsource` üzerinden gömülü; dış CDN yok.
- Başka ürünlerin adı, metni ve tasarımı kullanılmaz.

## Yeni blok türü eklemek

1. `src/model/tipler.ts` içindeki `Blok` birleşimine ekle.
2. `src/bilesen/BlokGorunum.tsx` içindeki `switch`'e görünümünü ekle (TypeScript eksik dalı yakalar).
3. `src/duzenleyici/Duzenleyici.tsx` içinde palete (`ANLATIM`), `ozet`'e ve `form`'a ekle.
4. Her şablon ailesinin CSS'ine stilini ekle.

## Komutlar

- `npm run dev` · `npm test` · `npm run typecheck` · `npm run build`
