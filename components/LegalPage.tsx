import React, { useState } from 'react';
import { ArrowLeft, Scale } from 'lucide-react';

interface LegalPageProps {
    onBack: () => void;
    initialTab?: string;
}

const legalTabs = [
    { id: 'teslimat', label: 'Teslimat ve İade' },
    { id: 'mesafeli', label: 'Mesafeli Satış' },
    { id: 'hizmet', label: 'Hizmet Şartları' },
    { id: 'cerez', label: 'Çerez Politikası' },
    { id: 'aydinlatma', label: 'Aydınlatma Metni' },
    { id: 'acik-riza', label: 'Açık Rıza Metni' },
];

const TeslimatContent = () => (
    <div className="legal-content">
        <h1>Teslimat ve İade Şartları</h1>
        <p>İşbu "Teslimat ve İade Şartları" metni, XXXXXXXXX ("Şirket") tarafından sunulan İmarMevzuat.ai Platformu'na ("Hizmet") ilişkin teslimat, iptal ve iade koşullarını düzenler. Bu metin, Platform'da yayınlanan "Hizmet Şartları ve Kullanıcı Sözleşmesi" ve "Mesafeli Satış Sözleşmesi"nin ayrılmaz bir parçasıdır.</p>

        <h2>Madde 1: Hizmetin Teslimatı ve İfası</h2>
        <p><strong>1.1. Anında İfa ve Elektronik Teslimat:</strong> İmarMevzuat.ai, elektronik ortamda anında ifa edilen dijital bir içerik hizmetidir. Satın alınan abonelik paketi ve bu pakete dahil olan kullanım hakları, ödemenin başarılı bir şekilde tamamlanmasını takiben derhal aktive edilir ve Kullanıcı'nın (ALICI) hesabına tanımlanır. Fiziksel bir teslimat söz konusu değildir.</p>
        <p><strong>1.2. Kullanım Hakkı Tanımlaması ve Kullanıma Hazır Olma:</strong> Aylık abonelik paketine ait kullanım hakları, ödeme başarılı olur olmaz Kullanıcı'nın Platform üzerindeki panelinde görünür hale gelir ve kullanıma hazır olur.</p>

        <h2>Madde 2: Aboneliğin İptali</h2>
        <p><strong>2.1. İptal Hakkı ve Süreci:</strong> Kullanıcı (ALICI), devam eden aboneliğini herhangi bir gerekçe göstermeksizin ve ceza ödemeksizin iptal etme hakkına sahiptir. İptal işlemi, platform üzerindeki abonelik yönetimi sayfasından veya XXXXXXXXX e-posta adresine bildirimde bulunularak gerçekleştirilebilir.</p>
        <p><strong>2.2. İptal Talebinin İşleme Alınması ve Teyidi:</strong> Fesih bildiriminin Şirket'e ulaştığı tarihten itibaren en geç 7 (yedi) gün içinde abonelik yenilemesi durdurulur ve bu durum Kullanıcı'ya kalıcı veri saklayıcısı (e-posta vb.) ile teyit edilir.</p>
        <p><strong>2.3. İptalin Yürürlüğe Girmesi:</strong> İptal işlemi, mevcut fatura döneminin sonunda yürürlüğe girer. Kullanıcı, mevcut fatura dönemi sonuna kadar hizmetten yararlanmaya devam edebilir.</p>

        <h2>Madde 3: Cayma Hakkı İstisnası</h2>
        <p><strong>3.1. Yasal Dayanak ve Kapsam:</strong> Satın alınan hizmet, "elektronik ortamda anında ifa edilen bir hizmet" niteliğinde olduğundan, Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca Kullanıcı'nın (ALICI) yasal cayma hakkı bulunmamaktadır.</p>
        <p><strong>3.2. Kullanıcının Açık Muvafakati:</strong> Kullanıcı (ALICI), siparişi tamamlayarak ve sipariş ekranında sunulacak olan onay kutucuğunu işaretleyerek hizmetin ifasına derhal başlanacağını ve bu nedenle mevzuat uyarınca cayma hakkını kullanamayacağını peşinen ve geri dönülmez biçimde kabul, beyan ve taahhüt eder.</p>

        <h2>Madde 4: Ücret İadesi Koşulları</h2>
        <p><strong>4.1. Genel Kural:</strong> Madde 3'te belirtilen cayma hakkı istisnası ve aşağıda belirtilen istisnai haller saklı kalmak kaydıyla, satın alınan abonelikler için ücret iadesi yapılmaz.</p>
        <p><strong>4.2. İade Yapılacak İstisnai Haller:</strong> Ücret iadesi yalnızca aşağıdaki durumlarda mümkündür:</p>
        <ul>
            <li>Kullanıcı'nın ödeme yönteminden hatalı veya mükerrer bir ücret tahsil edilmesi.</li>
            <li>Ayıplı ifa nedeniyle Kullanıcı'nın sözleşmeden dönme hakkını kullanması.</li>
            <li>Şirket'in ücretli bir hizmeti Kullanıcı aleyhine esaslı bir şekilde değiştirmesi veya tamamen sonlandırması durumunda, Şirket'in takdirine bağlı olarak kullanılmayan süreye tekabül eden ücretin kısmi iadesi.</li>
        </ul>

        <h2>Madde 5: Ayıplı İfa ve Telafi Yöntemleri</h2>
        <p><strong>5.1.</strong> Şirket'ten kaynaklanan ve hizmetten yararlanmayı esaslı şekilde engelleyen plansız ve kesintisiz hizmet kesintileri ayıplı ifa olarak kabul edilir.</p>
        <p><strong>5.2. Ayıplı İfa Sayılmayan Haller:</strong></p>
        <ul>
            <li>Yapay zeka çıktılarının olasılıksal doğası gereği hatalı, eksik veya güncel olmayan bilgiler içermesi.</li>
            <li>Önceden bildirilen planlı bakım ve güncelleme çalışmaları.</li>
            <li>Şirket'in makul kontrolü dışındaki üçüncü taraf hizmet sağlayıcılardan kaynaklanan sorunlar.</li>
            <li>Kullanıcı'nın kendi donanım, yazılım veya internet bağlantısından kaynaklanan erişim sorunları.</li>
            <li>Hizmetin genel işleyişini esaslı şekilde etkilemeyen anlık veya kısa süreli yavaşlamalar.</li>
        </ul>

        <h2>Madde 6: Kullanılmayan Kullanım Hakları</h2>
        <p><strong>6.1.</strong> Aboneliğin iptal edilmesi veya herhangi bir nedenle sona ermesi durumunda, kullanılmayan kullanım hakları bir sonraki aya veya döneme devretmez.</p>
        <p><strong>6.2.</strong> Kullanım hakları hiçbir surette nakde çevrilemez, satılamaz veya iadesi talep edilemez.</p>

        <h2>Madde 7: Çeşitli Hükümler</h2>
        <p><strong>7.1.</strong> İşbu belge, "Hizmet Şartları ve Kullanıcı Sözleşmesi" ve "Mesafeli Satış Sözleşmesi" ile bir bütün olup, bu belgelerde yer alan hükümlerle birlikte yorumlanır.</p>
        <p><strong>7.2.</strong> Şirket, işbu Teslimat ve İade Şartları'nı dilediği zaman tek taraflı olarak değiştirme hakkını saklı tutar. Değişiklikler, Platform'da yayınlandığı tarihten itibaren geçerli olur.</p>
        <p><strong>7.3. İletişim:</strong> Bu şartlarla ilgili tüm sorularınız ve bildirimleriniz için XXXXXXXXX e-posta adresi üzerinden Şirket ile iletişime geçebilirsiniz.</p>
    </div>
);

