# Guida all'uso di BFP Analyzer Pro

Benvenuto in **BFP Analyzer Pro**, lo strumento avanzato per l'analisi e la simulazione dei Buoni Fruttiferi Postali. Questa applicazione ti permette di analizzare il tuo portafoglio reale (tramite file Excel) o di simulare investimenti futuri, confrontando diverse tipologie di buoni al netto di tasse e inflazione.

---

## 1. Modalità Portafoglio (Caricamento Excel)
Questa è la modalità consigliata per chi possiede già dei buoni e vuole analizzare la propria situazione.

### Come funziona
1.  **Esporta i dati**: Accedi alla tua area riservata sul sito di Poste Italiane ed esporta il riepilogo dei tuoi buoni in formato Excel (`.xlsx` o `.xls`).
2.  **Carica il file**: 
    - Vai nella scheda **"Portafoglio"** dell'applicazione.
    - Clicca su **"Carica Excel"** e seleziona il file scaricato.
3.  **Analisi Automatica**:
    - Il sistema leggerà tutti i buoni presenti nel file.
    - Verrà mostrato un riepilogo con: **Valore Nominale Totale**, **Valore Attuale Lordo** (inclusi interessi maturati) e numero di buoni.
    - Una tabella dettagliata mostrerà ogni singolo buono con la relativa scadenza e serie.

### Effetti sul Simulatore ("Modalità Portafoglio Intelligente")
Una volta caricato il file, il **Simulatore** si autoconfigura automaticamente:
- **Prodotti**: Vengono selezionati automaticamente solo i prodotti che possiedi (es. *Obiettivo 65*, *Soluzione Futuro*).
- **Importi Reali**: Il simulatore utilizzerà l'importo esatto che possiedi per ogni prodotto. 
    > *Esempio: Se hai 5.000€ su BSFed e 10.000€ su BFPO65, le proiezioni verranno calcolate separatamente su queste cifre.*
- **Durata e Età**: L'orizzonte temporale del grafico si estenderà fino alla scadenza del tuo buono più longevo e, se presenti prodotti previdenziali, verrà stimato il tuo anno di nascita per calcoli precisi.

---

## 2. Modalità Simulatore Manuale
Se non hai un file Excel o vuoi ipotizzare nuovi investimenti.

1.  Vai nella scheda **"Simulatore"**.
2.  **Configura Parametri**:
    - **Capitale da Investire**: Inserisci la cifra che vuoi simulare (es. 10.000€).
        > *Nota: Modificando manualmente questa cifra, si esce dalla "Modalità Portafoglio" e la cifra inserita verrà applicata uguale a tutti i prodotti selezionati.*
    - **Orizzonte (Anni)**: Trascina la barra per decidere per quanti anni vedere la proiezione (es. 20 o 30 anni).
    - **Inflazione Stimata**: Imposta un tasso di inflazione annuo previsto (default 2%). Questo è cruciale per capire il potere d'acquisto reale futuro.
    - **Anno di Nascita**: Importante per i prodotti previdenziali (*Soluzione Futuro/Obiettivo 65*) che maturano al compimento del 65° anno di età.

3.  **Seleziona Prodotti**:
    - Spunta le caselle dei buoni che vuoi confrontare (es. *Buono Ordinario*, *Buono 3x4*, ecc.).

---

## 3. Interpretazione dei Risultati

### Il Grafico
Il grafico mostra l'andamento del valore nel tempo. Puoi scegliere tre viste:
- **Tutto**: Mostra sia il valore nominale (soldi in tasca) che quello reale (potere d'acquisto).
- **Solo Nominale**: La cifra netta che riceverai, tasse incluse (linea solida).
- **Solo Reale**: Il valore del tuo investimento depurato dall'inflazione (linea tratteggiata). Se la linea scende, stai perdendo potere d'acquisto.

### La Tabella Comparativa
Per ogni prodotto selezionato vengono mostrati:
- **Investito**: Il capitale iniziale (o quello rilevato dall'Excel).
- **Netto Finale**: La cifra in Euro che incasserai a scadenza (al netto del 12.5% di tasse).
- **Reale Finale**: Quanto vale quella cifra in termini di potere d'acquisto oggi.
- **Rata Mensile (Stima 15y)**:
    - Visibile **solo per prodotti di tipo Rendita** (es. *BSFed*, *BFPO65*).
    - Viene calcolata dividendo il montante netto per 180 mesi (15 anni, dai 65 agli 80 anni).
    - **Attenzione**: Questa colonna mostra un valore solo se la simulazione raggiunge o supera il tuo 65° anno di età. In caso contrario apparirà la scritta **"DAI 65 ANNI"**.

---

## 4. Concetti Chiave

### Reinvesti a Scadenza
C'è un interruttore chiamato **"Reinvesti a scadenza"**.
- **Se DISATTIVO (Default)**: Quando un buono scade (es. un buono a 4 anni in un grafico a 20 anni), il capitale rimane "fermo" in un conto infruttifero. L'inflazione continuerà a eroderne il valore reale anno dopo anno.
- **Se ATTIVO**: Il sistema simula che, alla scadenza naturale del buono, tu reinvesta immediatamente il capitale in uno strumento che pareggia esattamente l'inflazione (rendimento reale 0%). Nel grafico vedrai il valore nominale salire per seguire l'inflazione, impedendo al valore reale di crollare.

### Prodotti Previdenziali (BSFed / BFPO65)
Questi buoni (*Soluzione Futuro* e *Obiettivo 65*) hanno una logica particolare:
1.  **Fase di Accumulo**: Durano fino al compimento del 65° anno di età.
2.  **Fase di Rendita**: Dai 65 agli 80 anni erogano una rata mensile.
3.  **Protezione Inflazione**: La protezione dall'inflazione si attiva **solo** se porti il buono a scadenza (65 anni). Se rimborsi prima, ottieni solo il tasso fisso minimo garantito. Il simulatore tiene conto di questa clausola complessa calcolando automaticamente il maggiore tra il rendimento fisso e quello legato all'inflazione alla scadenza.
