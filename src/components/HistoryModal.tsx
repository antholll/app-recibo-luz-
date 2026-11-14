import React from 'react';
import { ReceiptRecord } from '../types';
import { formatCurrency, generateWhatsAppMessage } from '../utils/calculator';
import { X, Trash2, Calendar, Share2, Eye, Receipt } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipts: ReceiptRecord[];
  onSelectReceipt: (receipt: ReceiptRecord) => void;
  onDeleteReceipt: (id: string) => void;
  moneda: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  receipts,
  onSelectReceipt,
  onDeleteReceipt,
  moneda
}) => {
  if (!isOpen) return null;

  const handleShareWhatsApp = (receipt: ReceiptRecord) => {
    const text = generateWhatsAppMessage(receipt, moneda);
    const encoded = encodeURI(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Historial de Recibos
              </h3>
              <p className="text-xs text-slate-500">
                {receipts.length} {receipts.length === 1 ? 'recibo guardado' : 'recibos guardados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Recibos */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {receipts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Calendar className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="text-base font-bold text-slate-600">No hay recibos guardados todavía</p>
              <p className="text-xs">
                Cuando calcules el mes, presiona el botón "Guardar Recibo" para tener el registro histórico.
              </p>
            </div>
          ) : (
            receipts.map((r) => (
              <div
                key={r.id}
                className="bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-900">
                      {r.mes} {r.anio}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                      {r.consumoKwh.toFixed(1)} kWh
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total a Pagar</span>
                    <span className="text-xl font-black font-mono text-emerald-700">
                      {formatCurrency(r.totalPagar, moneda)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/80">
                  <div>
                    <span>Lecturas: </span>
                    <span className="font-mono font-semibold text-slate-700">
                      {r.lecturaAnterior.toFixed(1)} ➔ {r.lecturaActual.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span>Agua: </span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatCurrency(r.costoAgua, moneda)}
                    </span>
                  </div>
                </div>

                {/* Botones de acción rápida */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      onSelectReceipt(r);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver Recibo</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(r)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                    title="Enviar resumen por WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que deseas eliminar el recibo de ${r.mes} ${r.anio}?`)) {
                        onDeleteReceipt(r.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar este recibo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
