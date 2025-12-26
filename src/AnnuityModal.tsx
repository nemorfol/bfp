import { X, Calendar } from 'lucide-react';

interface AnnuityModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  data: any[];
}

export default function AnnuityModal({ isOpen, onClose, productName, data }: AnnuityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="text-blue-600"/> Piano Rendita: {productName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Dettaglio delle 180 rate mensili (65-80 anni)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500"/>
          </button>
        </div>

        {/* Totali */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border-b border-slate-100">
             <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                 <div className="text-xs text-blue-600 uppercase font-bold">Rata Base Media</div>
                 <div className="text-lg font-bold text-blue-900">
                    € {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(data[0]?.baseRate || 0)}
                 </div>
             </div>
             <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                 <div className="text-xs text-red-600 uppercase font-bold">Totale Bolli Stimati</div>
                 <div className="text-lg font-bold text-red-900">
                    € {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(data.reduce((acc, row) => acc + row.bollo, 0))}
                 </div>
             </div>
             <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                 <div className="text-xs text-green-600 uppercase font-bold">Totale Netto Incassato</div>
                 <div className="text-lg font-bold text-green-900">
                    € {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(data.reduce((acc, row) => acc + row.netRate, 0))}
                 </div>
             </div>
             <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="text-xs text-slate-600 uppercase font-bold">Durata</div>
                 <div className="text-lg font-bold text-slate-900">15 Anni</div>
             </div>
        </div>

        {/* Table Scrollable */}
        <div className="overflow-y-auto flex-1 p-0">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3">N°</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Capitale Residuo</th>
                <th className="px-6 py-3 text-right text-blue-700">Rata Base</th>
                <th className="px-6 py-3 text-right text-red-600" title="Imposta di Bollo (0.20% annuo)">Bollo*</th>
                <th className="px-6 py-3 text-right text-green-700 font-bold bg-green-50/50">Rata Netta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">#{row.id}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">{row.date}</td>
                  <td className="px-6 py-3 text-right font-mono">€ {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(row.capital)}</td>
                  <td className="px-6 py-3 text-right text-blue-700">€ {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(row.baseRate)}</td>
                  <td className="px-6 py-3 text-right text-red-600 text-xs">- € {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(row.bollo)}</td>
                  <td className="px-6 py-3 text-right font-bold text-green-700 bg-green-50/30">€ {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(row.netRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 rounded-b-xl flex justify-between">
            <span>* Il bollo è stimato allo 0.20% annuo sul capitale residuo, ripartito mensilmente.</span>
            <span>Valori indicativi al netto della tassazione 12.5% sugli interessi.</span>
        </div>
      </div>
    </div>
  );
}
