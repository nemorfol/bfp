import { getCoefficients as getCoefficientsSF } from './coefficients';
import { getCoefficientsBO165A } from './coefficients_bo165';

const getCoefficients = (age: number, code: string) => {
    if (code && code.includes('BO165A')) {
        return getCoefficientsBO165A(age);
    }
    return getCoefficientsSF(age);
};

// Helper per generare il piano di ammortamento
export const generateAnnuitySchedule = (netCapitalAt65: number, birthDateStr: string, productCode: string, targetInstallment?: number) => {
      const schedule = [];
      const annualRate = productCode.includes('SF165') ? 0.035 : 0.0235;
      const monthlyRateCalc = Math.pow(1 + annualRate, 1 / 12) - 1;
      const n = 180;

      // Se abbiamo un target (da c_rate), usalo. Altrimenti calcola alla francese.
      const rataTarget = targetInstallment || (netCapitalAt65 * monthlyRateCalc) / (1 - Math.pow(1 + monthlyRateCalc, -n));
      const rataCostanteLorda = rataTarget; // Per ora assumiamo che la rata base sia questa

      let currentCapital = netCapitalAt65;
      const bDate = new Date(birthDateStr);
      let currentDate = new Date(bDate.getFullYear() + 65, bDate.getMonth(), bDate.getDate()); 
      
      for (let i = 1; i <= n; i++) {
          const quotaInteressi = currentCapital * monthlyRateCalc;
          const ritenutaInteressi = quotaInteressi * 0.125;
          const bollo = (currentCapital * 0.002) / 12;
          
          const rataNetta = rataCostanteLorda - bollo;

          const quotaCapitale = rataCostanteLorda - quotaInteressi;

          schedule.push({
              id: i,
              date: currentDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
              capital: currentCapital >= 0 ? currentCapital : 0,
              baseRate: rataCostanteLorda,
              quotaInteressi: quotaInteressi,
              ritenuta: ritenutaInteressi,
              bollo: bollo,
              netRate: rataNetta,
              amount: rataCostanteLorda
          });

          currentCapital -= quotaCapitale;
          if (currentCapital < 0) currentCapital = 0;
          currentDate.setMonth(currentDate.getMonth() + 1);
      }
      return { schedule, rate: annualRate, capital: netCapitalAt65 };
};

