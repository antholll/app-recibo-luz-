import { AppSettings, ReceiptRecord } from '../types';

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DEFAULT_SETTINGS: AppSettings = {
  precioKwh: 0.7089,
  alumbrado: 3.46,
  cargoFijo: 1.86,
  igvPorcentaje: 18,
  costoAguaDefecto: 10.00,
  moneda: 'S/',
  redondearDecimales: true
};

export interface CalculationInput {
  lecturaAnterior: number;
  lecturaActual: number;
  precioKwh: number;
  costoAgua: number;
  incluirAgua: boolean;
  settings: AppSettings;
  mes: string;
  anio: number;
  departmentId?: string;
}

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function round1Decimal(num: number): number {
  return Math.round((num + Number.EPSILON) * 10) / 10;
}

export function formatCurrency(amount: number, symbol: string = 'S/'): string {
  return `${symbol} ${amount.toFixed(2)}`;
}

export function calculateReceipt(input: CalculationInput): ReceiptRecord {
  const {
    lecturaAnterior,
    lecturaActual,
    precioKwh,
    costoAgua,
    incluirAgua = true,
    settings,
    mes,
    anio,
    departmentId = 'default'
  } = input;

  // 1. Consumo = Lectura Actual - Lectura Anterior
  const consumoKwh = Math.max(0, round2(lecturaActual - lecturaAnterior));

  // 2. Costo Energía = Consumo * Precio Kw/h
  const tarifaAplicada = precioKwh > 0 ? precioKwh : settings.precioKwh;
  const costoEnergia = round2(consumoKwh * tarifaAplicada);

  // 3. Subtotal = Energía + Alumbrado + Cargo Fijo
  const subtotal = round2(costoEnergia + settings.alumbrado + settings.cargoFijo);

  // 4. IGV (18%) = Subtotal * (IGV / 100)
  const igv = round2(subtotal * (settings.igvPorcentaje / 100));

  // 5. Costo de Luz = Subtotal + IGV (Exacto a centésimas: 104.74)
  const costoLuz = round2(subtotal + igv);

  // 6. Agua aplicada o no
  const montoAguaAplicado = incluirAgua ? costoAgua : 0;

  // 7. Total a Pagar = (Costo de Luz + Agua) REDONDEADO a 10 céntimos
  const totalSinRedondear = costoLuz + montoAguaAplicado;
  const totalPagar = round1Decimal(totalSinRedondear);

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    departmentId,
    mes,
    anio,
    fechaCreacion: new Date().toISOString(),
    lecturaAnterior,
    lecturaActual,
    consumoKwh,
    precioKwh: tarifaAplicada,
    costoEnergia,
    alumbrado: settings.alumbrado,
    cargoFijo: settings.cargoFijo,
    subtotal,
    igv,
    costoLuz,
    costoAgua: montoAguaAplicado,
    incluirAgua,
    totalPagar
  };
}

export function generateWhatsAppMessage(receipt: ReceiptRecord, moneda: string = 'S/'): string {
  const lineaAgua = receipt.incluirAgua
    ? `\nCosto de Agua: ${receipt.costoAgua.toFixed(2)}`
    : '';

  return `*Mes de ${receipt.mes}*
──────────────────────────
Lectura anterior: ${receipt.lecturaAnterior.toFixed(2)}
Lectura actual: ${receipt.lecturaActual.toFixed(2)}
──────────────────────────
Consumo: ${receipt.consumoKwh.toFixed(2)}
Precio Kw/h: ${receipt.precioKwh.toFixed(4)}
──────────────────────────
Energía: ${receipt.costoEnergia.toFixed(2)}
Alumbrado: ${receipt.alumbrado.toFixed(2)}
Cargo Fijo: ${receipt.cargoFijo.toFixed(2)}
──────────────────────────
Subtotal: ${receipt.subtotal.toFixed(2)}
IGV (18%): ${receipt.igv.toFixed(2)}
──────────────────────────
Costo de Luz: ${receipt.costoLuz.toFixed(2)}${lineaAgua}
══════════════════════════
*Total a Pagar: ${moneda} ${receipt.totalPagar.toFixed(2)}*
══════════════════════════`;
}
