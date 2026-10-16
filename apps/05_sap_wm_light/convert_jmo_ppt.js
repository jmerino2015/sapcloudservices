const fs = require('fs');
const cheerio = require('cheerio');
const pptxgen = require('pptxgenjs');

const html = fs.readFileSync('Presentacion JMO en html.html', 'utf8');
const $ = cheerio.load(html);

let pres = new pptxgen();
pres.author = 'JM Holding';
pres.title = 'Presentacion JMO';
pres.layout = 'LAYOUT_16x9';

pres.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'F4F6F9' },
});

$('section.slide').each((index, element) => {
    let slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    let yPos = 0.5;
    
    // Track already processed text to avoid duplication since span is often inside p or h1
    let addedTexts = new Set();

    $(element).find('h1, h2, h3, h4, p').each((i, el) => {
        let text = $(el).text().replace(/\s+/g, ' ').trim();
        if (!text || text.length === 0 || addedTexts.has(text)) return;
        addedTexts.add(text);

        let tagName = el.tagName.toLowerCase();
        let fontSize = 14;
        let bold = false;
        let color = '1E293B';

        if (tagName === 'h1') { fontSize = 36; bold = true; color = '0A2540'; }
        else if (tagName === 'h2') { fontSize = 28; bold = true; color = '0070F2'; }
        else if (tagName === 'h3') { fontSize = 20; bold = true; color = '0A2540'; }
        else if (tagName === 'h4') { fontSize = 16; bold = true; color = '64748B'; }
        else if (tagName === 'p') { fontSize = 14; color = '475569'; }
        
        // Prevent writing off slide
        if (yPos < 6.8) {
            slide.addText(text, { x: 0.5, y: yPos, w: '90%', fontSize: fontSize, bold: bold, color: color });
            yPos += (fontSize / 20) + 0.3; // Increment roughly based on size
        }
    });
});

pres.writeFile({ fileName: 'Presentacion_JMO.pptx' }).then(fileName => {
    console.log(`PPTX generado exitosamente: ${fileName}`);
}).catch(err => {
    console.error('Error al generar PPTX:', err);
});
