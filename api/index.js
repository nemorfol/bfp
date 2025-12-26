import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// UPLOAD DIR: Usiamo la temp dir di sistema per compatibilità Vercel (read-only filesystem)
const UPLOAD_DIR = os.tmpdir();
const FI_DIR = path.join(__dirname, 'fi');

// Helper per estrarre dati dal PDF
const extractDataFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        const text = data.text;

        // Euristiche di estrazione
        // Cerchiamo il codice (es. TF604A250103, IL110A240307)
        // Pattern: 2 lettere + vari numeri/lettere, lunghezza circa 10-12
        const codeMatch = text.match(/\b[A-Z0-9]{12}\b/);
        const code = codeMatch ? codeMatch[0] : 'SCONOSCIUTO';

        // Cerchiamo il nome
        // Solitamente dopo "Foglio informativo del" o "dei"
        let name = 'Buono Fruttifero Postale';
        const nameMatch = text.match(/Foglio informativo de[l|i]\s+([\s\S]+?)\s+\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)/i);
        if (nameMatch && nameMatch[1]) {
            name = nameMatch[1].replace(/\s+/g, ' ').trim();
        }

        // Cerchiamo la data
        const dateMatch = text.match(/(\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4})/i);
        const date = dateMatch ? dateMatch[0] : '';

        // Tassi (Mock per ora, dato che il parser non legge le tabelle grafiche)
        // In futuro qui si potrebbe implementare una logica più complessa o OCR
        const rates = []; 
        // Logica dummy: se è indicizzato inflazione (IL...) o fisso (TF...)
        const isInflationLinked = code.startsWith('IL') || name.toLowerCase().includes('inflazione');
        
        return {
            filename: path.basename(filePath),
            code,
            name,
            date,
            isInflationLinked,
            textPreview: text.slice(0, 200) // Solo per debug
        };
    } catch (error) {
        console.error(`Errore parsing ${filePath}:`, error);
        return null;
    }
};

// Endpoint: Lista prodotti da PDF
app.get('/api/products', async (req, res) => {
    try {
        const files = fs.readdirSync(FI_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
        const products = [];
        
        for (const file of files) {
            const product = await extractDataFromPDF(path.join(FI_DIR, file));
            if (product) products.push(product);
        }
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Configurazione Multer per upload Excel
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR)
    },
    filename: function (req, file, cb) {
        cb(null, 'portfolio-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Endpoint: Upload e Parsing Portfolio Excel
app.post('/api/portfolio', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nessun file caricato' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Prendiamo il primo foglio
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Pulizia file temporaneo
        fs.unlinkSync(req.file.path);

        res.json({ 
            message: 'Portfolio caricato con successo',
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Errore processamento Excel: ' + error.message });
    }
});

// Endpoint: Leggi portfolio di default (quello nella cartella xls)
app.get('/api/portfolio/default', (req, res) => {
    // Nota: su Vercel i file statici backend devono essere inclusi nella config.
    // Per ora assumiamo che funzioni se la cartella è presente.
    const defaultPath = path.join(__dirname, 'xls', 'RPOL_PatrimonioBuoni.xlsx');
    if (fs.existsSync(defaultPath)) {
        try {
            const workbook = XLSX.readFile(defaultPath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(404).json({ error: 'Default portfolio not found' });
    }
});

// Export per Vercel
export default app;

// Avvio server solo se non siamo in ambiente serverless (o se lanciato direttamente)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server attivo su http://localhost:${PORT}`);
    });
}