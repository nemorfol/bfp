import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fiDir = path.join(__dirname, 'api', 'fi');

const files = [
    'fi-TC005A251110.pdf',
    'fi-TF106M251216.pdf',
    'fi-TF004A251031.pdf', // Controllo anche questo
    'fi-TF504A241114-240625.pdf'
];

async function inspect() {
    for (const file of files) {
        try {
            const buffer = fs.readFileSync(path.join(fiDir, file));
            const data = await pdf(buffer);
            const text = data.text.slice(0, 1000); // Primi 1000 caratteri
            console.log(`\n--- FILE: ${file} ---`);
            
            // Cerca il titolo
            const titleMatch = text.match(/Buono ([^\n]+)/i);
            console.log("Titolo potenziale:", titleMatch ? titleMatch[0] : "Non trovato");
            
            // Cerca rendimenti
            const rates = text.match(/(\d+,\d{2})%/g);
            console.log("Tassi trovati:", rates ? rates.slice(0, 5) : "Nessuno");
            
            // Cerca durata
            console.log("Durata keywords:", text.match(/(anni|mesi)/g));
        } catch (e) {
            console.error(`Errore ${file}:`, e.message);
        }
    }
}

inspect();
