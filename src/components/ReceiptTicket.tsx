import React, { forwardRef } from 'react';
import { ReceiptRecord } from '../types';

interface ReceiptTicketProps {
  receipt: ReceiptRecord;
  moneda?: string;
  isCapturing?: boolean;
}

export const ReceiptTicket = forwardRef<HTMLDivElement, ReceiptTicketProps>(({
  receipt,
  moneda = 'S/',
  isCapturing = false
}, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white transition-all text-slate-900 font-sans ${
        isCapturing ? 'w-[420px] p-7' : 'w-full max-w-md p-6'
      }`}
      style={{
        borderRadius: 0,
        // Usamos inset box-shadow para que el borde exterior sea 100% simétrico e idéntico en todos los lados (sin recortes en el lado izquierdo)
        boxShadow: 'inset 0 0 0 2.5px #0f172a'
      }}
    >
      {/* Título: Mes formal subrayado idéntico a la libreta */}
      <div className="text-center pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 inline-block border-b-2 border-slate-900 pb-1 px-4">
          Mes de {receipt.mes}
        </h2>
      </div>

      {/* 1. Lecturas */}
      <div className="space-y-1.5 text-base">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Lectura anterior:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.lecturaAnterior.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Lectura actual:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.lecturaActual.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-slate-900 my-3"></div>

      {/* 2. Consumo y Tarifa */}
      <div className="space-y-1.5 text-base">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Consumo:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.consumoKwh.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Precio Kw/h:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.precioKwh.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-slate-900 my-3"></div>

      {/* 3. Desglose de Luz */}
      <div className="space-y-1.5 text-base">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Energía:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.costoEnergia.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Alumbrado:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.alumbrado.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Cargo Fijo:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.cargoFijo.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-slate-900 my-3"></div>

      {/* 4. Subtotal e IGV */}
      <div className="space-y-1.5 text-base">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Subtotal:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">IGV (18%):</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.igv.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-slate-900 my-3"></div>

      {/* 5. Costo Luz y opcionalmente Costo Agua */}
      <div className="space-y-1.5 text-base">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-800 font-medium">Costo de Luz:</span>
          <span className="font-mono font-bold text-lg tracking-wider">
            {receipt.costoLuz.toFixed(2)}
          </span>
        </div>
        {receipt.incluirAgua && (
          <div className="flex justify-between items-baseline">
            <span className="text-slate-800 font-medium">Costo de Agua:</span>
            <span className="font-mono font-bold text-lg tracking-wider">
              {receipt.costoAgua.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* 6. Recuadro Formal: Total a Pagar */}
      <div className="mt-4 pt-2">
        <div className="border-2 border-slate-900 p-3.5 flex justify-between items-center bg-slate-50/50">
          <div>
            <span className="text-base font-bold text-slate-900 block leading-tight">
              Total a Pagar
            </span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
            <span>{moneda} </span>
            <span>{receipt.totalPagar.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ReceiptTicket.displayName = 'ReceiptTicket';