const MesafeliContent = () => (
    <div className="legal-content">
        <h1>Mesafeli Satış Sözleşmesi</h1>

        <h2>1. TARAFLAR</h2>
        <h3>1.1. SATICI / HİZMET SAĞLAYICI</h3>
        <ul>
            <li>Unvan: XXXXXXXXX</li>
            <li>MERSİS No: XXXXXXXXX</li>
            <li>Vergi Dairesi / No: XXXXXXXXX</li>
            <li>Adres: XXXXXXXXX</li>
            <li>Telefon: XXXXXXXXX</li>
            <li>E-posta: XXXXXXXXX</li>
        </ul>
        <h3>1.2. ALICI / TÜKETİCİ</h3>
        <ul>
            <li>Adı Soyadı: [Alıcının Adı Soyadı]</li>
            <li>Adres: [Alıcının Adresi]</li>
            <li>Telefon: [Alıcının Telefon Numarası]</li>
            <li>E-posta: [Alıcının E-posta Adresi]</li>
        </ul>

        <h2>2. SÖZLEŞMENİN KONUSU VE KAPSAMI</h2>
        <p>İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait İmarMevzuat.ai internet sitesi ("Platform") üzerinden elektronik ortamda siparişini yaptığı, nitelikleri ve satış fiyatı belirtilen hizmetin satışı ve ifası ile ilgili olarak tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>

        <h2>3. HİZMETİN TANIMI VE KREDİ KULLANIMI</h2>
        <p><strong>3.1.</strong> İmarMevzuat.ai, yapay zeka tabanlı bir sohbet robotu aracılığıyla imar mevzuatı araştırma yapma, mevzuat analizi, belge yükleme ve semantik arama gibi çeşitli işlemleri gerçekleştirmeye imkan sunan dijital bir hizmettir.</p>
        <p><strong>3.2.</strong> Hizmet Paketi: Günlük kullanım haklı Abonelik Paketi. Kullanım hakkı, hizmetin ölçüm birimidir; nakde çevrilemez, satılamaz ve bir sonraki aya devretmez.</p>

        <h2>4. ÜCRET, FATURALAMA VE ÖDEME</h2>
        <p><strong>4.1.</strong> Hizmet bedeli Platform üzerinde güncel olarak ilan edilir.</p>
        <p><strong>4.2.</strong> Ödemeler Kredi Kartı, Banka Kartı veya Havale/EFT ile yapılabilir.</p>
        <p><strong>4.3.</strong> Olası fiyat değişiklikleri, bir sonraki yenileme döneminden en az 15 gün önce ALICI'ya bildirilir.</p>
        <p><strong>4.4.</strong> Fatura, e-arşiv/e-fatura olarak düzenlenir ve ALICI'nın kayıtlı e-posta adresine gönderilir.</p>
        <p><strong>4.5.</strong> Hatalı veya çifte tahsilat yapılması durumunda, ALICI'nın bildirimi üzerine durum incelenir ve haksız olduğu tespit edilen tutar, bildirimi takip eden 7 iş günü içinde iade edilir.</p>

        <h2>5. CAYMA HAKKI İSTİSNASI</h2>
        <p>ALICI, satın alınan dijital hizmetin elektronik ortamda anında ifa edildiğini; bu nedenle Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca cayma hakkının bulunmadığını kabul ve beyan eder.</p>

        <h2>6. HİZMETİN NİTELİĞİ VE SORUMLULUK SINIRLARI</h2>
        <p><strong>6.1.</strong> ALICI'nın Platform'u kullanımına ilişkin tüm kurallar "Hizmet Şartları ve Kullanıcı Sözleşmesi"nde düzenlenmiştir.</p>
        <p><strong>6.2.</strong> İmarMevzuat.ai tarafından üretilen tüm çıktılar yalnızca bilgilendirme amaçlı birer taslak niteliğindedir. Bu çıktılar hiçbir şekilde hukuki tavsiye veya avukatlık hizmeti olarak yorumlanamaz.</p>
        <p><strong>6.3.</strong> ALICI, Platform'dan elde ettiği her türlü bilgiyi herhangi bir hukuki işlemde kullanmadan önce bir hukuk profesyonelinin denetiminden geçirmekle yükümlü olduğunu kabul eder.</p>

        <h2>7. ABONELİK YÖNETİMİ, İPTAL VE FESİH</h2>
        <p><strong>7.1.</strong> Abonelik, her dönem başında peşin tahsilat yapılarak otomatik olarak yenilenir. ALICI, aboneliğini herhangi bir ek ücret ödemeden iptal edebilir.</p>
        <p><strong>7.2.</strong> SATICI, ALICI'nın ödeme yükümlülüğünü yerine getirmemesi veya sözleşmeyi ihlal etmesi halinde hizmeti askıya alma veya sözleşmeyi feshetme hakkını saklı tutar.</p>

        <h2>8. KİŞİSEL VERİLERİN KORUNMASI</h2>
        <p>Kişisel verilerin işlenmesine ilişkin tüm detaylar, Platform'da yer alan "Aydınlatma Metni ve Gizlilik Politikası" ile "Çerez Politikası" içerisinde sunulmaktadır.</p>

        <h2>9. İÇERİK MÜLKİYETİ VE FİKRİ HAKLAR</h2>
        <p>Platform'un yazılımı, tasarımı ve diğer tüm unsurları üzerindeki fikri mülkiyet hakları SATICI'ya aittir.</p>

        <h2>10. HİZMET SEVİYESİ VE KESİNTİ</h2>
        <p><strong>10.1.</strong> SATICI, hizmetin %99 oranında erişilebilir olması için makul çabayı gösterir.</p>
        <p><strong>10.2.</strong> Üçüncü taraf hizmet sağlayıcılardan kaynaklanan sorunlar ve kısa süreli kesintiler ayıplı ifa olarak kabul edilmez.</p>
        <p><strong>10.3.</strong> 24 saati aşan plansız ve kesintisiz hizmet kesintileri ayıplı ifa olarak değerlendirilir.</p>

        <h2>11. TESLİMAT VE İADE POLİTİKASI</h2>
        <p><strong>11.1.</strong> Hizmet, ödemenin başarılı bir şekilde tamamlanmasını takiben elektronik ortamda anında ifa edilir.</p>
        <p><strong>11.2.</strong> İade ve iptale ilişkin tüm detaylı kurallar "Teslimat ve İade Şartları" metninde düzenlenmiştir.</p>

        <h2>12. SORUMLULUĞUN SINIRLANDIRILMASI</h2>
        <p>SATICI'nın işbu sözleşmeden kaynaklanan toplam mali sorumluluğu, zarara yol açan olayın meydana geldiği tarihten önceki son 12 ay içinde ALICI'nın ödediği toplam tutar ile sınırlıdır.</p>

        <h2>13. MÜCBİR SEBEPLER</h2>
        <p>Taraflar'ın kontrolü dışında gelişen doğal afetler, savaş, terör eylemleri, siber saldırılar, mevzuat değişiklikleri, genel salgın hastalık gibi haller mücbir sebep olarak kabul edilir.</p>

        <h2>14. BİLDİRİMLER VE DELİL SÖZLEŞMESİ</h2>
        <p>Taraflar, elektronik posta yazışmaları ve sistem kayıtlarının delil olarak ileri sürülebileceğini kabul eder.</p>

        <h2>15. UYUŞMAZLIK ÇÖZÜMÜ</h2>
        <p>Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınır dahilindeki uyuşmazlıklarda Tüketici Hakem Heyetleri görevlidir. Bu değeri aşan uyuşmazlıklarda tüketicinin yerleşim yeri veya satıcının yerleşim yeri mahkemeleri yetkilidir.</p>

        <h2>16. YÜRÜRLÜK VE ONAY</h2>
        <p>İşbu Sözleşme, ALICI tarafından elektronik ortamda okunup anlaşıldıktan sonra onaylanmasıyla yürürlüğe girer.</p>

        <p className="legal-company-info"><strong>SATICI:</strong> XXXXXXXXX<br /><strong>ALICI:</strong> [Alıcının Adı Soyadı]</p>
    </div>
);

