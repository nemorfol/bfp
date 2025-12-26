
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'xls', 'RPOL_PatrimonioBuoni.xlsx');

async function testUpload() {
    try {
        const fileContent = fs.readFileSync(filePath);
        const blob = new Blob([fileContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const formData = new FormData();
        formData.append('file', blob, 'test.xlsx');

        console.log("Attempting upload to http://localhost:3000/api/portfolio...");
        const response = await fetch('http://localhost:3000/api/portfolio', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const json = await response.json();
            console.log("Upload SUCCESS:", json);
        } else {
            console.error("Upload FAILED:", response.status, response.statusText);
            const text = await response.text();
            console.error("Response:", text);
        }
    } catch (error) {
        console.error("Fetch ERROR:", error);
    }
}

testUpload();
