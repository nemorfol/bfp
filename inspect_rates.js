
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fiDir = path.join(__dirname, 'api', 'fi');

async function detailedInspect(file) {
    const buffer = fs.readFileSync(path.join(fiDir, file));
    const data = await pdf(buffer);
    const text = data.text;
    console.log(`\n--- DETAILS FOR ${file} ---`);
    
    // Cerca la durata esatta
    const duration = text.match(/durata (?:massima )?di ([^.]+) (?:anni|mesi)/i);
    console.log("Durata testo:", duration ? duration[0] : "Non trovata");

    // Cerca tabella tassi o valori
    // Spesso appaiono come sequenze di numeri: 0,50% 1,00% ...
    // O coefficienti: 1,00500000
    const numbers = text.match(/\d+,\d{2,}/g);
    console.log("Numeri rilevanti:", numbers ? numbers.slice(0, 20) : "Nessuno");
}

detailedInspect('fi-TC005A251110.pdf'); // Cedola
detailedInspect('fi-TF106M251216.pdf'); // 6 Mesi