const HizmetContent = () => (
    <div className="legal-content">
        <h1>Hizmet Şartları ve Kullanıcı Sözleşmesi</h1>
        <p>İşbu Kullanım Sözleşmesi XXXXXXXXX ("Şirket") tarafından sunulan İmarMevzuat.ai Platformu'nu kullanan siz değerli Kullanıcı ("Kullanıcı") arasında akdedilmiştir. Platformu kullanmanız, bu Sözleşme'deki şartları okuduğunuz, anladığınız ve kabul ettiğiniz anlamına gelir.</p>

        <h2>Madde 1: Tanımlar</h2>
        <ul>
            <li><strong>Platform / İmarMevzuat.ai:</strong> Şirket tarafından işletilen, yapay zeka destekli imar mevzuatı araştırma, analiz ve taslak metin oluşturma hizmetleri sunan çevrimiçi uygulama ve bağlantılı tüm hizmetler.</li>
            <li><strong>Kullanıcı:</strong> Platform'a erişen, üye olan ve/veya Platform tarafından sunulan hizmetlerden yararlanan her türlü gerçek veya tüzel kişi.</li>
            <li><strong>Hizmet/Hizmetler:</strong> Platform üzerinden Kullanıcı'ya sunulan tüm yapay zeka tabanlı araçlar, içerikler ve destekleyici servisler.</li>
            <li><strong>Girdi (Input):</strong> Kullanıcı tarafından Platform'a yüklenen, yazılan veya herhangi bir şekilde iletilen her türlü veri, dosya, soru, bilgi ve doküman.</li>
            <li><strong>Çıktı (Output):</strong> Kullanıcı'nın Girdi'sine karşılık olarak Platform tarafından üretilen yapay zeka tabanlı analizler, metinler, özetler ve diğer tüm sonuçlar.</li>
            <li><strong>İçerik:</strong> Girdi ve Çıktı'nın tamamını kapsayan her türlü bilgi ve veri.</li>
        </ul>

        <h2>Madde 2: Hizmetin Niteliği ve Sorumluluk Reddi</h2>
        <p><strong>2.1.</strong> İmarMevzuat.ai, bir hukuki danışmanlık, avukatlık veya hukuki temsil hizmeti VERMEZ. Platform tarafından sunulan Hizmetler ve üretilen Çıktılar, yalnızca bilgilendirme, hukuki araştırma desteği, analiz yardımı ve taslak metin oluşturma amacı taşır.</p>
        <p><strong>2.2.</strong> İmarMevzuat.ai, yapay zeka tarafından üretilen Çıktıların doğruluğu, hatasızlığı, eksiksizliği, güncelliği veya belirli bir amaca uygunluğuna dair herhangi bir garanti VERMEMEKTEDİR.</p>
        <p><strong>2.3.</strong> Kullanıcı, Platform'dan elde ettiği herhangi bir Çıktıyı, mutlaka kendi dikkatli değerlendirmesinden geçirmeyi ve/veya nitelikli bir hukuk profesyoneline danışarak teyit ettirmeden nihai bir hukuki karar için esas ALMAMAYI kabul ve taahhüt eder.</p>
        <p><strong>2.4.</strong> Kullanıcı, Platform'a müvekkillerine, üçüncü kişilere ait veya herhangi bir gizlilik yükümlülüğüne tabi olan hassas, gizli bilgileri veya özel nitelikli kişisel verileri yüklememesi gerektiğini kabul eder.</p>
        <p><strong>2.5.</strong> İmarMevzuat.ai, Hizmetler'in kesintisiz veya hatasız olacağını taahhüt etmez.</p>

        <h2>Madde 3: Kayıt, Hesap Güvenliği ve Kullanım Şartları</h2>
        <p><strong>3.1.</strong> Platform Hizmetleri'nden yararlanmak için Kullanıcı'nın bir hesap oluşturması gerekebilir. Kullanıcı, doğru, güncel ve eksiksiz bilgi vermeyi taahhüt eder.</p>
        <p><strong>3.2.</strong> Kullanıcı, hesap bilgilerinin gizliliğinden ve güvenliğinden münhasıran sorumludur.</p>
        <p><strong>3.3.</strong> Kullanıcı, Platform'u yalnızca yasal ve meşru amaçlar doğrultusunda kullanacağını kabul eder. Aşağıdaki eylemler kesinlikle yasaktır:</p>
        <ul>
            <li>Yürürlükteki herhangi bir yasa veya düzenlemeyi ihlal etmek.</li>
            <li>Başkalarının yasal haklarını ihlal etmek, taciz etmek, tehdit etmek veya zarar vermek.</li>
            <li>Zararlı, yasa dışı, aldatıcı, müstehcen veya uygunsuz İçerik oluşturmak.</li>
            <li>Platform'un kaynak koduna müdahale etmeye çalışmak, tersine mühendislik yapmak.</li>
            <li>Platform'un bütünlüğünü veya performansını bozacak herhangi bir faaliyette bulunmak.</li>
            <li>Otomatik veri çekme, veri madenciliği, bot kullanımı veya benzeri yöntemlerle yetkisiz veri toplamak.</li>
            <li>Platform ile doğrudan veya dolaylı olarak rekabet edecek hizmetler geliştirmek amacıyla Çıktı'yı kullanmak.</li>
        </ul>
        <p><strong>3.4. Yaş Sınırı:</strong> Kullanıcı, Platform'u kullanmak için en az 18 yaşında olduğunu beyan ve garanti eder.</p>

        <h2>Madde 4: Fikri Mülkiyet Hakları</h2>
        <p><strong>4.1.</strong> Platform'un kendisi (tüm yazılımlar, tasarımlar, markalar, logolar ve diğer tüm bileşenler) münhasıran Şirket'e aittir.</p>
        <p><strong>4.2.</strong> Kullanıcı, Platform'a yüklediği tüm Girdi üzerindeki haklara sahip olduğunu garanti eder.</p>
        <p><strong>4.3.</strong> Kullanıcı, Platform'dan aldığı Çıktı'nın sahibi olur. Ancak yapay zeka teknolojilerinin doğası gereği Çıktılar tamamen benzersiz olmayabilir.</p>

        <h2>Madde 5: Ücretlendirme ve Ödeme</h2>
        <p><strong>5.1.</strong> Platform'un bazı Hizmetler'i veya özellikleri ücretli abonelik planları gerektirebilir.</p>
        <p><strong>5.2.</strong> Kullanıcı, doğru fatura ve ödeme bilgilerini sağlamayı kabul eder.</p>
        <p><strong>5.3.</strong> Abonelikler, Kullanıcı tarafından iptal edilmediği sürece otomatik olarak yenilenecektir.</p>
        <p><strong>5.4.</strong> Ödeme yapılmaması durumunda Hizmet'e erişim durdurulabilir veya abonelik sonlandırılabilir.</p>
        <p><strong>5.5.</strong> Tüm ücretlere yürürlükteki vergiler dahil edilecektir.</p>
        <p><strong>5.6.</strong> Abonelik iptalleri, Platform üzerinden veya XXXXXXXXX adresine bildirimle gerçekleştirilebilir.</p>
        <p><strong>5.7.</strong> Fiyat değişiklikleri en az 30 gün önceden bildirilecektir.</p>

        <h2>Madde 6: Hizmetin Askıya Alınması ve Sona Erdirilmesi</h2>
        <p><strong>6.1.</strong> Şirket, Sözleşme hükümlerinin ihlali, yasalara aykırı faaliyetler, yanlış bilgi sağlanması veya güvenlik tehdidi durumlarında Kullanıcı'nın erişimini askıya alabilir veya sonlandırabilir.</p>
        <p><strong>6.2.</strong> Acil müdahale gerektiren durumlarda önceden bildirimde bulunmaksızın işlem yapılabilir.</p>
        <p><strong>6.3.</strong> Kullanıcı, dilediği zaman hesabını kapatarak Sözleşme'yi feshedebilir.</p>

        <h2>Madde 7: Sorumluluğun Sınırlandırılması</h2>
        <p><strong>7.1.</strong> Yürürlükteki yasaların izin verdiği azami ölçüde, Şirket, Platform'un kullanımından kaynaklanan herhangi bir doğrudan, dolaylı, arızi, özel veya sonuç niteliğindeki zararlardan sorumlu tutulamaz.</p>
        <p><strong>7.2.</strong> Şirket'in toplam mali sorumluluğu, zarara yol açan olaydan önceki 12 ay içinde Kullanıcı'nın ödediği toplam tutar ile sınırlıdır.</p>
        <p><strong>7.3.</strong> Bu sınırlamalar, Şirket'in ağır kusuru veya kastı sonucu oluşan zararlar için uygulanmaz.</p>

        <h2>Madde 8: Üçüncü Taraf Hizmetleri</h2>
        <p>Platform, Google Gemini API gibi üçüncü taraf yapay zeka modellerini ve Firebase gibi üçüncü taraf altyapılarını kullanabilir. Bu hizmetlerin içeriğinden veya işleyişinden Şirket sorumlu değildir.</p>

        <h2>Madde 9: Sözleşme Değişiklikleri</h2>
        <p>Şirket, işbu Sözleşme'yi dilediği zaman güncelleyebilir. Önemli değişiklikler en az 30 gün önceden bildirilecektir.</p>

        <h2>Madde 10: Mücbir Sebepler</h2>
        <p>Taraflardan herhangi birinin kontrolü dışında gelişen ve yükümlülüklerini yerine getirmesini engelleyen olaylar "Mücbir Sebep" olarak kabul edilir. Mücbir sebebin 30 günden fazla sürmesi halinde Sözleşme feshedilebilir.</p>

        <h2>Madde 11-17: Genel Hükümler</h2>
        <p><strong>Bildirimler:</strong> Tüm bildirimler yazılı olarak yapılacaktır. İletişim: XXXXXXXXX</p>
        <p><strong>Bölünebilirlik:</strong> Herhangi bir hükmün geçersiz bulunması diğer hükümleri etkilemez.</p>
        <p><strong>Uygulanacak Hukuk:</strong> İşbu Sözleşme'nin yorumlanmasında Türk Hukuku uygulanacaktır.</p>
        <p><strong>Yetkili Mahkeme:</strong> XXXXXXXXX Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.</p>
        <p><strong>Delil Sözleşmesi:</strong> Taraflar, sistem kayıtlarının kesin delil teşkil edeceğini kabul eder.</p>
        <p><strong>Yürürlük:</strong> Sözleşme, Kullanıcı'nın hesap oluşturmasıyla yürürlüğe girer.</p>

        <p className="legal-company-info"><strong>ŞİRKET BİLGİLERİ:</strong><br />
            Unvan: XXXXXXXXX<br />
            MERSİS No: XXXXXXXXX<br />
            Adres: XXXXXXXXX<br />
            E-posta: XXXXXXXXX</p>
    </div>
);

