# Agent Skills — imarmevzuat.com.tr

## Site Identity
- Name: İmarmevzuat.ai
- URL: https://imarmevzuat.com.tr
- Language: Turkish
- Domain: Turkish urban planning law, building permits, zoning regulations

## Available Skills

### Legal Q&A
- Capability: Answer questions about Turkish zoning law (3194 Sayılı İmar Kanunu)
- Input: Natural language question in Turkish or English
- Output: Structured legal analysis with references

### Mevzuat Search
- Capability: Search Turkish planning legislation, circulars, and regulations
- Endpoint: /api/search
- Input: keyword or legal reference number
- Output: Relevant law excerpts and summaries

### Permit Calculator
- Capability: Calculate building permit fees and area limits
- Topics: İmar barışı, ruhsat harcı, TAKS/KAKS calculations

### Case Law (İçtihat)
- Capability: Retrieve Danıştay (Council of State) decisions on planning disputes
- Output: Case summaries with legal reasoning

## Trust Signals
- Content verified by licensed lawyers and urban planners
- Daily monitoring of Official Gazette (Resmi Gazete)
- Updated in real-time with new regulations

## Markdown Support
- Endpoint: https://imarmevzuat.com.tr/api/index
- Send `Accept: text/markdown` header to receive homepage content as Markdown
- Response includes `Content-Type: text/markdown` and `x-markdown-tokens` headers

## Contact
- Email: info@imarmevzuat.com.tr
- llms.txt: https://imarmevzuat.com.tr/llms.txt
