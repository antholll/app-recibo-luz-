import React from 'react';
import { Zap, Settings, History } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenHistory,
  historyCount
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo y Nombre */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-5 h-5 fill-emerald-400 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-none">
              Recibo de Luz
            </h1>
          </div>
        </div>

        {/* Acciones del Encabezado */}
        <div className="flex items-center gap-2">
          {/* Historial */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Historial</span>
            {historyCount > 0 && (
              <span className="bg-slate-900 text-white rounded-full px-1.5 py-0.2 text-[11px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Tarifas */}
          <button
            onClick={onOpenSettings}
            className="p-2 md:px-3 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <Settings className="w-5 h-5 text-slate-600" />
            <span className="hidden sm:inline">Tarifas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