export const calculateAggregatedSchedule = (
    portfolioItems: any[],
    code: string,
    inflationRate: number | string,
    birthDate: string,
    ageAtSubscriptionSimulator: number
) => {
      let aggregatedSchedule: any[] = [];
      let globalNetAt65 = 0;
      let globalDebugAges: number[] = [];

      if (portfolioItems.length > 0) {
          portfolioItems.forEach(p => {
              const itemGrossAt65 = p.valoreScadenza || 0;
              const itemInvested = p.nominale;
              
              const gain = itemGrossAt65 - itemInvested;
              const tax = gain > 0 ? gain * 0.125 : 0;
              const itemNetAt65 = itemGrossAt65 - tax;
              
              globalNetAt65 += itemNetAt65;
              
              let itemAge = ageAtSubscriptionSimulator;
              const bDate = new Date(birthDate);
              const birthYearVal = bDate.getFullYear();

              if (p.dataSottoscrizione) {
                   const subDate = new Date(p.dataSottoscrizione);
                   if (!isNaN(subDate.getTime())) {
                        const bDateObj = new Date(birthDate);
                        if (!isNaN(bDateObj.getTime())) {
                            const diffTime = subDate.getTime() - bDateObj.getTime();
                            itemAge = diffTime / (1000 * 60 * 60 * 24 * 365.25);
                        } else {
                            itemAge = subDate.getFullYear() - birthYearVal;
                        }
                   }
              }
              globalDebugAges.push(itemAge);
              
              const coeffs = getCoefficients(itemAge, code);
              let itemTargetInstallment = undefined;
              let itemSimulatedInstallment = 0;
              let itemSimulatedCapital = itemNetAt65; // Default to base capital (inflated usually)
              let baseCapitalToUse = itemNetAt65;     // Default to base capital (inflated usually)
              
              if (coeffs) {
                  // 1. Minimum (or Fixed) Installment
                  const rawMinInst = itemInvested * coeffs.c_rate;
                  const minInst = Math.round(rawMinInst * 100) / 100;
                  
                  itemTargetInstallment = minInst; 
                  
                  // FIX for Base Schedule: Always use Minimum Guaranteed Capital (not Inflated)
                  // if we are in BO165A/SF165A.
                  
                  // Calculate minCapitalAt65 assuming French Amortization reverse
                  const r_min = coeffs.d_rate_gross / 12;
                  const n_min = 180;
                  const factor_min = r_min / (1 - Math.pow(1 + r_min, -n_min));
                  
                  // This is the Capital required to generate minInst at fixed rate
                  const minCapitalAt65 = minInst / factor_min;
                  
                  if (code.includes('BO165A') || code.includes('SF165A')) {
                      // Override with Minimum Capital for Base Schedule
                      baseCapitalToUse = minCapitalAt65;
                  }
                  
                  // --- CALCOLO RATA SIMULATA CON INFLAZIONE ---
                  itemSimulatedInstallment = minInst;
                  if (code.includes('BO165A') || code.includes('SF165A')) {
                      const durationYears = 65 - itemAge;
                      const infRate = parseFloat(String(inflationRate)) || 0;
                      
                      const simGross = itemInvested * Math.pow(1 + infRate/100, durationYears);
                      const simGain = simGross - itemInvested;
                      const simNet = simGross - (simGain > 0 ? simGain * 0.125 : 0);
                      
                      // FIX: Simulated Capital must be at least the Minimum Capital
                      // This ensures that if Inflation < Fixed, we use Fixed Capital (matching Base).
                      // We use baseCapitalToUse which is already the MinCapital.
                      itemSimulatedCapital = Math.max(simNet, baseCapitalToUse);

                      const r = coeffs.d_rate_gross / 12;
                      const n = 180;
                      
                      let simFrenchInst = 0;
                      if (r > 0) {
                          // Use the maximized capital for installment calculation consistency
                          simFrenchInst = itemSimulatedCapital * r / (1 - Math.pow(1 + r, -n));
                      } else {
                          simFrenchInst = itemSimulatedCapital / n;
                      }
                      
                      // itemSimulatedInstallment is simply the French Rata of the Simulated Capital
                      // (which is already Max(min, sim)).
                      // But to be extra safe with rounding:
                      itemSimulatedInstallment = Math.max(minInst, Math.round(simFrenchInst * 100) / 100);
                  }
              }

              // 4. Generate partial schedule (Standard = Minimo)
              // Use baseCapitalToUse (Minimum Capital)
              // 4. Generate partial schedule (Standard = Minimo)
              const { schedule: itemSchedule } = generateAnnuitySchedule(
                  baseCapitalToUse, 
                  birthDate, 
                  code, 
                  itemTargetInstallment
              );
              // Wait, I can just use the variable I defined above but scopes are tricky in replace_file_content if I don't replace everything.
              // I will use the calculated variable.
              // Let's Clean up the logic block to be safe.

              // 5. Aggregate
              itemSchedule.forEach((row: any, i: number) => {
                  if (!aggregatedSchedule[i]) {
                      aggregatedSchedule[i] = { ...row, capital: 0, quotaInteressi: 0, amount: 0, netRate: 0, simulatedRate: 0, baseRate: 0, ritenuta: 0, bollo: 0 };
                  }
                  aggregatedSchedule[i].capital += row.capital;
                  aggregatedSchedule[i].quotaInteressi += row.quotaInteressi;
                  aggregatedSchedule[i].amount += row.amount; 
                  aggregatedSchedule[i].netRate += row.netRate;
                  aggregatedSchedule[i].simulatedRate += itemSimulatedInstallment;
                  aggregatedSchedule[i].baseRate += row.baseRate; 
                  aggregatedSchedule[i].ritenuta += row.ritenuta;
                  aggregatedSchedule[i].bollo += row.bollo;
              });

              // --- 6. Generate Simulated Schedule for detailed view (Bollo/Netto Simulata) ---
              let simSchedule: any[] = [];
              if (itemSimulatedInstallment > 0) {
                 // Use itemSimulatedCapital which reflects the inflated value (simNet)
                 const res = generateAnnuitySchedule(
                     itemSimulatedCapital, 
                     birthDate, 
                     code, 
                     itemSimulatedInstallment
                 );
                 simSchedule = res.schedule;
              }

              // Aggregate Simulated Values
              if (simSchedule.length > 0) {
                  simSchedule.forEach((row: any, i: number) => {
                      if (aggregatedSchedule[i]) {
                          if (!aggregatedSchedule[i].simulatedBollo) aggregatedSchedule[i].simulatedBollo = 0;
                          if (!aggregatedSchedule[i].simulatedNetRate) aggregatedSchedule[i].simulatedNetRate = 0;
                          
                          aggregatedSchedule[i].simulatedBollo += row.bollo;
                          aggregatedSchedule[i].simulatedNetRate += row.netRate;
                      }
                  });
              }
          });
      }
      return { aggregatedSchedule, globalNetAt65, globalDebugAges };
}
