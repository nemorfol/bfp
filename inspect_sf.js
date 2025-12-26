
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('fi/fi-SF165A231115-240625.pdf');

pdf(dataBuffer).then(function(data) {
    console.log("--- TEXT EXTRACT SF165A ---");
    // Cerco frasi chiave su rimborso anticipato e inflazione
    console.log(data.text.slice(0, 4000)); 
});
