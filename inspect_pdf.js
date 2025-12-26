
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('fi/fi-BO165A201118-241221.pdf');

pdf(dataBuffer).then(function(data) {
    console.log("--- TEXT EXTRACT ---");
    // Cerco parole chiave per capire il meccanismo
    const relevantText = data.text.match(/(tasso|fisso|minimo|garantito|inflazione|spread|foi|coefficiente)/gi);
    console.log(data.text.slice(0, 3000)); // Primi 3000 caratteri per leggere descrizione e tassi
});
