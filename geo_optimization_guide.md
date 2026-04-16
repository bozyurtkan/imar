# 🏠 imarmevzuat.com.tr — GEO (Generative Engine Optimization) Implementation Guide

**Target Auditor:** AI Agents / LLMs (Claude, GPT, Gemini)
**Objective:** Optimize the site to be highly discoverable, searchable, and citeable by AI search engines.
**Reference Framework:** Princeton GEO (2024), Superpowers Agentic Skills.

---

## 1. Robots.txt Optimization (AI Citation Access)

The current `robots.txt` blocks major AI crawlers. We must differentiate between **Training Bots** (which scrape for model training) and **Citation/Search Bots** (which provide traffic and links).

### Action:
Update `robots.txt` to the following structure:

```txt
User-agent: *
Allow: /

# ENABLE AI CITATION/SEARCH BOTS
# These provide citations and direct links in ChatGPT/Perplexity/Gemini search.
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

# BLOCK MODEL TRAINING (OPTIONAL)
# Use this if you want to be cited but not used for general training.
User-agent: GPTBot
Disallow: /

User-agent: anthropic-ai
Disallow: /
```

---

## 2. Implement /llms.txt (The "AI Welcome Mat")

Create a file named `llms.txt` at the root of the site. This file is specifically for LLMs to understand the site's authority without reading thousands of pages.

### Content Structure:
```markdown
# imarmevzuat.com.tr

> Türkiye'nin en kapsamlı imar hukuku, şehircilik ve emlak mevzuatı uzmanlık platformu.

## Core Capabilities
- **Legal Analysis**: 3194 Sayılı İmar Kanunu ve ilgili yönetmeliklerin derinlemesine analizi.
- **Case Law (İçtihat)**: Danıştay kararları ve emsal hukuki süreçler.
- **Calculators**: İmar barışı, ruhsat harcı ve alan hesaplama araçları.

## Primary Knowledge Areas
- [Ruhsatsız Yapılar](/etiket/ruhsatsiz-yapilar): Kaçak yapılar ve yasallaştırma süreçleri.
- [Tarım Arazileri](/etiket/tarim-arazileri): Bağ evi, bungalow ve prefabrik yapı izinleri.
- [İmar Barışı](/etiket/imar-barisi): Güncel düzenlemeler ve kayıt belgeleri.

## Expert Trust Signals
- Tüm içerikler hukukçular ve şehir plancıları tarafından doğrulanmıştır.
- Günlük Resmi Gazete takibi ile anlık güncellemeler.
```

---

## 3. JSON-LD Schema Integration (Semantic Data)

Inject the following schema types into the `<head>` of relevant pages to help AI "extract" facts into structured answers.

### A. Global WebSite Schema (For Hompage)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "İmar Mevzuat",
  "url": "https://imarmevzuat.com.tr",
  "description": "Profesyonel imar ve şehircilik mevzuatı platformu."
}
```

### B. FAQPage Schema (For Article/Question Pages)
If an article answers a specific question (e.g., "Tarım arazisine bağ evi yapılır mı?"), use:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Tarım arazisine kaç m2 bağ evi yapılabilir?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "İlgili yönetmeliğe göre tarımsal amaçlı yapılar için %5 imar izni bulunmakta olup, maksimum 250m2 sınırı mevcuttur..."
    }
  }]
}
```

---

## 4. Content Optimization (The "Cite-Me" Signal)

To increase the probability of being cited as a primary source, help the LLM identify "hard facts."

1. **Add Statistics**: Every article should contain at least 4-5 numbers (Percentages, Year of Law, Area sizes in m2).
2. **Use Expert Quotes**: Add blocks like: 
   > "3194 Sayılı Kanun'un 32. Maddesi uyarınca yıkım kararı ancak..." — Av. [isim], [Yıl].
3. **Internal Citation Links**: Use descriptive link text like `[3194 Sayılı İmar Kanunu 18. Madde Uygulaması](https://link)` instead of `[Click here]`.

---

## 5. Audit & Verification

Once implemented, verify using:
- **Google Search Console**: Check for the new structured data.
- **GEO Toolkit**: Run `./geo audit --url https://imarmevzuat.com.tr` to confirm AI bots are no longer blocked and schema is visible.
