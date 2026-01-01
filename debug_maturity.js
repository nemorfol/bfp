
const BFP_CATALOG = {
  'SF165A': {
    name: 'Soluzione Futuro (BSFed)',
    duration: -1, 
    type: 'annuity',
    fixed_rate: 0.035
  },
  'BO165A': {
    name: 'Obiettivo 65 (BFPO65)',
    duration: -1, 
    type: 'annuity',
    fixed_rate: 0.005 
  }
};

const parseDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    
    if (typeof val === 'number') {
        const date = new Date((val - 25569) * 86400 * 1000);
        return date;
    }

    const str = String(val).trim();
    if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const parts = str.split('/');
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    if (str.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
        return new Date(str);
    }
    
    return null; 
};

const processData = (row) => {
    const keySerie = 'serie';
    const keyScadenza = 'scadenza';
    const keyNominale = 'nominale';
    
    const serieRaw = row[keySerie];
    const nominale = row[keyNominale];
    
    let serieCode = "OTHER";
    Object.keys(BFP_CATALOG).forEach(k => {
        const catalogItem = BFP_CATALOG[k];
        const rawUpper = String(serieRaw).toUpperCase();
        
        // Match logic from App.tsx (current)
        // rawUpper.includes(k) check is strict: "BFPO65".includes("BO165A") is FALSE.
        // We need to check if key is contained in raw or vice versa for specific cases?
        // Or check against catalogItem.name
        
        // "Obiettivo 65 (BFPO65)".toUpperCase() -> "OBIETTIVO..."
        // "BFPO65" (rawUpper) includes "OBIETTIVO..." -> FALSE
        
        // Current App.tsx Logic:
        // rawUpper.includes(k) || rawUpper.includes(catalogItem.name.toUpperCase())
        
        // FIX:
        // If raw is "BFPO65", and catalog name is "Obiettivo 65 (BFPO65)", 
        // rawUpper.includes(name) is false.
        // name.includes(rawUpper) IS TRUE ("...BFPO65...".includes("BFPO65"))
        
        if (
            rawUpper.includes(k) || 
            k.includes(rawUpper) || // ADDED THIS REVERSE CHECK
            rawUpper.includes(catalogItem.name.toUpperCase()) ||
            catalogItem.name.toUpperCase().includes(rawUpper) // ADDED THIS
        ) {
            serieCode = k;
        }
    });

    console.log(`Matched Code: ${serieCode}`);

    let valoreScadenza = 0;
    const item = BFP_CATALOG[serieCode];
    if (item) {
        let finalCoeff = 1;

        if (item.type === 'annuity') {
            const now = new Date();
            let maturityDate = now;
            
            const parsedMaturity = parseDate(row[keyScadenza]);
            console.log(`Parsed Date: ${parsedMaturity}`);
            
            if (parsedMaturity) {
                maturityDate = parsedMaturity;
            }
            
            const msDiff = maturityDate.getTime() - now.getTime();
            const yearsRemaining = msDiff / (1000 * 60 * 60 * 24 * 365.25);
            console.log(`Years Remaining: ${yearsRemaining}`);
            
            const rate = item.fixed_rate || 0.01; 
            
            if (yearsRemaining > 0) {
                    finalCoeff = Math.pow(1 + rate, yearsRemaining);
            }
        }
        valoreScadenza = nominale * finalCoeff;
    }
    console.log(`Valore Scadenza: ${valoreScadenza}`);
}

// Test Case 1: BO165A with String Date
console.log("--- Test 1: BO165A (String Date) ---");
processData({
    serie: 'BFPO65',
    nominale: 1000,
    scadenza: '19/07/2040' // Future date
});

// Test Case 2: SF165A with Excel Serial Date (approx 2040)
console.log("\n--- Test 2: SF165A (Serial Date) ---");
processData({
    serie: 'Soluzione Futuro',
    nominale: 1000,
    scadenza: 51336 // Approx year 2040
});