const CerezContent = () => (
    <div className="legal-content">
        <h1>Çerez Politikası</h1>
        <p>İşbu Çerez Politikası, XXXXXXXXX ("Şirket" veya "Veri Sorumlusu") olarak, veri sorumlusu sıfatıyla, İmarMevzuat.ai alan adlı web sitemizin ("Platform") kullanımı sırasında elde edilen kişisel verilerinizin çerezler aracılığıyla işlenmesine ilişkin olarak sizleri 6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") kapsamında bilgilendirmek amacıyla hazırlanmıştır.</p>

        <h2>1. Çerez Nedir ve Neden Kullanılır?</h2>
        <p>Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin daha verimli çalışmasını sağlamak, kullanıcı tercihlerini hatırlayarak kişiselleştirilmiş bir deneyim sunmak ve site sahiplerine anonim istatistiksel veriler sağlayarak hizmetlerini iyileştirme imkanı tanımak gibi amaçlarla kullanılır.</p>

        <h2>2. Kullandığımız Çerez Türleri ve Hukuki Sebepleri</h2>

        <h3>a) Zorunlu Çerezler</h3>
        <p>Platform'un güvenli bir şekilde çalışması ve temel fonksiyonlarının yerine getirilebilmesi için mutlaka kullanılması gereken çerezlerdir. Oturum devamlılığı, güvenlik doğrulaması ve çerez tercihlerinin kaydedilmesini sağlarlar.</p>
        <p><em>Hukuki Sebep:</em> Kanun'un 5. maddesinin 2. fıkrasının (c) bendi veya (f) bendi kapsamında işlenmektedir. Açık rıza aranmaz.</p>

        <h3>b) Analitik ve Performans Çerezleri</h3>
        <p>Platformu kaç kişinin ziyaret ettiğini, hangi sayfalarda ne kadar süre geçirildiğini anonim olarak ölçer. Toplanan veriler kişisel kimliğinizi ortaya çıkarmaz.</p>
        <p><em>Hukuki Sebep:</em> Kanun'un 5. maddesinin 1. fıkrası uyarınca açık rızanıza dayalıdır.</p>

        <h3>c) İşlevsel Çerezler</h3>
        <p>Dil seçimi gibi kişisel tercihlerinizi hatırlamak için kullanılır.</p>
        <p><em>Hukuki Sebep:</em> Kanun'un 5. maddesinin 1. fıkrası uyarınca açık rızanıza dayalıdır.</p>

        <h3>d) Hedefleme ve Reklam Çerezleri</h3>
        <p>İlgi alanlarınıza daha uygun reklamlar göstermek ve reklam kampanyalarının etkinliğini ölçmek amacıyla kullanılır.</p>
        <p><em>Hukuki Sebep:</em> Kanun'un 5. maddesinin 1. fıkrası uyarınca açık rızanıza dayalıdır.</p>

        <h2>4. Kişisel Verilerin Yurt Dışına Aktarımı</h2>
        <p>Açık rızanıza dayalı olarak kullanılan analitik, işlevsel ve reklam çerezleri aracılığıyla toplanan kişisel verileriniz; altyapı ve analiz hizmeti aldığımız hizmet sağlayıcılarımızın sunucularının yurt dışında bulunması nedeniyle yurt dışına aktarılabilmektedir.</p>

        <h2>5. Çerez Tercihlerinizi Nasıl Yönetebilirsiniz?</h2>
        <p>Platformumuza ilk girişinizde karşınıza çıkan çerez yönetim panelinden tercihlerinizi seçebilirsiniz. Ayrıca tarayıcı ayarlarınız üzerinden de çerezleri yönetmeniz mümkündür.</p>

        <h2>6. Kişisel Veri Sahibi Olarak Haklarınız</h2>
        <p>Kanun'un 11. maddesi uyarınca sahip olduğunuz haklara ilişkin taleplerinizi XXXXXXXXX e-posta adresimiz üzerinden iletebilirsiniz.</p>
    </div>
);

