export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxId: string; // Steuernummer
  vatId: string; // USt-IdNr.
  bankName: string;
  accountHolder: string;
  iban: string;
  bic: string;
}

export interface TaskVariant {
  id: string;
  label: string;
  price: number;
}

export interface SavedTask {
  id: string;
  title: string; // Short name for the button
  description: string;
  price: number;
  variants?: TaskVariant[]; // Optional variants (e.g., M, L, XL)
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled';

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  sender: CompanyProfile;
  client: Client;
  items: InvoiceItem[];
  taxRate: number; // Percentage
  currency: string;
  notes: string;
  status: InvoiceStatus;
}

export interface AIRsponseItem {
  description: string;
  quantity: number;
  price: number;
}