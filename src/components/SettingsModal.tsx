import React, { useState } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../utils/calculator';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { X, Save, RotateCcw, Download, Upload, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onDataImported?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataImported
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer los valores de tarifas por defecto?')) {
      setFormData(DEFAULT_SETTINGS);
      onSaveSettings(DEFAULT_SETTINGS);
    }
  };

  const handleExport = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copia_recibos_luz_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importBackupJSON(content);
      if (ok) {
        setImportStatus('¡Datos restaurados con éxito!');
        if (onDataImported) onDataImported();
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } else {
        setImportStatus('Error: Archivo inválido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Cabecera */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Configuración de Tarifas
            </h3>
            <p className="text-xs text-slate-500">
              Valores base usados para el cálculo automático
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Precio por kWh */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 block">
              Precio por kWh (Soles)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                S/
              </span>
              <input
                type="number"
                step="0.0001"
                value={formData.precioKwh}
                onChange={(e) => setFormData({ ...formData, precioKwh: parseFloat(e.target.value) || 0 })}
                className="w-full text-lg font-bold font-mono py-2.5 pl-10 pr-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
            <span className="text-xs text-slate-400">Valor actual de tu recibo: 0.7089</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Alumbrado Público */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                Alumbrado Público
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  S/
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.alumbrado}
                  onChange={(e) => setFormData({ ...formData, alumbrado: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base font-bold font-mono py-2.5 pl-8 pr-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <span className="text-xs text-slate-400">Normalmente: 3.46</span>
            </div>

            {/* Cargo Fijo */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                Cargo Fijo Mensual
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  S/
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cargoFijo}
                  onChange={(e) => setFormData({ ...formData, cargoFijo: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base font-bold font-mono py-2.5 pl-8 pr-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <span className="text-xs text-slate-400">Normalmente: 1.86</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Porcentaje IGV */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                I.G.V. (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={formData.igvPorcentaje}
                  onChange={(e) => setFormData({ ...formData, igvPorcentaje: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base font-bold font-mono py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
              <span className="text-xs text-slate-400">Por ley en Perú: 18%</span>
            </div>

            {/* Agua por defecto */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                Agua por Defecto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  S/
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={formData.costoAguaDefecto}
                  onChange={(e) => setFormData({ ...formData, costoAguaDefecto: parseFloat(e.target.value) || 0 })}
                  className="w-full text-base font-bold font-mono py-2.5 pl-8 pr-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
              <span className="text-xs text-slate-400">Por defecto: 10.00</span>
            </div>
          </div>

          {/* Sección de Respaldo y Copia de Seguridad */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Copia de Seguridad (Tus datos)</span>
            </div>
            <p className="text-xs text-slate-500">
              Tus recibos se guardan en este dispositivo. Puedes descargar una copia para pasar tus datos a otro celular o tener un respaldo.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {copiedBackup ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
                <span>{copiedBackup ? '¡Descargado!' : 'Hacer Copia'}</span>
              </button>

              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Restaurar Copia</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && (
              <p className="text-xs font-bold text-center text-emerald-700 bg-emerald-50 py-1.5 rounded-lg">
                {importStatus}
              </p>
            )}
          </div>

          {/* Botones de acción inferior */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 p-2 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Tarifas</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