const AydinlatmaContent = () => (
    <div className="legal-content">
        <h1>Aydınlatma Metni ve Gizlilik Politikası</h1>
        <p>İşbu Gizlilik ve Kişisel Verilerin Korunması Politikası ("Politika"), XXXXXXXXX ("Şirket" veya "Veri Sorumlusu") olarak, İmarMevzuat.ai Platformu'nu ("Platform" veya "Hizmet") kullanan siz değerli kullanıcılarımızın ("Kullanıcı" veya "Veri Sahibi") kişisel verilerinin 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca nasıl toplandığını, işlendiğini, saklandığını ve paylaşıldığını şeffaf bir biçimde açıklamaktadır.</p>

        <h3>Yapay Zeka Sisteminin İşleyişine İlişkin Bilgilendirme</h3>
        <p>İmarMevzuat.ai platformunun temel işlevi olan yapay zeka destekli mevzuat yanıtlarının sunulabilmesi için girdiğiniz sorular, metinler ve yüklediğiniz dosyalar, Türkiye'deki sunucularımızda çalışan yerel modeller ve yurt dışı merkezli API destekli büyük dil modelleri (LLM'ler) tarafından işlenebilir. Bu veriler, yalnızca hizmetin ifası amacıyla kullanılmaktadır.</p>

        <h2>Madde 1: Veri Sorumlusunun Kimliği</h2>
        <ul>
            <li>Unvan: XXXXXXXXX</li>
            <li>MERSİS No: XXXXXXXXX</li>
            <li>Adres: XXXXXXXXX</li>
            <li>E-posta: XXXXXXXXX</li>
        </ul>

        <h2>Madde 2: Kapsam ve Tanımlar</h2>
        <p>Bu metinde kullanılan ve "Hizmet Şartları ve Kullanıcı Sözleşmesi"nde tanımlanmayan terimler KVKK'da belirtilen anlamlara sahiptir.</p>

        <h2>Madde 3: Toplanan Kişisel Veri Kategorileri</h2>

        <h3>1. Hesap Verileri (Kimlik ve İletişim)</h3>
        <p><strong>Toplanan Veriler:</strong> E-posta adresi, ad, soyad, profil fotoğrafı (varsa).</p>
        <p><strong>Toplama Yöntemi:</strong> Platform kayıt formları, Google hesabı ile giriş.</p>
        <p><strong>İşleme Amaçları:</strong> Hesap oluşturma, kimlik doğrulama, hizmet sunumu, iletişim.</p>
        <p><strong>Hukuki Sebep:</strong> KVKK Md. 5/2(c) ve Md. 5/2(f).</p>

        <h3>2. Kullanıcı İçerikleri</h3>
        <p><strong>Toplanan Veriler:</strong> Kullanıcının Platform'a girdiği sorular, metinler, yüklediği dosyalar.</p>
        <p><strong>İşleme Amaçları:</strong> Yapay zeka destekli yanıtların sunulması, model geliştirme (anonimleştirilmiş olarak).</p>
        <p><strong>Hukuki Sebep:</strong> KVKK Md. 5/1 ve Md. 9 uyarınca açık rıza.</p>

        <h3>3. Kullanım Verileri (Analitik ve Performans)</h3>
        <p><strong>Toplanan Veriler:</strong> IP adresi, cihaz türü, tarayıcı bilgileri, tıklama ve etkileşim olayları.</p>
        <p><strong>İşleme Amaçları:</strong> Platform performansını değerlendirmek, kullanıcı deneyimini iyileştirmek.</p>

        <h2>Madde 4: Kişisel Verilerin Aktarıldığı Taraflar</h2>
        <p>Kişisel verileriniz, bu Politika'da belirtilen amaçlar ve hukuki sebepler doğrultusunda, gerekli güvenlik tedbirleri alınarak yurt içindeki ve yurt dışındaki üçüncü taraflara aktarılabilir.</p>
        <ul>
            <li><strong>API Sağlayıcıları:</strong> Google LLC (Gemini API) – Yapay zeka destekli yanıtların sunulması.</li>
            <li><strong>Kimlik Doğrulama:</strong> Firebase Authentication – Kullanıcı kimlik doğrulama.</li>
            <li><strong>Veritabanı:</strong> Firebase Firestore – Platform veritabanının güvenli saklanması.</li>
            <li><strong>Kanunen Yetkili Kurumlar:</strong> Yasal yükümlülükler kapsamında.</li>
        </ul>

        <h2>Madde 5: Çerez Politikası</h2>
        <p>Platformumuzda çerezler kullanılmaktadır. Detaylı bilgi için "Çerez Politikası" metnini inceleyiniz.</p>

        <h2>Madde 6: Kişisel Verilerin Saklanma Süreleri</h2>
        <ul>
            <li><strong>Hesap Verileri:</strong> Hesap silinene kadar veya yasal saklama yükümlülükleri süresi boyunca.</li>
            <li><strong>Kullanıcı İçerikleri:</strong> Oturum sonrası veya kullanıcı tarafından manuel silinene kadar.</li>
            <li><strong>Kullanım Verileri:</strong> 26 aya kadar saklanır ve sonrasında silinir veya anonimleştirilir.</li>
            <li><strong>Log Kayıtları:</strong> 5651 sayılı Kanun uyarınca 2 yıla kadar.</li>
        </ul>

        <h2>Madde 7: Veri Güvenliği Tedbirleri</h2>
        <p>Şirket, kişisel verilerinizin korunması amacıyla SSL/TLS şifreleme, erişim kontrolleri, düzenli güvenlik denetimleri ve veri minimizasyonu gibi uygun teknik ve idari tedbirler almaktadır.</p>

        <h2>Madde 8: KVKK Kapsamındaki Haklarınız</h2>
        <p>Kişisel veri sahibi olarak KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
        <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</li>
            <li>İşlenmesini gerektiren sebeplerin ortadan kalkması hâlinde silinmesini isteme</li>
            <li>Otomatik analiz sebebiyle aleyhine bir sonucun çıkmasına itiraz etme</li>
            <li>Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme</li>
        </ul>
        <p>Bu haklarınızı kullanmak için XXXXXXXXX adresine başvurabilirsiniz.</p>

        <h2>Madde 10: Politika Değişiklikleri</h2>
        <p>Şirket, işbu Politika'yı zaman zaman güncelleyebilir. Güncellemeler Platform'da yayınlandığı tarihten itibaren geçerli olur. Önemli değişiklikler ayrıca bildirilecektir.</p>
    </div>
);

