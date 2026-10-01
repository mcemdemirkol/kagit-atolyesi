# Kâğıt Atölyesi

Öğretmenler için açık kaynak dizgi aracı. Kendi anlatımınızı ve sorularınızı yazarsınız; uygulama bunları kurumunuzun kimliğiyle, baskıya hazır A4 sayfalara dizer.

Tamamen tarayıcıda çalışır. Sunucu, hesap ve ödeme yoktur; belgeler cihazınızdaki IndexedDB'de kalır.

**Canlı sürüm:** https://mcemdemirkol.github.io/kagit-atolyesi/

> Sürüm 0.1 — ilk kullanılabilir sürüm. Yedekleme henüz yok: tarayıcı verisini silerseniz belgeler ve havuz da silinir.

## Şu an neler var

- **Konu föyü ve yaprak test** önizlemesi, tek ya da iki sütun
- **İki şablon ailesi:** Canlı ve Teknik
- **Dizgi motoru:** blokları ölçer, sütunlara ve sayfalara dağıtır; ara başlığı sütun dibinde yalnız bırakmaz
- **Formül:** metin içinde `$...$` arası KaTeX ile basılır
- **Kaynak kütüphanesi:** PDF kitap, görsel ya da yapıştırılan ekran görüntüsü tarayıcıda saklanır
- **Soru kırpma:** sayfada dikdörtgen çizip doğru cevabı seçince soru havuza ve açık belgeye eklenir; etrafındaki boşluk kendiliğinden atılır
- **Şıkları uygulama basar:** yalnızca soru kökünü kırpmak yeter; şıklar PDF'in metin katmanından okunur (okunamayanlar elle yazılır) ve bütün sorularda aynı düzende basılır
- **Silgi:** kırpmadan önce eski soru numarası gibi istenmeyen yerler kapatılır
- **Kurum kimliği:** kurum, öğretmen, iletişim, logo ve renkler bir kez girilir
- **Soru havuzu:** kırpılan sorular birikir, her belgede yeniden kullanılır
- **Düzenleyici:** sol panelden soru ya da konu anlatımı bloğu ekleme, metin/şık/doğru cevap düzenleme, sıralama, silme; kâğıtta bloğa tıklayınca formu açılır
- **Cevap anahtarı:** isteğe bağlı, son sayfanın dibinde tek şerit olarak basılır
- **Çıktı:** tarayıcının yazdırma penceresinden A4 PDF

## Yol haritası

- [ ] Sütuna sığmayan bloğu bölme
- [ ] Havuzda etiket, konu ve arama
- [ ] Föye numarasız görsel ekleme
- [ ] Yedekleme: belgeleri ve havuzu dosyaya kaydetme
- [ ] Öğrenci/öğretmen sürümü (çözümleri gizleme)
- [ ] Sade ve Akademik şablon aileleri
- [ ] PWA

## Nasıl kullanılır

1. Ana sayfadan **Yaprak Test** ya da **Konu Föyü** seçin.
2. Testte **PDF'ten kırp** ile kaynağınızı açın, sorunun etrafına dikdörtgen çizin ve doğru cevabı seçin. Föyde soldaki listeden anlatım bloklarını ekleyip yazın.
3. **Görünüm ve ayarlar** sekmesinden şablonu, sütun sayısını ve kurum bilgilerinizi ayarlayın.
4. **Yazdır / PDF** ile çıktı alın. Yazdırma penceresinde kenar boşluğunu "Yok", "Arka plan grafikleri"ni açık seçin.

## Geliştirme

```bash
npm install
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

## Mimari

| Klasör | İçerik |
|---|---|
| `src/model` | Veri tipleri (`Belge`, `Blok`, `Marka`) ve örnek belgeler |
| `src/dizgi` | Dizgi motoru: `sayfala.ts` saf yerleşim fonksiyonu, `Dizgi.tsx` ölçüm ve basım |
| `src/bilesen` | Kâğıt bileşenleri: `Sayfa`, `BlokGorunum` |
| `src/sablon` | Şablon ailelerinin CSS'i |
| `src/ekran` | Ana sayfa ve belge ekranı |
| `src/duzenleyici` | Belge ekranının sol paneli: İçerik ve Görünüm sekmeleri, blok formları |
| `src/havuz` | Kaynak çizimi (pdf.js), kırpma, soru havuzu arayüzü |
| `src/depo` | IndexedDB katmanı (Dexie) |
| `taslaklar` | Şablonların ilk statik HTML taslakları |

Dizgi iki katmanla çalışır: görünmez bir ölçüm katmanında bütün bloklar gerçek sütun genişliğinde dizilip yükseklikleri okunur, sonra `sayfala()` bu yüksekliklerle blokları sütunlara dağıtır. Ölçüm ve basım aynı `Sayfa` bileşenini kullandığı için ölçülen ile basılan aynıdır.

## Telif notu

Uygulama içerik sağlamaz; yüklediğiniz kaynakların kullanım hakkı sizin sorumluluğunuzdadır. Başkasına ait yayınlardan kırpılan soruları çoğaltmadan önce telif durumunu kontrol edin.

## Lisans

MIT. Gömülü yazı tipleri (Nunito, Baloo 2, Space Grotesk, JetBrains Mono) SIL Open Font License ile dağıtılır.
