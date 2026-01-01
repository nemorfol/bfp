import React from 'react';
import { BookOpen, Monitor, PieChart, TrendingUp, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
    <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
      <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
        <Icon size={24} />
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-6 text-slate-600 space-y-4">
      {children}
    </div>
  </div>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-blue-800 mt-4 mb-2 flex items-center gap-2">
        <ChevronRight size={18} className="text-blue-500"/> {children}
    </h3>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="font-semibold text-blue-700 bg-blue-50 px-1 rounded">{children}</span>
);

export default function Guide() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Manuale Utente BFP Analyzer</h1>
        <p className="text-slate-500">Guida completa all'interfaccia e alle funzionalità di simulazione.</p>
      </div>

      {/* CAPITOLO 1: INTERFACCIA */}
      <Section title="1. Panoramica dell'Interfaccia" icon={Monitor}>
        <p>L'applicazione è progettata per essere intuitiva. Ecco come orientarsi tra le varie aree:</p>
        
        <SubTitle>Barra Superiore (Header)</SubTitle>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Navigazione:</strong> Usa i pulsanti in alto a destra per spostarti tra <em>Simulatore</em>, <em>Portafoglio</em> e questa <em>Guida</em>.</li>
            <li><strong>Parametri Globali:</strong> La barra bianca subito sotto l'header contiene le impostazioni che influenzano tutto il sistema:
                <ul className="list-circle pl-5 mt-1 text-sm text-slate-500 space-y-1">
                    <li><Highlight>Inflazione Stimata</Highlight>: Imposta il tasso annuo previsto (default 2%). Essenziale per calcolare il valore reale del denaro nel futuro.</li>
                    <li><Highlight>Anno di Nascita</Highlight>: Cruciale per i buoni previdenziali (Obiettivo 65, Soluzione Futuro) che maturano a 65 anni.</li>
                    <li><Highlight>Reinvesti a scadenza</Highlight>: Un interruttore speciale (vedi Cap. 4).</li>
                </ul>
            </li>
        </ul>
      </Section>

      {/* CAPITOLO 2: PORTAFOGLIO */}
      <Section title="2. Caricamento Portafoglio (Excel)" icon={PieChart}>
        <p>Questa è la modalità consigliata se possiedi già dei Buoni Fruttiferi Postali.</p>

        <SubTitle>Procedura Passo-Passo</SubTitle>
        <ol className="list-decimal pl-5 space-y-3">
            <li>Scarica il riepilogo dei tuoi buoni dal sito di Poste Italiane in formato <strong>.xlsx</strong>.</li>
            <li>Vai nella scheda <Highlight>Portafoglio</Highlight> dell'applicazione.</li>
            <li>Clicca sul pulsante blu <strong>Carica Excel</strong> e seleziona il file.</li>
            <li>Il sistema elaborerà i dati mostrando:
                <ul className="list-disc pl-5 mt-1 text-sm text-slate-500">
                    <li>Totale Investito (Nominale) e Valore Attuale Lordo.</li>
                    <li>Lista dettagliata di ogni singolo buono.</li>
                </ul>
            </li>
        </ol>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
            <h4 className="font-bold text-green-800 flex items-center gap-2"><CheckCircle2 size={18}/> Modalità Portafoglio Intelligente</h4>
            <p className="text-sm text-green-700 mt-1">
                Dopo il caricamento, il simulatore si <strong>auto-configura</strong>: seleziona solo i tuoi prodotti, imposta gli importi esatti che possiedi e adatta l'orizzonte temporale alle scadenze reali.
            </p>
        </div>
      </Section>

      {/* CAPITOLO 3: SIMULATORE */}
      <Section title="3. Utilizzo del Simulatore" icon={TrendingUp}>
        <p>Nella scheda <Highlight>Simulatore</Highlight> puoi proiettare il valore dei tuoi investimenti nel futuro.</p>

        <SubTitle>Configurazione Manuale</SubTitle>
        <p>Sulla sinistra trovi i pannelli di controllo:</p>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Capitale:</strong> Modifica la cifra da investire. <em className="text-xs text-amber-600">(Attenzione: modificando questo valore manualmente, uscirai dalla "Modalità Portafoglio" e la cifra verrà applicata identica a tutti i prodotti).</em></li>
            <li><strong>Orizzonte Temporale:</strong> Trascina la barra per decidere quanti anni simulare.</li>
            <li><strong>Prodotti:</strong> Spunta le caselle per aggiungere o rimuovere curve dal grafico.</li>
        </ul>

        <SubTitle>Lettura dei Risultati</SubTitle>
        <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div className="p-3 bg-slate-50 rounded border">
                <strong className="text-slate-800">Il Grafico</strong>
                <p className="text-sm mt-1">Mostra l'evoluzione del montante. Usa i tasti in alto a destra del grafico (Tutto, Nominale, Reale) per pulire la visuale.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded border">
                <strong className="text-slate-800">La Tabella</strong>
                <p className="text-sm mt-1">Confronta i numeri esatti. Per i prodotti rendita, troverai l'icona <Highlight>Lista</Highlight> per aprire il piano di ammortamento mensile.</p>
            </div>
        </div>

        <SubTitle>Esportazione Avanzata</SubTitle>
        <p>
            Il pulsante <Highlight>Esporta Excel</Highlight> genera un report completo. Se sono presenti prodotti rendita (BSFed/BFPO65), il file conterrà <strong>fogli dedicati</strong> con l'intero piano di ammortamento delle 180 rate.
        </p>
      </Section>

      {/* CAPITOLO 4: DETTAGLI TECNICI */}
      <Section title="4. Dettagli Tecnici Importanti" icon={BookOpen}>
        
        <SubTitle>Valore Nominale vs Reale</SubTitle>
        <p>
            Il <Highlight>Nominale</Highlight> è la cifra numerica che vedrai sul conto corrente. 
            Il <Highlight>Reale</Highlight> è quanto quella cifra vale rispetto al costo della vita di oggi (depurata dall'inflazione).
            Se il valore reale scende, significa che nonostante gli interessi, puoi comprare meno cose di prima.
        </p>

        <SubTitle>Rata Mensile (Rendita)</SubTitle>
        <p>
            Per prodotti come <strong>Obiettivo 65</strong> o <strong>Soluzione Futuro</strong>, la stima della rata non è una semplice divisione. 
            Il calcolo segue un <strong>piano di ammortamento alla francese</strong> a rata costante: il capitale residuo continua a maturare interessi (es. 3,5% per BSFed) anche durante i 15 anni di erogazione, aumentando l'importo totale che riceverai.
        </p>

        <SubTitle>Funzione "Reinvesti a scadenza"</SubTitle>
        <div className="flex gap-4 items-start mt-2">
            <AlertCircle className="text-blue-500 shrink-0 mt-1" />
            <p className="text-sm">
                Se attivi questa opzione (in alto), il simulatore ipotizza che alla scadenza naturale di un buono, tu sposti immediatamente i soldi su un nuovo investimento che pareggia l'inflazione (Rendimento Reale 0%).
                <br/>
                <strong>Senza reinvestimento:</strong> Dopo la scadenza, i soldi rimangono fermi e l'inflazione se li mangia (la linea reale crolla).
                <br/>
                <strong>Con reinvestimento:</strong> La linea reale rimane piatta dopo la scadenza, preservando il capitale.
            </p>
        </div>

        <SubTitle>Logica Prodotti Previdenziali (BSF/Obiettivo 65)</SubTitle>
        <p>
            Per <strong>Soluzione Futuro</strong> e <strong>Obiettivo 65</strong>, il sistema applica una logica specifica:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li><strong>Calcolo a 65 anni:</strong> Il montante viene calcolato tassativamente al compimento del 65° anno di età (basandosi sul campo "Anno di Nascita"), ignorando eventuali scadenze più lunghe riportate nel file Excel (spesso riferite alla fine della rendita a 80 anni).</li>
            <li><strong>Reattività:</strong> Se modifichi l'Anno di Nascita nel simulatore, il valore di questi buoni si aggiorna istantaneamente.</li>
            <li><strong>Tabella B:</strong> I tassi vengono applicati coerentemente con l'età di sottoscrizione (Tabella B dei Fogli Informativi).</li>
        </ul>

        <SubTitle>Dettaglio Rendita (Base vs Simulata)</SubTitle>
        <p>
            Cliccando sull'icona <Highlight>Lista</Highlight> nella tabella, aprirai il dettaglio mensile che ora mostra due scenari affiancati:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li><strong>Rata Netta (Base):</strong> Calcolata sul <em>Capitale Minimo Garantito</em> (Rendimento Fisso: 1.5% per Soluzione Futuro, 0.5% per Obiettivo 65). Questa è la cifra sicura che percepirai comunque.</li>
            <li><strong>Rata Netta (Simulata):</strong> Calcolata ipotizzando che l'inflazione sia quella impostata (es. 2%).
                <br/>
                <em className="text-xs text-blue-600">Nota: Il sistema applica intelligentemente un "Floor": se l'inflazione impostata è inferiore al tasso minimo garantito, la simulazione si allineerà automaticamente al valore base, perché non puoi mai prendere meno del minimo.</em>
            </li>
        </ul>

        <SubTitle>Caricamento ed Esportazione Excel</SubTitle>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li><strong>Override Manuale:</strong> Se il tuo file Excel contiene una colonna <em>"VALORE LORDO A SCADENZA"</em>, il sistema userà quel valore prioritariamente (salvo per i prodotti previdenziali che vengono ricalcolati).</li>
            <li><strong>Export Migliorato:</strong> L'esportazione portafoglio ora genera un file <strong>.xlsx</strong> nativo, formattato correttamente e comprensivo dei valori a scadenza calcolati.</li>
        </ul>
      </Section>

    </div>
  );
}
