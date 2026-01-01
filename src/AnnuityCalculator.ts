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
          
          const rataNetta = rataCostanteLorda - ritenutaInteressi - bollo;

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
              
              if (coeffs) {
                  // 1. Minimum (or Fixed) Installment
                  const rawMinInst = itemInvested * coeffs.c_rate;
                  const minInst = Math.round(rawMinInst * 100) / 100;
                  
                  itemTargetInstallment = minInst; 
                  
                  // --- CALCOLO RATA SIMULATA CON INFLAZIONE ---
                  itemSimulatedInstallment = minInst;
                  if (code.includes('BO165A')) {
                      const durationYears = 65 - itemAge;
                      const infRate = parseFloat(String(inflationRate)) || 0;
                      
                      const simGross = itemInvested * Math.pow(1 + infRate/100, durationYears);
                      const simGain = simGross - itemInvested;
                      const simNet = simGross - (simGain > 0 ? simGain * 0.125 : 0);
                      
                      const r = coeffs.d_rate_gross / 12;
                      const n = 180;
                      
                      let simFrenchInst = 0;
                      if (r > 0) {
                          simFrenchInst = simNet * r / (1 - Math.pow(1 + r, -n));
                      } else {
                          simFrenchInst = simNet / n;
                      }
                      
                      itemSimulatedInstallment = Math.max(minInst, Math.round(simFrenchInst * 100) / 100);
                  }
              }

              // 4. Generate partial schedule (Standard = Minimo)
              const { schedule: itemSchedule } = generateAnnuitySchedule(
                  itemNetAt65, 
                  birthDate, 
                  code, 
                  itemTargetInstallment
              );

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
          });
      }
      return { aggregatedSchedule, globalNetAt65, globalDebugAges };
}
