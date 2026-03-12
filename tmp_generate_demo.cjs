
const fs = require('fs');
const path = require('path');

const files = [
    { name: 'Otopark Yönetmeliği', path: 'Dosya/Otopark.txt', id: 'auto-otopark-yönetmeligi' },
    { name: 'Planlı Alanlar İmar Yönetmeliği', path: 'Dosya/Planli.txt', id: 'auto-planli-alanlar' },
    { name: 'İmar Kanunu', path: 'Dosya/Kanun.txt', id: 'auto-imar-kanunu' }
];

let tsContent = 'import { DocumentFile } from "../types";\n\nexport const getDemoDocuments = (): DocumentFile[] => {\n  const date = new Date().toLocaleDateString("tr-TR");\n  return [\n';

files.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Clean up content: sanitize for JS string
        content = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

        tsContent += `    {\n`;
        tsContent += `      id: "${file.id}",\n`;
        tsContent += `      name: "${file.name}",\n`;
        tsContent += `      type: "text" as any,\n`;
        tsContent += `      content: \`${content}\`,\n`;
        tsContent += `      size: "Bilinmiyor",\n`;
        tsContent += `      description: "${file.name} - Otomatik yüklenen demo belgesi.",\n`;
        tsContent += `      uploadDate: date,\n`;
        tsContent += `      isActive: true\n`;
        tsContent += `    },\n`;
    } else {
        console.log('File not found:', filePath);
    }
});

tsContent += '  ];\n};';

const outputPath = path.join(process.cwd(), 'data', 'demoMevzuat.ts');
if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}
fs.writeFileSync(outputPath, tsContent);
console.log('demoMevzuat.ts created successfully at ' + outputPath);
