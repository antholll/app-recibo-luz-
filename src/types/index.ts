export interface AppSettings {
  precioKwh: number;        // e.g. 0.7089
  alumbrado: number;        // e.g. 3.46
  cargoFijo: number;        // e.g. 1.86
  igvPorcentaje: number;    // e.g. 18
  costoAguaDefecto: number; // e.g. 10.00
  moneda: string;           // 'S/'
  redondearDecimales: boolean;
}

export interface ReceiptRecord {
  id: string;
  departmentId: string;
  mes: string;              // e.g. "Septiembre"
  anio: number;             // e.g. 2026
  fechaCreacion: string;    // ISO string
  lecturaAnterior: number;
  lecturaActual: number;
  consumoKwh: number;
  precioKwh: number;
  costoEnergia: number;
  alumbrado: number;
  cargoFijo: number;
  subtotal: number;
  igv: number;
  costoLuz: number;
  costoAgua: number;
  totalPagar: number;
}

export interface Department {
  id: string;
  nombre: string;
  ultimaLectura?: number;
}
