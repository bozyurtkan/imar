// Mevzuat veritabanı - 3194 Sayılı İmar Kanunu örnek maddeleri
// Gerçek sistemde bu bir API'den veya veritabanından gelecek

export interface MevzuatMaddesi {
    id: string;
    kanunNo: string;
    kanunAdi: string;
    maddeNo: string;
    baslik: string;
    icerik: string;
    iliskiliMaddeler: string[];
    anahtatKelimeler: string[];
    yargitayKararlari?: {
        karar: string;
        tarih: string;
        ozet: string;
        link?: string;
    }[];
    sonGuncelleme: string;
}

export const mevzuatVeritabani: Record<string, MevzuatMaddesi> = {
    "3194/1": {
        id: "3194/1",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "1",
        baslik: "Amaç",
        icerik: `Bu Kanun, yerleşme yerleri ile bu yerlerdeki yapılaşmaların; plan, fen, sağlık ve çevre şartlarına uygun teşekkülünü sağlamak amacıyla düzenlenmiştir.`,
        iliskiliMaddeler: ["3194/2", "3194/3"],
        anahtatKelimeler: ["amaç", "yerleşme", "yapılaşma", "plan"],
        sonGuncelleme: "2024-01-01"
    },
    "3194/2": {
        id: "3194/2",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "2",
        baslik: "Kapsam",
        icerik: `Belediye ve mücavir alan sınırları içinde ve dışında kalan yerlerde yapılacak planlar ile inşa edilecek resmi ve özel bütün yapılar bu Kanun hükümlerine tabidir.

Ancak;
a) 2634 sayılı Turizmi Teşvik Kanunu,
b) 2863 sayılı Kültür ve Tabiat Varlıklarını Koruma Kanunu,
c) 2873 sayılı Milli Parklar Kanunu,
d) 3621 sayılı Kıyı Kanunu,
kapsamında kalan alanlarda bu Kanunun ilgili maddelerine uyulur.`,
        iliskiliMaddeler: ["3194/1", "3194/5", "3194/8"],
        anahtatKelimeler: ["kapsam", "belediye", "mücavir alan", "yapı"],
        sonGuncelleme: "2024-01-01"
    },
    "3194/5": {
        id: "3194/5",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "5",
        baslik: "Tanımlar",
        icerik: `Bu Kanunda geçen terimlerden;

**Nazım İmar Planı:** Varsa bölge veya çevre düzeni planlarına uygun olarak halihazır haritalar üzerine, yine varsa kadastral durumu işlenmiş olarak çizilen ve arazi parçalarının; genel kullanış biçimlerini, başlıca bölge tiplerini, bölgelerin gelecekteki nüfus yoğunluklarını, gerektiğinde yapı yoğunluğunu, çeşitli yerleşme alanlarının gelişme yön ve büyüklükleri ile ilkelerini, ulaşım sistemlerini ve problemlerinin çözümü gibi hususları göstermek ve uygulama imar planlarının hazırlanmasına esas olmak üzere düzenlenen, detaylı bir raporla açıklanan ve raporuyla beraber bütün olan plandır.

**Uygulama İmar Planı:** Tasdikli halihazır haritalar üzerine varsa kadastral durumu işlenmiş olarak nazım imar planı esaslarına göre çizilen ve çeşitli bölgelerin yapı adalarını, bunların yoğunluk ve düzenini, yolları ve uygulama için gerekli imar uygulama programlarına esas olacak uygulama etaplarını ve diğer bilgileri ayrıntıları ile gösteren plandır.

**Yapı:** Karada ve suda, daimi veya muvakkat, resmi ve hususi yeraltı ve yerüstü inşaatı ile bunların ilave, değişiklik ve tamirlerini içine alan sabit ve müteharrik tesislerdir.

**Bina:** Kendi başına kullanılabilen, üstü örtülü ve insanların içine girebilecekleri ve insanların oturma, çalışma, eğlenme veya dinlenmelerine veya ibadet etmelerine yarayan, hayvanların ve eşyaların korunmasına yarayan yapılardır.`,
        iliskiliMaddeler: ["3194/6", "3194/8", "3194/18"],
        anahtatKelimeler: ["tanım", "nazım plan", "uygulama planı", "yapı", "bina"],
        sonGuncelleme: "2024-01-01"
    },
    "3194/8": {
        id: "3194/8",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "8",
        baslik: "Planların Hazırlanması ve Yürürlüğe Konulması",
        icerik: `Planların hazırlanmasında ve yürürlüğe konulmasında aşağıda belirtilen esaslara uyulur:

a) Bölge planları; sosyo-ekonomik gelişme eğilimlerini, yerleşmelerin gelişme potansiyelini, sektörel hedefleri, faaliyetlerin ve alt yapıların dağılımını belirlemek üzere hazırlanacak bölge planlarını, gerekli gördüğü hallerde Devlet Planlama Teşkilatı yapar veya yaptırır.

b) İmar Planları; Nazım İmar Planı ve Uygulama İmar Planından meydana gelir. Mevcut ise bölge planı ve çevre düzeni plan kararlarına uygunluğu sağlanarak, belediye sınırları içinde kalan yerlerin nazım ve uygulama imar planları ilgili belediyelerce yapılır veya yaptırılır.

c) İmar planları alenidir. Bu aleniyeti sağlamak ilgili idarelerin görevidir. Belediye Başkanlığı ve mülki amirlikler, imar planının tamamını veya bir kısmını kopyalar veya kitapçıklar haline getirip bedeli karşılığında isteyenlere verir.

d) İmar planları onay tarihinden itibaren belediye başkanlığınca tespit edilen ilan yerlerinde ve ilgili idarelerin internet sayfalarında bir ay süre ile eş zamanlı olarak ilan edilir.`,
        iliskiliMaddeler: ["3194/5", "3194/9", "3194/18"],
        anahtatKelimeler: ["plan hazırlama", "onay", "ilan", "askı"],
        yargitayKararlari: [
            {
                karar: "Danıştay 6. Daire 2019/12345",
                tarih: "2020-03-15",
                ozet: "İmar planı değişikliğinin askıya çıkarılmadan uygulanması hukuka aykırıdır.",
                link: "https://karararama.danistay.gov.tr"
            }
        ],
        sonGuncelleme: "2024-01-01"
    },
    "3194/18": {
        id: "3194/18",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "18",
        baslik: "Arazi ve Arsa Düzenlemesi",
        icerik: `İmar hududu içinde bulunan binalı veya binasız arsa ve arazileri malikleri veya diğer hak sahiplerinin muvafakatı aranmaksızın, birbirleri ile, yol fazlaları ile, kamu kurumlarına veya belediyelere ait bulunan yerlerle birleştirmeye, bunları yeniden imar planına uygun ada veya parsellere ayırmaya, müstakil, hisseli veya kat mülkiyeti esaslarına göre hak sahiplerine dağıtmaya ve re'sen tescil işlemlerini yaptırmaya belediyeler yetkilidir.

Sözü edilen yerler belediye ve mücavir alan dışında ise yukarıda belirtilen yetkiler valilikçe kullanılır.

Belediyeler veya valiliklerce düzenlemeye tabi tutulan arazi ve arsaların dağıtımı sırasında bunların yüzölçümlerinden yeteri kadar saha, düzenleme dolayısıyla meydana gelen değer artışları karşılığında "düzenleme ortaklık payı" olarak düşülebilir.

**Düzenleme Ortaklık Payı (DOP):** Düzenleme ortaklık payları, düzenlemeye tâbi tutulan yerlerin ihtiyacı olan Milli Eğitim Bakanlığına bağlı ilk ve ortaöğretim kurumları, yol, meydan, park, otopark, çocuk bahçesi, yeşil saha, ibadet yeri ve karakol gibi umumî hizmetlerden ve bu hizmetlerle ilgili tesislerden başka maksatlarla kullanılamaz.

Düzenleme ortaklık paylarının toplamı, yukarıdaki fıkrada sözü geçen umumi hizmetler için, parsing toplamının yüzde kırkbeşini (%45) geçemez.`,
        iliskiliMaddeler: ["3194/5", "3194/8", "3194/19", "3194/42"],
        anahtatKelimeler: ["parselasyon", "DOP", "düzenleme ortaklık payı", "arazi düzenlemesi", "18. madde uygulaması"],
        yargitayKararlari: [
            {
                karar: "Danıştay 6. Daire 2021/5678",
                tarih: "2022-06-20",
                ozet: "DOP oranının %45'i aşması durumunda düzenleme işlemi iptal edilir.",
                link: "https://karararama.danistay.gov.tr"
            },
            {
                karar: "Danıştay İDDK 2020/1234",
                tarih: "2021-01-10",
                ozet: "18. madde uygulamasında eşdeğer parsel verilmemesi mülkiyet hakkı ihlalidir.",
                link: "https://karararama.danistay.gov.tr"
            }
        ],
        sonGuncelleme: "2024-01-01"
    },
    "3194/19": {
        id: "3194/19",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "19",
        baslik: "İfraz ve Tevhid",
        icerik: `İmar planlarına göre parselasyon planları yapılıp belediye ve mücavir alan içinde belediye encümeni, dışında ise il idare kurulu tarafından onaylanarak yürürlüğe girer.

Bu planlar bir ay müddetle ilgili idarede asılır. Ayrıca mutat vasıtalarla duyurulur. Bu sürenin sonunda kesinleşir. Tashih edilecek planlar hakkında da bu hüküm uygulanır.

Kesinleşen parselasyon planları tescil edilmek üzere tapu dairesine gönderilir. Bu daireler ilgililerin muvafakatı aranmaksızın, sicilleri planlara göre re'sen tanzim ve tesis ederler.

İmar parselasyon planı bulunmayan alanlarda yapılacak ifraz ve tevhid işlemleri:
a) İfraz suretiyle elde edilecek her parselin asgari ifraz şartlarını taşıması,
b) İfraz suretiyle elde edilecek parsellerin yola cepheli olması,
c) Parseller arasında yol kalması halinde bağışlanması veya kamuya terk edilmesi,
şartlarına bağlıdır.`,
        iliskiliMaddeler: ["3194/18", "3194/15", "3194/16"],
        anahtatKelimeler: ["ifraz", "tevhid", "parselasyon", "tapu"],
        sonGuncelleme: "2024-01-01"
    },
    "3194/21": {
        id: "3194/21",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "21",
        baslik: "Yapı Ruhsatiyesi",
        icerik: `Bu Kanunun kapsamına giren bütün yapılar için 26 ncı maddede belirtilen istisna dışında belediye veya valiliklerden yapı ruhsatiyesi alınması mecburidir.

Ruhsat alınmış yapılarda herhangi bir değişiklik yapılması da yeniden ruhsat alınmasına bağlıdır. Bu durumda bağımsız bölümlerin brüt alanı artmıyorsa ve nitelik değişmiyorsa yeniden harç alınmaz.

Yapı ruhsatı, yapının imar mevzuatına, fen, sağlık ve çevre koşullarına, yapı güvenliğine, enerji tasarrufuna ilişkin kurallara uygunluğunu belgeler.

Yapı ruhsatı için başvuruda, yapı sahibinin arsaya ilişkin mülkiyet hakkını veya yapı yapmaya yetkili olduğunu gösteren belge, mimari proje, statik proje, elektrik ve mekanik tesisat projeleri, aplikasyon belgesi, zemin etüdü ve ilgili mevzuatın gerektirdiği diğer belgeler istenir.`,
        iliskiliMaddeler: ["3194/22", "3194/26", "3194/29", "3194/30"],
        anahtatKelimeler: ["ruhsat", "yapı ruhsatı", "inşaat izni", "proje"],
        yargitayKararlari: [
            {
                karar: "Yargıtay 15. HD 2019/8901",
                tarih: "2020-05-12",
                ozet: "Ruhsatsız yapılan inşaat için müteahhit tazminat talep edemez.",
                link: "https://karararama.yargitay.gov.tr"
            }
        ],
        sonGuncelleme: "2024-01-01"
    },
    "3194/32": {
        id: "3194/32",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "32",
        baslik: "İmar Mevzuatına Aykırı Yapılar",
        icerik: `Bu Kanun hükümlerine göre ruhsat alınmadan yapılabilecek yapılar hariç; ruhsat alınmadan yapıya başlandığı veya ruhsat ve eklerine aykırı yapı yapıldığı ilgili idarece tespiti, fenni mesulce tespiti ve ihbarı veya herhangi bir şekilde bu duruma muttali olunması üzerine, belediye veya valiliklerce o andaki inşaat durumu tespit edilir.

Yapı mühürlenerek inşaat derhal durdurulur.

Durdurma, yapı tatil zaptının yapı yerine asılmasıyla yapı sahibine tebliğ edilmiş sayılır. Bu tebligatın bir nüshası da muhtara bırakılır.

Bu tarihten itibaren en çok bir ay içinde yapı sahibi, yapısını ruhsata uygun hale getirerek veya ruhsat alarak, belediyeden veya valilikten mühürün kaldırılmasını ister.

Ruhsata aykırılık giderilemiyorsa, ruhsata aykırı veya ruhsatsız yapılan bina, belediye veya valilik tarafından yıktırılır.`,
        iliskiliMaddeler: ["3194/21", "3194/42", "3194/40"],
        anahtatKelimeler: ["kaçak yapı", "ruhsatsız", "yıkım", "mühürleme", "imar cezası"],
        yargitayKararlari: [
            {
                karar: "Danıştay 14. Daire 2022/4567",
                tarih: "2023-02-28",
                ozet: "Yıkım kararından önce yapı sahibine ruhsata uygun hale getirme fırsatı verilmelidir.",
                link: "https://karararama.danistay.gov.tr"
            }
        ],
        sonGuncelleme: "2024-01-01"
    },
    "3194/42": {
        id: "3194/42",
        kanunNo: "3194",
        kanunAdi: "İmar Kanunu",
        maddeNo: "42",
        baslik: "İdari Müeyyideler (Para Cezaları)",
        icerik: `Bu maddede belirtilen ve imar mevzuatına aykırılık teşkil eden fiil ve hallerin tespit edildiği tarihten itibaren on iş günü içinde ilgili idare encümenince sorumlular hakkında, üstlenilen her bir sorumluluk için ayrı ayrı olarak bu maddede belirtilen idari para cezaları uygulanır.

**Ruhsat alınmaksızın veya ruhsata, ruhsat eki etüt ve projelere, imar mevzuatına aykırı yapı yapıldığının tespiti halinde:**

a) Yapı sınıfına ve grubuna göre belirlenen birim fiyat esas alınarak bulunan yapı inşaat alanı maliyet bedeli üzerinden hesaplanan birim maliyet bedeli x yapı inşaat alanı x mevzuata aykırılık oranı formülü ile hesaplanan tutar,

b) Mevzuata aykırılığı yapan veya yaptıranlara (yapı müteahhidi, şantiye şefi, yapı sahibi, yapı maliki) ayrı ayrı olmak üzere;
- Yapı inşaat alanı 500 m²'ye kadar olan yapılarda 50.000 TL,
- 500 m² - 1000 m² arasında 100.000 TL,
- 1000 m² üzerinde 200.000 TL,

idari para cezası verilir.

Cezalar her yıl yeniden değerleme oranında artırılır.`,
        iliskiliMaddeler: ["3194/32", "3194/40", "3194/21"],
        anahtatKelimeler: ["para cezası", "idari para cezası", "imar cezası", "42. madde"],
        yargitayKararlari: [
            {
                karar: "Danıştay 6. Daire 2023/7890",
                tarih: "2023-11-15",
                ozet: "42. madde kapsamında verilen para cezasında mevzuata aykırılık oranı doğru hesaplanmalıdır.",
                link: "https://karararama.danistay.gov.tr"
            }
        ],
        sonGuncelleme: "2024-01-01"
    }
};

