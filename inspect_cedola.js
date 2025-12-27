
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, 'api', 'fi', 'fi-TC005A251110.pdf');

async function dumpText() {
    const buffer = fs.readFileSync(pdfPath);
    const data = await pdf(buffer);
    // Stampo una porzione centrale dove solitamente ci sono le tabelle dei tassi
    console.log(data.text.slice(2000, 6000));
}

dumpText();
