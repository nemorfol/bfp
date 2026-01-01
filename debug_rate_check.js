
function calculateRata(capital, annualRate) {
    const r_m = Math.pow(1 + annualRate, 1/12) - 1; // Compound
    const n = 180;
    return (capital * r_m) / (1 - Math.pow(1 + r_m, -n));
}

function calculateRataSimple(capital, annualRate) {
    const r_m = annualRate / 12; // Simple
    const n = 180;
    return (capital * r_m) / (1 - Math.pow(1 + r_m, -n));
}

const targetRata = 588.98;
const currentRata = 572.98;
const currentRate = 0.035;

// Infer Capital from current calculation
const r_m_current = Math.pow(1 + currentRate, 1/12) - 1;
const n = 180;
const capital = currentRata * (1 - Math.pow(1 + r_m_current, -n)) / r_m_current;

console.log(`Estimated Capital: ${capital.toFixed(2)}`);

// Try different rates
for (let r = 0.030; r < 0.050; r += 0.0001) {
    const val = calculateRata(capital, r);
    const valSimple = calculateRataSimple(capital, r);
    
    if (Math.abs(val - targetRata) < 1) {
        console.log(`MATCH COMPOUND: Rate ${(r*100).toFixed(2)}% gives Rata ${val.toFixed(2)}`);
    }
    if (Math.abs(valSimple - targetRata) < 1) {
        console.log(`MATCH SIMPLE: Rate ${(r*100).toFixed(2)}% gives Rata ${valSimple.toFixed(2)}`);
    }
}