// Madde ID'sinden veri çekme fonksiyonu
export const getMadde = (maddeId: string): MevzuatMaddesi | null => {
    if (!maddeId) return null;

    // 1. Temel temizlik (boşluklar, köşeli parantezler, "MADDE:" öneki)
    let cleaned = maddeId
        .replace(/MADDE:\s*/i, '')
        .replace(/[\[\]]/g, '')
        .trim();

    // Normalizasyon: tire yerine slash
    cleaned = cleaned.replace('-', '/');

    // 2. Doğrudan eşleşme kontrolü (Örn: "3194/18")
    if (mevzuatVeritabani[cleaned]) return mevzuatVeritabani[cleaned];

    // 3. Paragraf/Bent uzantılarını temizleme ve Kanun No varsayımı
    // Olası formatlar: "18/1", "3194/18/1", "18", "Madde 18"

    const parts = cleaned.split('/');

    // Eğer sadece tek parça varsa (Örn: "18") ve veritabanında yoksa, 3194 ekle
    if (parts.length === 1) {
        // Sadece sayı ise
        if (/^\d+$/.test(parts[0])) {
            const defaultKey = `3194/${parts[0]}`;
            if (mevzuatVeritabani[defaultKey]) return mevzuatVeritabani[defaultKey];
        }
    }

    // Eğer birden fazla parça varsa (Örn: "18/1" veya "3194/18/1")
    if (parts.length >= 2) {
        // İlk parça kanun numarası mı? (Genelde 4 hane: 3194, 2863 vs.)
        if (parts[0].length === 4 && /^\d+$/.test(parts[0])) {
            // Format: Kanun/Madde/Fıkra -> Kanun/Madde'yi al
            const key = `${parts[0]}/${parts[1]}`;
            if (mevzuatVeritabani[key]) return mevzuatVeritabani[key];
        } else {
            // İlk parça kanun no değilse, muhtemelen madde numarasıdır.
            // Format: Madde/Fıkra -> 3194/Madde olarak dene
            const key = `3194/${parts[0]}`;
            if (mevzuatVeritabani[key]) return mevzuatVeritabani[key];
        }
    }

    return null;
};

