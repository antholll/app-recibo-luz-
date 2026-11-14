import React, { useRef } from 'react';
import { MESES } from '../utils/calculator';
import { Gauge, Droplets, Calendar, AlertCircle, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalculatorFormProps {
  mes: string;
  setMes: (m: string) => void;
  anio: number;
  setAnio: (a: number) => void;
  lecturaAnterior: string;
  setLecturaAnterior: (v: string) => void;
  lecturaActual: string;
  setLecturaActual: (v: string) => void;
  precioKwh: string;
  setPrecioKwh: (v: string) => void;
  costoAgua: string;
  setCostoAgua: (v: string) => void;
  consumoCalculado: number;
  moneda: string;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  mes,
  setMes,
  anio,
  setAnio,
  lecturaAnterior,
  setLecturaAnterior,
  lecturaActual,
  setLecturaActual,
  precioKwh,
  setPrecioKwh,
  costoAgua,
  setCostoAgua,
  consumoCalculado,
  moneda
}) => {
  const numAnterior = parseFloat(lecturaAnterior) || 0;
  const numActual = parseFloat(lecturaActual) || 0;
  const esLecturaInvalida = numActual > 0 && numActual < numAnterior;

  // Manejo del Carrusel de 3 meses
  const currentIndex = MESES.indexOf(mes) !== -1 ? MESES.indexOf(mes) : 0;
  const prevIndex = (currentIndex - 1 + 12) % 12;
  const nextIndex = (currentIndex + 1) % 12;

  const mesAnterior = MESES[prevIndex];
  const mesActual = MESES[currentIndex];
  const mesSiguiente = MESES[nextIndex];

  const handlePrevMonth = () => {
    if (currentIndex === 0) {
      setAnio(anio - 1);
    }
    setMes(mesAnterior);
  };

  const handleNextMonth = () => {
    if (currentIndex === 11) {
      setAnio(anio + 1);
    }
    setMes(mesSiguiente);
  };

  // Soporte táctil para deslizar
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 45) {
      handleNextMonth();
    } else if (diff < -45) {
      handlePrevMonth();
    }
    touchStartX.current = null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 md:p-6 space-y-5">
      {/* Título de la sección con Año más grande */}
      <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">
          Datos del Mes
        </h2>
        <span className="text-sm md:text-base font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl border border-slate-300 shadow-2xs">
          Año {anio}
        </span>
      </div>

      {/* SELECTOR DE 3 MESES */}
      <div className="space-y-1.5">
        <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-600">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-700" />
          <span>Mes a Facturar</span>
        </div>

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex items-center gap-2 select-none"
        >
          {/* Mes Anterior (Izquierda) */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 border border-slate-200"
            title={`Cambiar a ${mesAnterior}`}
          >
            <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{mesAnterior}</span>
          </button>

          {/* Mes Actual (Centro, Grande y Destacado) */}
          <div className="flex-[1.5] py-2.5 px-3 rounded-xl bg-slate-900 text-white font-black text-sm md:text-base text-center shadow-md tracking-wide flex items-center justify-center gap-1.5">
            <span className="truncate">{mesActual}</span>
            <span className="text-xs font-semibold text-slate-400">{anio}</span>
          </div>

          {/* Mes Siguiente (Derecha) */}
          <button
            type="button"
            onClick={handleNextMonth}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 border border-slate-200"
            title={`Cambiar a ${mesSiguiente}`}
          >
            <span className="truncate">{mesSiguiente}</span>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* CAMPO DESTACADO: LECTURA ACTUAL EN GRANDE */}
      <div className="bg-emerald-50/50 border-2 border-emerald-500 rounded-2xl p-4 md:p-5 space-y-1.5 shadow-2xs">
        <label className="text-base md:text-lg font-black text-emerald-950 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-emerald-600" />
          <span>LECTURA ACTUAL DEL MEDIDOR</span>
        </label>

        <div className="relative">
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={lecturaActual}
            onChange={(e) => setLecturaActual(e.target.value)}
            placeholder="0.00"
            className={`w-full text-3xl md:text-4xl font-black font-mono py-3 pl-4 pr-16 rounded-xl border-2 ${
              esLecturaInvalida
                ? 'border-red-500 bg-red-50 text-red-900'
                : 'border-emerald-500 bg-white text-slate-900 focus:ring-4 focus:ring-emerald-200'
            } focus:outline-hidden transition-all`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-700 pointer-events-none select-none">
            kWh
          </span>
        </div>

        {esLecturaInvalida && (
          <span className="text-xs text-red-600 font-bold flex items-center gap-1 pl-1">
            <AlertCircle className="w-3.5 h-3.5" />
            La lectura actual no puede ser menor a la anterior ({numAnterior.toFixed(2)})
          </span>
        )}
      </div>

      {/* LOS CAMPOS CADA UNO EN SU PROPIO BLOQUE (1 POR BLOQUE, NUNCA APILADOS EN 3 JUNTOS) */}
      <div className="space-y-4">
        {/* Bloque 1: Lectura Anterior */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Lectura Anterior
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              inputMode="decimal"
              value={lecturaAnterior}
              onChange={(e) => setLecturaAnterior(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl font-bold font-mono py-3 pl-4 pr-16 rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-800 focus:bg-white focus:border-slate-800 focus:outline-hidden transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 pointer-events-none select-none">
              kWh
            </span>
          </div>
        </div>

        {/* Bloque 2: Precio Kw/h */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Precio Kw/h</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none select-none">
              {moneda}
            </span>
            <input
              type="number"
              step="0.0001"
              inputMode="decimal"
              value={precioKwh}
              onChange={(e) => setPrecioKwh(e.target.value)}
              placeholder="0.7089"
              className="w-full text-2xl font-bold font-mono py-3 pl-12 pr-4 rounded-xl border-2 border-amber-300 bg-amber-50/20 text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Bloque 3: Costo de Agua */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-600 fill-sky-500" />
            <span>Costo de Agua</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none select-none">
              {moneda}
            </span>
            <input
              type="number"
              step="0.5"
              inputMode="decimal"
              value={costoAgua}
              onChange={(e) => setCostoAgua(e.target.value)}
              placeholder="10.00"
              className="w-full text-2xl font-bold font-mono py-3 pl-12 pr-4 rounded-xl border-2 border-sky-300 bg-sky-50/20 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-hidden transition-all"
            />
          </div>
        </div>
      </div>

      {/* Resumen del Consumo Resultante */}
      <div className="bg-slate-100 rounded-xl p-3.5 flex items-center justify-between border border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Consumo Calculado:
        </span>
        <div className="text-right">
          <span className="text-xl font-black font-mono text-slate-900">
            {consumoCalculado.toFixed(2)}
          </span>
          <span className="text-xs font-bold text-slate-600 ml-1">kWh</span>
        </div>
      </div>
    </div>
  );
};
