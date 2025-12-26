import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, FileText, TrendingUp, Download, Settings, Calculator, PieChart, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import Guide from './Guide';

/**
 * DATI STATICI (Fallback) + Logica Simulazione
 */
const BFP_CATALOG: Record<string, any> = {
  'TF120A': {
    name: 'Buono Ordinario',
    desc: 'Durata 20 anni, tassi crescenti',
    duration: 20,
    type: 'step_up',
    yields: [0.05, 0.05, 0.05, 0.05, 0.25, 0.50, 0.75, 1.00, 1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00].map(x => x / 100) 
  },
  'TF212A': {
    name: 'Buono 3x4',
    desc: 'Durata 12 anni, scatti ogni 3 anni',
    duration: 12,
    type: 'step_up_fixed',
    steps: { 3: 0.01, 6: 0.015, 9: 0.0225, 12: 0.03 }
  },
  'TF004A': {
    name: 'Buono Premium 4 anni',
    desc: 'Durata 4 anni, premio a scadenza',
    duration: 4,
    type: 'fixed_maturity',
    finalCoeff: 1.10381289
  },
  'TF604A': {
    name: 'Buono Rinnova',
    desc: 'Durata 4 anni, dedicato a chi rinnova',
    duration: 4,
    type: 'fixed_maturity',
    finalCoeff: 1.06136355
  },
  'TF504A': {
    name: 'Buono 4 Anni Plus',
    desc: 'Durata 4 anni standard',
    duration: 4,
    type: 'fixed_maturity',
    finalCoeff: 1.05094534
  },
  'SF165A': {
    name: 'Soluzione Futuro (BSFed)',
    desc: 'Rendita 65-80 anni (Min. 3.5% o Inflazione)',
    duration: -1, 
    type: 'annuity',
    fixed_rate: 0.035
  },
  'BO165A': {
    name: 'Obiettivo 65 (BFPO65)',
    desc: 'Rendita 65-80 anni (Min. 0.5% o Inflazione)',
    duration: -1, 
    type: 'annuity',
    fixed_rate: 0.005 // Tasso minimo molto più basso per le vecchie emissioni
  },
  'IL110A': {
    name: 'Indicizzato Inflazione',
    desc: '10 anni, protegge capitale + spread',
    duration: 10,
    type: 'inflation_linked',
    spread: 0.006
  }
};

// Palette colori ad alto contrasto per distinguere le serie
const DISTINCT_COLORS = [
  '#dc2626', // Rosso Acceso
  '#2563eb', // Blu Reale
  '#16a34a', // Verde
  '#d97706', // Arancione
  '#9333ea', // Viola
  '#0891b2', // Ciano Scuro
  '#db2777', // Rosa/Magenta
  '#4b5563', // Grigio Scuro
];

const calculateNet = (principal: number, grossValue: number) => {
  const gain = grossValue - principal;
  const tax = gain > 0 ? gain * 0.125 : 0;
  return grossValue - tax;
};

