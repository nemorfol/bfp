
import * as XLSX from 'xlsx';
import fs from 'fs';

const FILE_PATH = 'F:\\sviluppo\\bfpnew\\api\\xls\\RPOL_PatrimonioBuoni (16).xlsx';

try {
    if (!fs.existsSync(FILE_PATH)) {
        console.error(`File not found: ${FILE_PATH}`);
        process.exit(1);
    }

    const buf = fs.readFileSync(FILE_PATH);
    const workbook = XLSX.read(buf, {type: 'buffer'});
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length > 0) {
        console.log("--- EXCEL HEADERS ---");
        console.log(Object.keys(data[0]));
    }

    console.log("--- EXCEL CONTENT DUMP (FIRST 10 ROWS) ---");
    data.slice(0, 10).forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`);
        console.log(JSON.stringify(row, null, 2));
    });

} catch (err) {
    console.error("Error reading file:", err);
}
