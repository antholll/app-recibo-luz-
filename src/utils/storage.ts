import { AppSettings, Department, ReceiptRecord } from '../types';
import { DEFAULT_SETTINGS } from './calculator';

const SETTINGS_KEY = 'appluz_settings_v1';
const RECEIPTS_KEY = 'appluz_receipts_v1';
const DEPARTMENTS_KEY = 'appluz_departments_v1';
const ACTIVE_DEPT_KEY = 'appluz_active_dept_v1';

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function getStoredDepartments(): Department[] {
  try {
    const raw = localStorage.getItem(DEPARTMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading departments', e);
  }
  // Default single department
  return [{ id: 'dept-principal', nombre: 'Departamento 1', ultimaLectura: 5071.90 }];
}

export function saveStoredDepartments(departments: Department[]): void {
  try {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
  } catch (e) {
    console.error('Error saving departments', e);
  }
}

export function getActiveDepartmentId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_DEPT_KEY);
    if (id) return id;
  } catch (e) {
    console.error('Error reading active department', e);
  }
  return 'dept-principal';
}

export function saveActiveDepartmentId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_DEPT_KEY, id);
  } catch (e) {
    console.error('Error saving active department', e);
  }
}

export function getStoredReceipts(): ReceiptRecord[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading receipts', e);
  }
  return [];
}

export function saveStoredReceipts(receipts: ReceiptRecord[]): void {
  try {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  } catch (e) {
    console.error('Error saving receipts', e);
  }
}

export function saveSingleReceipt(receipt: ReceiptRecord): ReceiptRecord[] {
  const receipts = getStoredReceipts();
  // If a receipt for same month and year and department exists, ask or replace, or simply prepend
  const updated = [receipt, ...receipts.filter(r => r.id !== receipt.id)];
  saveStoredReceipts(updated);

  // Also update the department's latest reading
  const departments = getStoredDepartments();
  const depIndex = departments.findIndex(d => d.id === receipt.departmentId);
  if (depIndex !== -1) {
    departments[depIndex].ultimaLectura = receipt.lecturaActual;
    saveStoredDepartments(departments);
  }

  return updated;
}

export function deleteStoredReceipt(id: string): ReceiptRecord[] {
  const receipts = getStoredReceipts().filter(r => r.id !== id);
  saveStoredReceipts(receipts);
  return receipts;
}

export function exportBackupJSON(): string {
  const data = {
    settings: getStoredSettings(),
    departments: getStoredDepartments(),
    receipts: getStoredReceipts(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.settings) saveStoredSettings(data.settings);
    if (data.departments) saveStoredDepartments(data.departments);
    if (data.receipts) saveStoredReceipts(data.receipts);
    return true;
  } catch (e) {
    console.error('Error importing backup', e);
    return false;
  }
}
