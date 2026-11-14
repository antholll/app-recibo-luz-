import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Header } from './components/Header';
import { CalculatorForm } from './components/CalculatorForm';
import { ReceiptTicket } from './components/ReceiptTicket';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { AppSettings, ReceiptRecord } from './types';
import {
  calculateReceipt,
  DEFAULT_SETTINGS,
  generateWhatsAppMessage,
  MESES,
  round2
} from './utils/calculator';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredReceipts,
  saveSingleReceipt,
  deleteStoredReceipt,
  getStoredDepartments
} from './utils/storage';
import {
  Share2,
  Download,
  BookmarkCheck,
  Check,
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  // Settings & Storage State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);

  // Current Form State
  const today = new Date();
  const [mes, setMes] = useState<string>(MESES[today.getMonth()]);
  const [anio, setAnio] = useState<number>(today.getFullYear());
  const [lecturaAnterior, setLecturaAnterior] = useState<string>('5071.90');
  const [lecturaActual, setLecturaActual] = useState<string>('5189.60');
  const [precioKwh, setPrecioKwh] = useState<string>('0.7089');
  const [costoAgua, setCostoAgua] = useState<string>('10.00');
  const [incluirAgua, setIncluirAgua] = useState<boolean>(true);

  // UI Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Action status indicators
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Receipt DOM element ref for image capture
  const receiptTicketRef = useRef<HTMLDivElement>(null);

  // Initial Load from LocalStorage
  useEffect(() => {
    const savedSettings = getStoredSettings();
    setSettings(savedSettings);
    setPrecioKwh(savedSettings.precioKwh.toString());
    setCostoAgua(savedSettings.costoAguaDefecto.toString());

    const savedReceipts = getStoredReceipts();
    setReceipts(savedReceipts);

    const departments = getStoredDepartments();
    if (departments.length > 0 && departments[0].ultimaLectura) {
      setLecturaAnterior(departments[0].ultimaLectura.toString());
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time calculation with optional water and rounded final total
  const numAnterior = parseFloat(lecturaAnterior) || 0;
  const numActual = parseFloat(lecturaActual) || 0;
  const numPrecioKwh = parseFloat(precioKwh) || settings.precioKwh;
  const numAgua = parseFloat(costoAgua) || 0;
  const consumoCalculado = Math.max(0, round2(numActual - numAnterior));

  const currentReceipt: ReceiptRecord = calculateReceipt({
    lecturaAnterior: numAnterior,
    lecturaActual: numActual,
    precioKwh: numPrecioKwh,
    costoAgua: numAgua,
    incluirAgua,
    settings,
    mes,
    anio
  });

  // Check if current month is already saved in history
  const isAlreadySaved = receipts.some(r => r.mes === mes && r.anio === anio);

  // Save current receipt to LocalStorage
  const handleSaveReceipt = () => {
    if (numActual <= 0) {
      alert('Por favor ingresa la lectura actual del medidor.');
      return;
    }
    const updated = saveSingleReceipt(currentReceipt);
    setReceipts(updated);

    const newSettings = {
      ...settings,
      precioKwh: numPrecioKwh,
      costoAguaDefecto: numAgua
    };
    setSettings(newSettings);
    saveStoredSettings(newSettings);

    showToast(`¡Recibo de ${mes} ${anio} guardado en el historial!`);
  };

  // Generate Image
  const generateReceiptImage = async (): Promise<string | null> => {
    if (!receiptTicketRef.current) return null;
    setIsGeneratingImage(true);
    try {
      const dataUrl = await toPng(receiptTicketRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      return dataUrl;
    } catch (error) {
      console.error('Error generating image', error);
      alert('Hubo un inconveniente al generar la imagen del recibo.');
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Download Receipt as PNG
  const handleDownloadImage = async () => {
    const dataUrl = await generateReceiptImage();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `Recibo_${mes}_${anio}.png`;
    link.href = dataUrl;
    link.click();
    showToast('¡Imagen descargada!');
  };

  // Share via WhatsApp
  const handleShareWhatsApp = async () => {
    const textMsg = generateWhatsAppMessage(currentReceipt, settings.moneda);

    const dataUrl = await generateReceiptImage();
    if (dataUrl && navigator.share && navigator.canShare) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `Recibo_${mes}_${anio}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Recibo - ${mes} ${anio}`,
            text: textMsg,
            files: [file]
          });
          showToast('¡Recibo compartido!');
          return;
        }
      } catch (err) {
        console.log('Fallback to text WhatsApp sharing', err);
      }
    }

    try {
      await navigator.clipboard.writeText(textMsg);
      showToast('Texto copiado. Abriendo WhatsApp...');
    } catch (e) {
      console.log('Clipboard error', e);
    }

    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `Recibo_${mes}_${anio}.png`;
      link.href = dataUrl;
      link.click();
    }

    const encoded = encodeURI(textMsg);
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }, 350);
  };

  // Prepare for next month
  const handlePrepareNextMonth = () => {
    if (numActual > 0) {
      setLecturaAnterior(numActual.toString());
      setLecturaActual('');
      const currentIndex = MESES.indexOf(mes);
      const nextIndex = (currentIndex + 1) % 12;
      setMes(MESES[nextIndex]);
      if (nextIndex === 0) setAnio(anio + 1);
      showToast(`¡Lectura trasladada al mes de ${MESES[nextIndex]}!`);
    } else {
      alert('Ingresa primero la lectura actual para poder trasladarla al siguiente mes.');
    }
  };

  // Load past receipt from history
  const handleSelectFromHistory = (r: ReceiptRecord) => {
    setMes(r.mes);
    setAnio(r.anio);
    setLecturaAnterior(r.lecturaAnterior.toString());
    setLecturaActual(r.lecturaActual.toString());
    setPrecioKwh(r.precioKwh.toString());
    setCostoAgua(r.costoAgua.toString());
    setIncluirAgua(r.incluirAgua !== undefined ? r.incluirAgua : true);
    showToast(`Recibo cargado: ${r.mes} ${r.anio}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Barra Superior */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={receipts.length}
      />

      {/* Contenedor Principal Adaptable */}
      <main className="flex-1 flex justify-center p-3 md:p-6">
        <div className="w-full max-w-5xl">
          {/* Barra superior de Gestión Mensual */}
          <div className="mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-300 shadow-2xs">
            <span className="text-xs md:text-sm font-extrabold text-slate-800">
              Gestión Mensual
            </span>
            <button
              onClick={handlePrepareNextMonth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-2xs"
              title="Traslada la lectura actual a la anterior y avanza al siguiente mes"
            >
              <span>Pasar al Siguiente Mes</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Área de Trabajo: Formulario + Boleta Formal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna Izquierda: Formulario de Entrada */}
            <div className="lg:col-span-7">
              <CalculatorForm
                mes={mes}
                setMes={setMes}
                anio={anio}
                setAnio={setAnio}
                lecturaAnterior={lecturaAnterior}
                setLecturaAnterior={setLecturaAnterior}
                lecturaActual={lecturaActual}
                setLecturaActual={setLecturaActual}
                precioKwh={precioKwh}
                setPrecioKwh={setPrecioKwh}
                costoAgua={costoAgua}
                setCostoAgua={setCostoAgua}
                incluirAgua={incluirAgua}
                setIncluirAgua={setIncluirAgua}
                consumoCalculado={consumoCalculado}
                moneda={settings.moneda}
              />
            </div>

            {/* Columna Derecha: Boleta Formal y Botones */}
            <div className="lg:col-span-5 space-y-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-700">
                  FORMATO FINAL DEL RECIBO
                </span>
              </div>

              {/* Boleta Formal */}
              <div className="w-full flex justify-center">
                <ReceiptTicket
                  ref={receiptTicketRef}
                  receipt={currentReceipt}
                  moneda={settings.moneda}
                />
              </div>

              {/* Botones de Acción */}
              <div className="w-full max-w-md space-y-2.5 pt-1">
                {/* 1. Botón Guardar en Historial */}
                <button
                  type="button"
                  onClick={handleSaveReceipt}
                  className={`w-full py-3.5 px-5 rounded-xl font-black text-base shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] ${
                    isAlreadySaved
                      ? 'bg-emerald-700 text-white border-2 border-emerald-500 shadow-emerald-700/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                  }`}
                >
                  <BookmarkCheck className="w-6 h-6 text-white" />
                  <span>
                    {isAlreadySaved
                      ? `✓ Mes de ${mes} Guardado (Actualizar)`
                      : `Guardar Mes de ${mes} en Historial`}
                  </span>
                </button>

                {/* 2. Botón Compartir en WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  disabled={isGeneratingImage}
                  className="w-full py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-base shadow-md flex items-center justify-center gap-2.5 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  <Share2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    {isGeneratingImage ? 'Generando...' : 'Compartir en WhatsApp'}
                  </span>
                </button>

                {/* 3. Botón Descargar Imagen */}
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isGeneratingImage}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Descargar Imagen del Recibo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modales */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          setPrecioKwh(newSettings.precioKwh.toString());
          saveStoredSettings(newSettings);
          showToast('Tarifas guardadas');
        }}
        onDataImported={() => {
          const s = getStoredSettings();
          setSettings(s);
          setPrecioKwh(s.precioKwh.toString());
          setReceipts(getStoredReceipts());
          showToast('Datos importados');
        }}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        receipts={receipts}
        onSelectReceipt={handleSelectFromHistory}
        onDeleteReceipt={(id) => {
          const updated = deleteStoredReceipt(id);
          setReceipts(updated);
          showToast('Recibo eliminado');
        }}
        moneda={settings.moneda}
      />
    </div>
  );
};

export default App;