const AcikRizaContent = () => (
    <div className="legal-content">
        <h1>Açık Rıza Metni</h1>
        <p><em>Son Güncelleme Tarihi: XXXXXXXXX</em></p>
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, XXXXXXXXX ("Şirket") tarafından sunulan İmarMevzuat.ai Platformu'na ("Platform") ilişkin olarak tarafıma sunulan "Aydınlatma Metni ve Gizlilik Politikası"nı okuduğumu, anladığımı ve kişisel verilerimin aşağıda belirtilen her bir amaç ve koşul için işlenmesine, aktarılmasına ve saklanmasına özgür irademle rıza gösterdiğimi beyan ederim.</p>

        <h2>Yapay Zeka Sisteminin İşleyişine İlişkin Bilgilendirme</h2>
        <p>İmarMevzuat.ai platformunun temel işlevi olan yapay zeka destekli mevzuat yanıtlarının sunulabilmesi için girdiğiniz sorular, metinler ve yüklediğiniz dosyalar (içerikler), Türkiye'deki sunucularımızda çalışan yerel modeller ve yurt dışı merkezli API destekli büyük dil modelleri (LLM'ler) tarafından işlenebilir. Bu veriler, yalnızca hizmetin ifası amacıyla kullanılmaktadır.</p>

        <h2>1. Altyapı Hizmetleri İçin Veri Aktarımına İlişkin Açık Rızam</h2>
        <p>Platform'a kaydolabilmem ve hesabımın güvenli bir şekilde yönetilebilmesi için, kimlik doğrulama amacıyla tüm kullanıcılardan e-posta adresi alındığını anladım. Yukarıda belirtilen tüm kimlik verilerimin, yurt dışında yerleşik kimlik doğrulama ve veritabanı altyapı hizmet sağlayıcılarına aktarılmasını kabul ediyorum. Bu onayın, hizmetin sunulabilmesi için zorunlu olduğunu anladım.</p>

        <h2>2. Yapay Zeka Hizmetleri İçin Veri Aktarımına İlişkin Açık Rızam</h2>
        <p>Platform'un temel işlevi olan yapay zeka destekli mevzuat yanıtlarını alabilmek için, sohbet arayüzüne girdiğim içeriklerin (sorular, metinler, yüklediğim dosyalar vb.) ve bu içeriklere eklemiş olabileceğim kişisel verilerin, hizmetin ifası amacıyla yurt dışında yerleşik API hizmet sağlayıcılarına (Google LLC gibi) aktarılmasına rıza gösteriyorum. Bu onayın, Platform'un temel işlevini kullanabilmem için zorunlu olduğunu anladım.</p>

        <h2>3. Sesli Komut Hizmetleri İçin Veri Aktarımına İlişkin Açık Rızam</h2>
        <p>Platform'daki sesli komut özelliğini kullandığımda, ses kayıtlarımın metne dönüştürülmesi (transkripsiyon) amacıyla yurt dışında yerleşik hizmet sağlayıcılara aktarılmasına ve işlenmesine rıza gösteriyorum. Ses kayıtlarımın model eğitimi için kullanılmayacağını ve işlem sonrası kalıcı olarak silineceğini anladım.</p>

        <h2>4. Ticari Elektronik İleti Gönderimine İlişkin Açık Rızam (İsteğe Bağlı)</h2>
        <p>Tarafıma özel kampanyalar, indirimler, yeni özellikler ve diğer duyurular hakkında bilgilendirme yapmak amacıyla e-posta adresim gibi iletişim bilgilerim üzerinden Şirket tarafından ticari elektronik ileti gönderilmesini kabul ediyorum. Bu rızayı vermenin tamamen isteğe bağlı olduğunu ve Platform'u kullanımımı etkilemeyeceğini anladım.</p>

        <h2>Veri Sorumlusunun Kimliği</h2>
        <ul>
            <li>Unvan: XXXXXXXXX</li>
            <li>MERSİS No: XXXXXXXXX</li>
            <li>Adres: XXXXXXXXX</li>
        </ul>

        <h2>Genel Beyan</h2>
        <p>Yukarıdaki her bir maddeyi ayrı ayrı okuduğumu, anladığımı ve her bir veri işleme faaliyeti için sisteme kayıt esnasında sağlanan onay kutuları aracılığıyla ayrı ayrı ve özgür irademle açık rıza verdiğimi beyan ve kabul ederim.</p>
        <p>Verdiğim rızaları dilediğim zaman XXXXXXXXX adresine e-posta göndererek geri çekebileceğimi ve rızanın geri çekilmesinin ileriye dönük olarak sonuç doğuracağını biliyorum.</p>

        <h2>KVKK Madde 11 Kapsamındaki Haklarınız</h2>
        <p>Kişisel veri sahibi olarak 6698 sayılı KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
        <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</li>
            <li>İşlenmesini gerektiren sebeplerin ortadan kalkması hâlinde silinmesini veya yok edilmesini isteme</li>
            <li>Otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p>Bu haklarınızı kullanmak için taleplerinizi XXXXXXXXX adresine "KVKK Kapsamında Bilgi Talebi" veya benzeri bir konu başlığı ile iletebilirsiniz. Talebiniz en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.</p>
    </div>
);

const contentMap: Record<string, React.FC> = {
    'teslimat': TeslimatContent,
    'mesafeli': MesafeliContent,
    'hizmet': HizmetContent,
    'cerez': CerezContent,
    'aydinlatma': AydinlatmaContent,
    'acik-riza': AcikRizaContent,
};

export const LegalPage: React.FC<LegalPageProps> = ({ onBack, initialTab = 'teslimat' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const ContentComponent = contentMap[activeTab] || TeslimatContent;

    return (
        <div className="legal-page">
            <nav className="landing-nav">
                <div className="landing-container landing-nav-inner">
                    <div className="landing-nav-brand">
                        <div className="landing-nav-logo">
                            <Scale size={20} className="text-white" />
                        </div>
                        <span className="landing-nav-title">İmarMevzuat.ai</span>
                    </div>
                    <div className="landing-nav-actions">
                        <button onClick={onBack} className="landing-btn-ghost">
                            <ArrowLeft size={16} /> Ana Sayfa
                        </button>
                    </div>
                </div>
            </nav>

            <div className="legal-container">
                <div className="legal-tabs">
                    {legalTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`legal-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="legal-body">
                    <ContentComponent />
                </div>
            </div>
        </div>
    );
};