// Tüm maddeleri al (knowledge graph için)
export const getAllMaddeler = (): MevzuatMaddesi[] => {
    return Object.values(mevzuatVeritabani);
};

// Anahtar kelimeye göre arama
export const searchMaddeler = (query: string): MevzuatMaddesi[] => {
    const normalizedQuery = query.toLowerCase();
    return Object.values(mevzuatVeritabani).filter(madde =>
        madde.baslik.toLowerCase().includes(normalizedQuery) ||
        madde.icerik.toLowerCase().includes(normalizedQuery) ||
        madde.anahtatKelimeler.some(k => k.toLowerCase().includes(normalizedQuery))
    );
};

// Knowledge graph için edge (ilişki) verisi
export interface MevzuatEdge {
    source: string;
    target: string;
    type: 'references' | 'relatedTo';
}

export const getMevzuatGraph = (): { nodes: MevzuatMaddesi[], edges: MevzuatEdge[] } => {
    const nodes = getAllMaddeler();
    const edges: MevzuatEdge[] = [];

    nodes.forEach(node => {
        node.iliskiliMaddeler.forEach(relatedId => {
            if (mevzuatVeritabani[relatedId]) {
                edges.push({
                    source: node.id,
                    target: relatedId,
                    type: 'relatedTo'
                });
            }
        });
    });

    return { nodes, edges };
};
