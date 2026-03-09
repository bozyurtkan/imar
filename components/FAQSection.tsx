import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const faqData = [
    {
        question: "İmar Mevzuat nedir ve genel yapay zeka araçlarından (ChatGPT vb.) farkı nedir?",
        answer: "İmar Mevzuat, Türkiye'nin sadece imar hukukuna ve şehircilik mevzuatına odaklanmış ilk uzman yapay zeka asistanıdır. Genel yapay zekaların aksine, sistemimiz 3194 Sayılı İmar Kanunu, spesifik yönetmelikler ve Resmi Gazete kararlarıyla özel olarak eğitilmiştir. En büyük farkımız, genel geçer cevaplar üretmek yerine halüsinasyon riskini sıfıra indiren \"kesin madde atıflı\" sonuçlar sunmamızdır. Mimarlar, mühendisler ve hukukçular için imar terminolojisine tam hakim, 7/24 ulaşılabilen devasa bir dijital laboratuvar işlevi görür."
    },
    {
        question: "Randevu almadan ve yüksek danışmanlık ücretleri ödemeden uzman görüşüne nasıl ulaşabilirim?",
        answer: "İmar Mevzuat ile telefon ekranınızda veya bilgisayarınızda; ofiste, şantiyede ya da evde, 7 gün 24 saat yanınızda taşıdığınız kıdemli bir imar hukuku uzmanına sahip olursunuz. Görüşmek için randevu beklemenize, ulaşılamayan uzmanların peşinden koşmanıza veya fahiş danışmanlık ücretleri ödemenize gerek kalmaz. Bir belediye görevlisiyle veya avukatla yapacağınız teknik bir istişareyi, gece yarısı bile sistemimizle yapabilir, ertesi sabaha projelerinizi veya savunmalarınızı kusursuz hazırlamış olarak uyanabilirsiniz."
    },
    {
        question: "Günlerce uğraştığım karmaşık imar dosyalarını gerçekten saniyeler içinde çözebilir miyim?",
        answer: "Kesinlikle. Saatlerce sayfa sayfa mevzuat karıştırdığınız, \"Hangi madde güncel?\", \"Bu karar iptal edildi mi?\" diye endişelendiğiniz günler geride kaldı. Derin Düşünme Modu sayesinde, birden fazla yönetmelik ve kanunun çapraz kontrolünü gerektiren en zorlu vakaları bile tek bir soruyla çözersiniz. Sistem sizin yerinize hukuki muhakeme yapar, birbiriyle çelişen veya atıf yapan maddeleri analiz eder ve 2 dakika içinde size net, stratejik ve hatasız bir rapor sunar. Vakit nakittir; kaybettiğiniz saatleri geri kazanın."
    },
    {
        question: "Sisteminizin verdiği hukuki yanıtlar güvenilir mi, kaynak gösteriyor mu?",
        answer: "Hayati kararlarınızı tesadüflere bırakamazsınız. İmar Mevzuat'nin sunduğu hukuki yanıtlar en yüksek doğruluk prensibiyle resmi kaynaklarla desteklenir. Sistemimiz, ürettiği her paragrafın veya hukuki çıkarımın sonuna ilgili kanun, yönetmelik veya kararın kesin madde numarasını ekler (Örn: Planlı Alanlar İmar Yönetmeliği Madde 23). Bu yapısal doğrulama mekanizması sayesinde doğrudan resmi dayanağı şeffaf bir şekilde görüntüler, müşterilerinize veya kurumlara kendinizden emin bir şekilde sunum yaparsınız."
    },
    {
        question: "Rakiplerime karşı nasıl bir avantaj sağlarım?",
        answer: "Rakipleriniz hala manuel olarak mevzuat tararken veya güncel olmayan eski yönetmelikler üzerinden yanlış projeler çizerken, siz her zaman bir adım önde olacaksınız. Canlı web entegrasyonumuz ve günlük Resmi Gazete takibimiz sayesinde; lehinize olan yeni bir yargısal karardan veya Otopark Yönetmeliğindeki küçük ama kritik bir değişiklikten ilk sizin haberiniz olur. Hata yapma lüksünüzün olmadığı milyonluk projelerde ve imar davalarında en güçlü asistanınız İmar Mevzuat'dir."
    },
    {
        question: "Yüklediğim projeler (PDF/Word) ve yaptığım sorgulamalar gizli tutuluyor mu?",
        answer: "Müşterilerinizin ve şirketinizin mahremiyeti bizim kırmızı çizgimizdir. Platformumuza yüklediğiniz tüm hukuki belgeler, projeler ve arama sorguları uçtan uca şifrelenir ve kapalı sunucu mimarisinde saklanır. Verileriniz, yapay zeka modellerinin genel eğitimi veya geliştirilmesi amacıyla kesinlikle kullanılmaz. Tam gizlilikle, sadece sizin erişiminize açık güvenli bir çalışma alanı sunuyoruz."
    }
];

export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First item opened by default

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <section className="landing-faq py-24 relative overflow-hidden">
            {/* SEO - Schema.org JSON-LD Integration */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <div className="landing-container relative z-10">
                <div className="text-center mb-16">
                    <h2 className="landing-section-title">Aklınızdaki Sorular, Şeffaf Cevaplar</h2>
                    <p className="landing-section-subtitle mx-auto">
                        İmar Mevzuat'nin size nasıl zaman kazandıracağı, maliyetleri nasıl düşüreceği ve güvenilirlik esası hakkında merak ettiklerinizi derledik.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                    {faqData.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`group flex flex-col bg-dark-surface/40 hover:bg-dark-surface border transition-all duration-300 rounded-[1.5rem] overflow-hidden backdrop-blur-md cursor-pointer
                ${openIndex === idx ? 'border-accent/40 shadow-[0_0_30px_-10px_rgba(196,80,26,0.3)] bg-dark-surface' : 'border-dark-border/60 hover:border-accent/30'}
              `}
                            onClick={() => toggleAccordion(idx)}
                        >
                            <div className="p-6 md:p-8 flex items-center gap-4 md:gap-6">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300
                    ${openIndex === idx ? 'bg-accent/20 text-accent' : 'bg-dark-elevated text-warm-300 group-hover:bg-accent/10 group-hover:text-accent'}
                `}>
                                    <MessageSquare size={20} />
                                </div>

                                <h3 className={`flex-grow text-base md:text-lg font-bold tracking-tight transition-colors duration-300 pr-4
                    ${openIndex === idx ? 'text-warm-50' : 'text-warm-100 group-hover:text-warm-50'}
                `}>
                                    {faq.question}
                                </h3>

                                <div className={`flex-shrink-0 transition-transform duration-300
                    ${openIndex === idx ? 'text-accent' : 'text-warm-400 group-hover:text-warm-100'}
                `}>
                                    {openIndex === idx ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </div>
                            </div>

                            <div
                                className="overflow-hidden transition-all duration-300 ease-in-out"
                                style={{
                                    maxHeight: openIndex === idx ? '1000px' : '0px',
                                    opacity: openIndex === idx ? 1 : 0
                                }}
                            >
                                <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 pl-[5.5rem] md:pl-[6.5rem]">
                                    <p className="text-warm-300 text-sm md:text-base leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
        </section>
    );
};
