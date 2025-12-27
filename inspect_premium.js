
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, 'api', 'fi', 'fi-TF004A251031.pdf');

async function dumpText() {
    try {
        const buffer = fs.readFileSync(pdfPath);
        const data = await pdf(buffer);
        console.log(data.text.slice(2000, 5000));
    } catch (e) { console.error(e); }
}

dumpText();