// Componente Card UI
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>{children}</div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('comparator');
  
  // Parametri Simulazione
  const [simulationAmount, setSimulationAmount] = useState(10000);
  const [inflationRate, setInflationRate] = useState(2.0);
  const [customDuration, setCustomDuration] = useState(20);
  const [birthYear, setBirthYear] = useState(1980); // Default: 45 anni circa
  const [selectedProducts, setSelectedProducts] = useState(['TF120A', 'TF212A']);
  // Mappa degli importi specifici per prodotto (es. caricati da Excel)
  const [productAmounts, setProductAmounts] = useState<Record<string, number>>({});
  
  // View Modes
  const [chartMode, setChartMode] = useState<'all' | 'nominal' | 'real'>('all');
  const [reinvestExpired, setReinvestExpired] = useState(false);

  // Portafoglio
  const [portfolioData, setPortfolioData] = useState<any[]>([]);

  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- LOGICA DI CALCOLO ---
  const comparisonData = useMemo(() => {
    const data = [];
    const currentYear = new Date().getFullYear();
    const userAge = currentYear - birthYear;
    
    for (let year = 0; year <= customDuration; year++) {
      const point: any = { year };
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);

      selectedProducts.forEach(code => {
        const prod = BFP_CATALOG[code];
        if (!prod) return;

        // Usa l'importo specifico del prodotto se presente (modalità portafoglio), altrimenti quello globale
        const investedAmount = productAmounts[code] !== undefined ? productAmounts[code] : simulationAmount;
        let grossVal = investedAmount;

        // Logica dinamica durata
        let productDuration = prod.duration;
        
        // Logica specifica Soluzione Futuro / Obiettivo 65 (fino a 65 anni)
        if (code === 'SF165A' || code === 'BO165A') {
            const yearsTo65 = 65 - userAge;
            productDuration = yearsTo65 > 0 ? yearsTo65 : 0;
        }

        const isExpired = year > productDuration;
        const limitYear = isExpired ? productDuration : year;

        if (year === 0) {
          grossVal = investedAmount;
        } else {
           // 1. Calcolo valore alla scadenza (o anno corrente se non scaduto)
           let baseVal = investedAmount;
           
           if (prod.type === 'step_up') {
             const rate = prod.yields[Math.min(limitYear, prod.yields.length) - 1] || 0;
             baseVal = investedAmount * Math.pow(1 + rate, limitYear);
           } else if (prod.type === 'step_up_fixed') {
             let bestRate = 0;
             Object.keys(prod.steps).forEach(stepYear => {
               if (limitYear >= parseInt(stepYear)) bestRate = prod.steps[stepYear as any];
             });
             baseVal = bestRate > 0 ? investedAmount * Math.pow(1 + bestRate, limitYear) : investedAmount;
           } else if (prod.type === 'fixed_maturity') {
             baseVal = limitYear === productDuration ? investedAmount * prod.finalCoeff : investedAmount;
           } else if (prod.type === 'inflation_linked') {
             baseVal = investedAmount * Math.pow(1 + inflationRate/100, limitYear) * Math.pow(1 + (prod.spread || 0), limitYear);
           } else if (prod.type === 'annuity') {
             // LOGICA "Obiettivo 65 / Soluzione Futuro":
             // La protezione dall'inflazione scatta SOLO alla scadenza della fase di accumulo (65 anni).
             // Prima dei 65 anni, in caso di rimborso anticipato, si ottiene solo il montante al tasso fisso.
             
             const infRate = parseFloat(String(inflationRate));
             const effectiveInflationRate = isNaN(infRate) ? 0 : infRate / 100;
             const effectiveFixedRate = prod.fixed_rate || 0;

             // Montante Tasso Fisso (garantito anche in caso di rimborso anticipato, salvo penali qui ignorate per semplicità)
             const valFixed = investedAmount * Math.pow(1 + effectiveFixedRate, limitYear);
             
             // Montante Inflazione (solo a scadenza 65 anni)
             const valInflation = investedAmount * Math.pow(1 + effectiveInflationRate, limitYear);
             
             // Se non siamo ancora arrivati a 65 anni (o se il prodotto non ha scadenza definita per errore), niente inflazione.
             // productDuration qui è calcolato dinamico come (65 - userAge)
             if (limitYear < productDuration) {
                 baseVal = valFixed; 
             } else {
                 // A 65 anni scatta la garanzia: prendo il maggiore tra Fisso e Inflazione
                 baseVal = Math.max(valFixed, valInflation);
             }
           }

           // 2. Se scaduto e reinvestimento attivo, applica inflazione per gli anni extra
           if (isExpired && reinvestExpired) {
               const extraYears = year - productDuration;
               // Reinvestimento neutro: il capitale cresce pari all'inflazione (Valore Reale rimane costante)
               baseVal = baseVal * Math.pow(1 + inflationRate/100, extraYears);
           }
           
           grossVal = baseVal;
        }

        const netVal = calculateNet(investedAmount, grossVal);
        const realVal = netVal / inflationFactor;

        point[`${code}_nominal`] = parseFloat(netVal.toFixed(2));
        point[`${code}_real`] = parseFloat(realVal.toFixed(2));
      });

      data.push(point);
    }
    return data;
  }, [simulationAmount, inflationRate, customDuration, selectedProducts, birthYear, reinvestExpired, productAmounts]);

  // --- UPLOAD EXCEL ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const loadDefaultPortfolio = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const response = await fetch('/api/portfolio/default');
      if (!response.ok) throw new Error('File di default non trovato');
      const data = await response.json();
      processPortfolioData(data);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload fallito');
      const result = await response.json();
      processPortfolioData(result.data);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const processPortfolioData = (data: any[]) => {
    if (!data || data.length === 0) return;

    // Mapping dinamico delle colonne
    const keys = Object.keys(data[0]);
    const findKey = (term: string) => keys.find(k => k.toLowerCase().includes(term.toLowerCase()));

    const keySerie = findKey('serie') || findKey('tipologia');
    const keyNominale = findKey('nominale') || findKey('capitale') || findKey('importo');
    const keyScadenza = findKey('scadenza');
    const keyValore = findKey('rimborso') || findKey('valore') || findKey('liquidazione');

    let totalNominale = 0;
    let totalLiquidation = 0;
    const parsed = [];

    // Helper per pulire numeri formattati (es. "€ 1.000,00" -> 1000.00)
    const parseCurrency = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const str = String(val);
        // Rimuove tutto tranne numeri, virgole e meno. Rimuove i punti (migliaia).
        // Presuppone formato italiano (1.000,00)
        const clean = str.replace(/[^\d,-]/g, '').replace(',', '.');
        return parseFloat(clean);
    };

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const nominale = parseCurrency(row[keyNominale!]);
        const valore = parseCurrency(row[keyValore!]);
        
        if (nominale > 0) {
            const serieRaw = row[keySerie!] || "Sconosciuto";
            let serieCode = "OTHER";
            Object.keys(BFP_CATALOG).forEach(k => {
                if (String(serieRaw).includes(k)) serieCode = k;
            });

            parsed.push({
                id: i,
                serie: serieCode,
                serieRaw: serieRaw,
                scadenza: row[keyScadenza!],
                nominale: nominale || 0,
                valoreAttuale: valore || 0,
                prodotto: BFP_CATALOG[serieCode] ? BFP_CATALOG[serieCode].name : serieRaw
            });

            totalNominale += (nominale || 0);
            totalLiquidation += (valore || 0);
        }
    }

    setPortfolioData(parsed);
    setPortfolioSummary({
        totalNominale,
        totalLiquidation,
        count: parsed.length
    });

    // --- AUTO-CONFIGURAZIONE SIMULATORE ---
    
    // 1. Calcola importi per singolo prodotto e totali
    const amountsByProduct: Record<string, number> = {};
    const uniqueSeries = new Set<string>();
    let maxYear = new Date().getFullYear();
    let estimatedBirthYear: number | null = null;

    parsed.forEach(p => {
        // Aggrega importi per codice prodotto
        if (BFP_CATALOG[p.serie]) {
            if (!amountsByProduct[p.serie]) amountsByProduct[p.serie] = 0;
            amountsByProduct[p.serie] += p.nominale;
            uniqueSeries.add(p.serie);
        }

        // Estrai l'anno dalla stringa di scadenza
        const yearMatch = String(p.scadenza).match(/\d{4}/);
        if (yearMatch) {
            const y = parseInt(yearMatch[0]);
            if (y > maxYear) maxYear = y;

            if ((p.serie.includes('BO165') || p.serie.includes('SF165')) && !estimatedBirthYear) {
                estimatedBirthYear = y - 65;
            }
        }
    });

    // Imposta gli importi specifici (questo attiverà la "Modalità Portafoglio" nel simulatore)
    setProductAmounts(amountsByProduct);
    
    // Imposta comunque il totale globale come fallback visivo
    setSimulationAmount(totalNominale);

    // 2. Seleziona i prodotti trovati
    if (uniqueSeries.size > 0) {
        setSelectedProducts(Array.from(uniqueSeries));
    }

    // 3. Imposta orizzonte temporale e anno nascita
    const yearsFromNow = maxYear - new Date().getFullYear();
    setCustomDuration(yearsFromNow > 0 ? yearsFromNow + 1 : 20);

    if (estimatedBirthYear) {
        setBirthYear(estimatedBirthYear);
    }

    setActiveTab('portfolio');
  };

  const exportPortfolio = () => {
    if (portfolioData.length === 0) return;
    const header = ["ID", "Serie", "Prodotto", "Nominale", "Valore Attuale", "Scadenza"];
    const rows = portfolioData.map(p => [p.id, p.serie, p.prodotto, p.nominale, p.valoreAttuale, p.scadenza]);
    const csvContent = "data:text/csv;charset=utf-8," + [header.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analisi_portafoglio_bfp.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-blue-800 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Calculator className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">BFP Analyzer Pro</h1>
              <p className="text-blue-200 text-sm">Simulatore Buoni Fruttiferi Postali e Analisi Portafoglio</p>
            </div>
          </div>
          <div className="flex bg-blue-900 rounded-lg p-1">
            <button onClick={() => setActiveTab('comparator')} className={`px-4 py-2 rounded-md transition-all ${activeTab === 'comparator' ? 'bg-white text-blue-900 shadow' : 'text-blue-300 hover:text-white'}`}>
              <div className="flex items-center gap-2"><TrendingUp size={18}/> Simulatore</div>
            </button>
            <button onClick={() => setActiveTab('portfolio')} className={`px-4 py-2 rounded-md transition-all ${activeTab === 'portfolio' ? 'bg-white text-blue-900 shadow' : 'text-blue-300 hover:text-white'}`}>
              <div className="flex items-center gap-2"><PieChart size={18}/> Portafoglio</div>
            </button>
            <button onClick={() => setActiveTab('guide')} className={`px-4 py-2 rounded-md transition-all ${activeTab === 'guide' ? 'bg-white text-blue-900 shadow' : 'text-blue-300 hover:text-white'}`}>
              <div className="flex items-center gap-2"><BookOpen size={18}/> Guida</div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Parametri Macro */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Settings className="w-5 h-5 text-blue-600" />
            Parametri Utente
          </div>
          <div className="flex items-center gap-4 border-l pl-6 border-slate-300">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Inflazione Stimata (%)</label>
              <input 
                type="number" step="0.1" value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                className="mt-1 w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">Anno di Nascita</label>
              <input 
                type="number" min="1920" max={new Date().getFullYear()} value={birthYear}
                onChange={(e) => setBirthYear(parseInt(e.target.value))}
                className="mt-1 w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              />
            </div>
            <div className="text-sm text-slate-500 max-w-xs leading-tight hidden md:block">
               L'età influisce sui prodotti previdenziali come <strong>Soluzione Futuro</strong>.
            </div>
          </div>
          
          <div className="flex items-center gap-2 border-l pl-6 border-slate-300">
             <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={`w-10 h-6 flex items-center bg-slate-300 rounded-full p-1 duration-300 ease-in-out ${reinvestExpired ? 'bg-green-500' : ''}`} onClick={() => setReinvestExpired(!reinvestExpired)}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${reinvestExpired ? 'translate-x-4' : ''}`}></div>
                </div>
                <div className="text-sm font-semibold text-slate-700">Reinvesti a scadenza</div>
             </label>
             <div className="group relative">
                <AlertCircle size={16} className="text-slate-400 cursor-help"/>
                <div className="absolute left-0 bottom-6 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-50">
                    Se attivo, alla scadenza naturale del buono si assume che il capitale venga reinvestito proteggendolo dall'inflazione (Rendimento Reale = 0%).
                </div>
             </div>
          </div>
        </div>

        {activeTab === 'guide' && <Guide />}

        {activeTab === 'comparator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                  <Calculator size={20}/> Configura
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Capitale da Investire (€)</label>
                    <input 
                      type="number" value={simulationAmount}
                      onChange={(e) => {
                          setSimulationAmount(parseFloat(e.target.value));
                          setProductAmounts({}); // Reset importi specifici se l'utente cambia manualmente
                      }}
                      className="w-full p-2 border rounded-md bg-slate-50 font-mono text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Orizzonte (Anni): {customDuration}</label>
                    <input 
                      type="range" min="1" max="30" value={customDuration}
                      onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-bold mb-4 text-blue-800">Seleziona Prodotti</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {Object.keys(BFP_CATALOG).map(code => (
                    <label key={code} className="flex items-start p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                      <input 
                        type="checkbox"
                        checked={selectedProducts.includes(code)}
                        onChange={() => {
                          if (selectedProducts.includes(code)) setSelectedProducts(selectedProducts.filter(c => c !== code));
                          else setSelectedProducts([...selectedProducts, code]);
                        }}
                        className="mt-1 mr-3 w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-blue-700">{BFP_CATALOG[code].name}</div>
                        <div className="text-xs text-slate-500">{BFP_CATALOG[code].desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="h-[500px] flex flex-col">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <h3 className="text-lg font-semibold text-slate-800">Proiezione Valore</h3>
                    
                    {/* Controlli Grafico */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setChartMode('all')}
                            className={`px-3 py-1 text-sm rounded-md transition ${chartMode === 'all' ? 'bg-white shadow text-blue-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >Tutto</button>
                        <button 
                            onClick={() => setChartMode('nominal')}
                            className={`px-3 py-1 text-sm rounded-md transition ${chartMode === 'nominal' ? 'bg-white shadow text-blue-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >Solo Nominale</button>
                        <button 
                            onClick={() => setChartMode('real')}
                            className={`px-3 py-1 text-sm rounded-md transition ${chartMode === 'real' ? 'bg-white shadow text-blue-700 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                        >Solo Reale</button>
                    </div>
                </div>

                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="year" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: any) => [
                          `€ ${new Intl.NumberFormat('it-IT').format(Number(value))}`,
                          name
                        ]}
                        labelFormatter={(label) => `Anno ${label}`}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      {selectedProducts.map((code, index) => {
                         const color = DISTINCT_COLORS[index % DISTINCT_COLORS.length];
                         const prodName = BFP_CATALOG[code].name;
                         
                         return (
                           <React.Fragment key={code}>
                             {(chartMode === 'all' || chartMode === 'nominal') && (
                                <Line 
                                    type="monotone" 
                                    dataKey={`${code}_nominal`} 
                                    name={`${prodName} (Nom)`} 
                                    stroke={color} 
                                    strokeWidth={2} 
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                             )}
                             {(chartMode === 'all' || chartMode === 'real') && (
                                <Line 
                                    type="monotone" 
                                    dataKey={`${code}_real`} 
                                    name={`${prodName} (Reale)`} 
                                    stroke={color} 
                                    strokeDasharray="4 4" 
                                    strokeWidth={2} 
                                    dot={false} 
                                    opacity={0.7} 
                                />
                             )}
                           </React.Fragment>
                         );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

               <div className="overflow-x-auto bg-white rounded-lg shadow border border-slate-100">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Prodotto</th>
                      <th className="px-6 py-3 text-right">Investito</th>
                      <th className="px-6 py-3 text-right">Netto Finale</th>
                      <th className="px-6 py-3 text-right">Reale Finale</th>
                      <th className="px-6 py-3 text-right">Guadagno Reale</th>
                      <th className="px-6 py-3 text-right bg-blue-50 text-blue-800">Rata Mensile (Stima 15y)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((code, index) => {
                      const finalData = comparisonData[comparisonData.length - 1];
                      const nominal = finalData[`${code}_nominal`];
                      const real = finalData[`${code}_real`];
                      const invested = productAmounts[code] !== undefined ? productAmounts[code] : simulationAmount;
                      const isPositive = real > invested;
                      const color = DISTINCT_COLORS[index % DISTINCT_COLORS.length];
                      
                      // Calcolo Rata solo per prodotti Annuity e solo se si è raggiunta l'età di 65 anni
                      const currentYear = new Date().getFullYear();
                      const userAgeAtEnd = (currentYear - birthYear) + customDuration;
                      const isAnnuity = BFP_CATALOG[code].type === 'annuity';
                      const canReceiveAnnuity = isAnnuity && userAgeAtEnd >= 65;
                      const monthlyRate = canReceiveAnnuity ? nominal / 180 : 0;

                      return (
                        <tr key={code} className="border-b hover:bg-slate-50 last:border-0">
                          <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{backgroundColor: color}}></div>
                             {BFP_CATALOG[code].name}
                          </td>
                          <td className="px-6 py-4 text-right">€ {new Intl.NumberFormat('it-IT').format(invested)}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">€ {new Intl.NumberFormat('it-IT').format(nominal)}</td>
                          <td className="px-6 py-4 text-right text-slate-600">€ {new Intl.NumberFormat('it-IT').format(real)}</td>
                          <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {((real - invested) / invested * 100).toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-blue-700 bg-blue-50">
                            {isAnnuity 
                                ? (userAgeAtEnd >= 65 
                                    ? `€ ${new Intl.NumberFormat('it-IT').format(monthlyRate)}`
                                    : <span className="text-[10px] text-slate-400 font-sans uppercase">Dai 65 anni</span>)
                                : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Note Tecniche sui Prodotti */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-amber-50 border-amber-100 p-4">
                    <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2 text-sm">
                        <AlertCircle size={16}/> Note sul Calcolo
                    </h4>
                    <ul className="text-xs text-amber-900 space-y-1 list-disc ml-4">
                        <li><strong>Reinvestimento:</strong> Se attivo, dopo la scadenza il capitale si rivaluta pari all'inflazione.</li>
                        <li><strong>Tassazione:</strong> 12.5% sugli interessi. <strong>Bollo:</strong> Non incluso (0.2%).</li>
                    </ul>
                </Card>
                <Card className="bg-blue-50 border-blue-100 p-4">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2 text-sm">
                        <FileText size={16}/> Focus Prodotti
                    </h4>
                    <div className="text-xs text-blue-900">
                        {selectedProducts.includes('SF165A') && <p><strong>BSF:</strong> Minimo 3.5% o Inflazione.</p>}
                        {selectedProducts.includes('BO165A') && <p><strong>Obiettivo 65:</strong> Minimo 0.5% o Inflazione.</p>}
                    </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* --- PORTFOLIO TAB (Invariato, ma con stile Tailwind) --- */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
             <Card className="border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Carica il tuo file Excel</h2>
                    <p className="text-slate-600 mt-1">Carica il file Excel (.xlsx) per analizzare il tuo patrimonio.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                        onClick={loadDefaultPortfolio}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                        Carica Default
                    </button>
                    <label className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                      {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                      <span>{isUploading ? 'Analisi...' : 'Carica Excel'}</span>
                      <input type='file' accept='.xlsx, .xls' onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                    </label>
                    {portfolioData.length > 0 && (
                      <button onClick={exportPortfolio} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                        <Download size={18} /> Esporta
                      </button>
                    )}
                  </div>
                </div>
                {uploadError && <div className="mt-4 text-red-600 bg-red-50 p-2 rounded">{uploadError}</div>}
             </Card>

             {portfolioData.length > 0 ? (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card className="bg-blue-50 border border-blue-100">
                      <div className="text-slate-500 text-sm font-semibold uppercase">Valore Nominale Totale</div>
                      <div className="text-3xl font-bold text-blue-800 mt-2">€ {new Intl.NumberFormat('it-IT').format(portfolioSummary?.totalNominale)}</div>
                   </Card>
                   <Card className="bg-green-50 border border-green-100">
                      <div className="text-slate-500 text-sm font-semibold uppercase">Valore Attuale Lordo</div>
                      <div className="text-3xl font-bold text-green-800 mt-2">€ {new Intl.NumberFormat('it-IT').format(portfolioSummary?.totalLiquidation)}</div>
                   </Card>
                   <Card className="bg-purple-50 border border-purple-100">
                      <div className="text-slate-500 text-sm font-semibold uppercase">N° Buoni</div>
                      <div className="text-3xl font-bold text-purple-800 mt-2">{portfolioSummary?.count}</div>
                   </Card>
                 </div>

                 <Card>
                   <h3 className="font-bold mb-4">Dettaglio Buoni Caricati</h3>
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                       <thead>
                         <tr className="bg-slate-100 text-left">
                           <th className="p-3 rounded-tl-lg">Serie</th>
                           <th className="p-3">Descrizione</th>
                           <th className="p-3 text-right">Nominale</th>
                           <th className="p-3 text-right">Val. Attuale</th>
                           <th className="p-3 rounded-tr-lg">Scadenza</th>
                         </tr>
                       </thead>
                       <tbody>
                         {portfolioData.map((row) => (
                           <tr key={row.id} className="border-b hover:bg-slate-50">
                             <td className="p-3 font-mono text-blue-600">{row.serie}</td>
                             <td className="p-3">{row.prodotto}</td>
                             <td className="p-3 text-right font-medium">€ {new Intl.NumberFormat('it-IT').format(row.nominale)}</td>
                             <td className="p-3 text-right font-bold text-green-700">€ {new Intl.NumberFormat('it-IT').format(row.valoreAttuale)}</td>
                             <td className="p-3">{row.scadenza}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </Card>
               </>
             ) : (
               <div className="text-center py-20 text-slate-400 bg-white rounded-lg border-2 border-dashed border-slate-300">
                 <FileText className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                 <p className="text-lg">Trascina qui il tuo file Excel</p>
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
