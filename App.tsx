import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Printer, Sparkles, Receipt, Command, 
  Users, Settings, History, Save, X, Eye, Share2, 
  Briefcase, CheckCircle, FileText, Download, ArrowLeft, Layers, Edit3, RefreshCw,
  ChevronDown
} from 'lucide-react';
import { GlassCard, GlassInput, GlassButton } from './components/GlassCard';
import { InvoiceData, InvoiceItem, Client, CompanyProfile, SavedTask, InvoiceStatus, TaskVariant } from './types';
import { geminiService } from './services/geminiService';

// --- Translations ---
const TRANSLATIONS = {
  de: {
    appTitle: 'Zujaj Rechnung',
    create: 'Rechnung erstellen',
    clients: 'Kundenverwaltung',
    tasks: 'Dienstleistungen',
    history: 'Archiv',
    settings: 'Einstellungen',
    preview: 'Vorschau PDF',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    invoiceNumber: 'Rechnungsnummer',
    date: 'Rechnungsdatum',
    dueDate: 'Fälligkeitsdatum',
    items: 'Beschreibung der Leistungen',
    description: 'Beschreibung',
    qty: 'Menge',
    price: 'Einzelpreis',
    total: 'Gesamtpreis',
    subtotal: 'Netto',
    tax: 'Umsatzsteuer',
    aiPlaceholder: 'z.B. "Fensterreinigung 3 Std à 45€"...',
    quickAdd: 'Schnellauswahl (Aufgaben)',
    addClient: 'Neuer Kunde',
    addTask: 'Neue Leistung',
    companyDetails: 'Unternehmensdaten',
    bankDetails: 'Bankverbindung',
    status: 'Status',
    notes: 'Hinweise / Fußzeile',
    notesPlaceholder: 'Vielen Dank für Ihren Auftrag. Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.',
    print: 'Drucken / PDF speichern',
    selectClient: 'Kunde auswählen',
    saveInvoice: 'Rechnung archivieren',
    generated: 'Erstellt am',
    newInvoice: 'Neue Rechnung',
    taxId: 'Steuernummer',
    iban: 'IBAN',
    bic: 'BIC',
    accHolder: 'Kontoinhaber',
    installApp: 'App installieren',
    smartTask: 'Smart-Aufgabe',
    variantLabel: 'Variante (z.B. Größe, Farbe)',
    addVariant: 'Variante hinzufügen',
    selectVariant: 'Bitte wählen',
    back: 'Zurück',
    confirmDelete: 'Möchten Sie diesen Eintrag wirklich löschen?',
    saved: 'Erfolgreich gespeichert!',
    editClient: 'Kunde bearbeiten',
    editTask: 'Leistung bearbeiten',
    loadStandard: 'Standard-Liste laden',
    standardLoaded: 'Standard-Aufgaben wurden geladen.',
    resetTasks: 'Aufgaben zurücksetzen'
  },
  ar: {
    appTitle: 'فاتورة زجاج',
    create: 'إنشاء',
    clients: 'العملاء',
    tasks: 'المهام',
    history: 'الأرشيف',
    settings: 'الإعدادات',
    preview: 'معاينة PDF',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    invoiceNumber: 'رقم الفاتورة',
    date: 'التاريخ',
    dueDate: 'تاريخ الاستحقاق',
    items: 'المنتجات',
    description: 'الوصف',
    qty: 'الكمية',
    price: 'السعر',
    total: 'الإجمالي',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    aiPlaceholder: 'مثال: تصميم شعار 500 ريال...',
    quickAdd: 'المهام السريعة',
    addClient: 'إضافة عميل',
    addTask: 'إضافة مهمة',
    companyDetails: 'بيانات الشركة',
    bankDetails: 'بيانات البنك',
    status: 'الحالة',
    notes: 'ملاحظات',
    notesPlaceholder: 'شكراً لتعاملكم معنا.',
    print: 'طباعة / PDF',
    selectClient: 'اختر عميل',
    saveInvoice: 'حفظ الفاتورة',
    generated: 'تم الإنشاء في',
    newInvoice: 'فاتورة جديدة',
    taxId: 'الرقم الضريبي',
    iban: 'IBAN',
    bic: 'BIC',
    accHolder: 'اسم المستفيد',
    installApp: 'تثبيت التطبيق',
    smartTask: 'مهمة ذكية',
    variantLabel: 'نوع (مثال: كبير، وسط، XL)',
    addVariant: 'إضافة خيار',
    selectVariant: 'اختر النوع',
    back: 'رجوع',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    saved: 'تم الحفظ!',
    editClient: 'تعديل العميل',
    editTask: 'تعديل المهمة',
    loadStandard: 'تحميل القائمة الأساسية',
    standardLoaded: 'تم تحميل المهام الأساسية',
    resetTasks: 'إعادة تعيين المهام'
  }
};

// --- Helpers ---
const formatDateGerman = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// --- Smart Tasks Generator (Pricing Engine) ---
const generateStandardTasks = (): SavedTask[] => {
  const m = 1.09; // Multiplier
  const round = (val: number) => Math.round(val * m * 100) / 100;

  const tasks: SavedTask[] = [
    {
      id: 'task-bett', title: 'Bett', description: 'Schlafzimmermöbel', price: 0,
      variants: [
        { id: 'b-m', label: 'M (Medium)', price: round(50) },
        { id: 'b-l', label: 'L (Large)', price: round(70) },
        { id: 'b-xl', label: 'XL (Extra Large)', price: round(90) },
        { id: 'b-xxl', label: 'XXL (Huge)', price: round(120) },
        { id: 'b-mont', label: 'Montage', price: round(25) },
        { id: 'b-demont', label: 'Demontage', price: round(20) },
      ]
    },
    {
      id: 'task-sofa', title: 'Sofa', description: 'Wohnzimmermöbel', price: 0,
      variants: [
        { id: 's-m', label: 'M', price: round(40) },
        { id: 's-l', label: 'L', price: round(60) },
        { id: 's-xl', label: 'XL', price: round(80) },
        { id: 's-xxl', label: 'XXL', price: round(110) },
      ]
    },
    {
      id: 'task-kueche', title: 'Küchenschrank', description: 'Küchenmöbel', price: 0,
      variants: [
        { id: 'k-m', label: 'M', price: round(50) },
        { id: 'k-l', label: 'L', price: round(70) },
        { id: 'k-xl', label: 'XL', price: round(90) },
        { id: 'k-xxl', label: 'XXL', price: round(120) },
        { id: 'k-mont', label: 'Montage', price: round(30) },
        { id: 'k-demont', label: 'Demontage', price: round(25) },
      ]
    },
    {
      id: 'task-wasch', title: 'Waschmaschine', description: 'Haushaltsgeräte', price: 0,
      variants: [
        { id: 'w-m', label: 'M', price: round(50) },
        { id: 'w-l', label: 'L', price: round(70) },
        { id: 'w-xl', label: 'XL', price: round(90) },
        { id: 'w-xxl', label: 'XXL', price: round(120) },
        { id: 'w-mont', label: 'Anschluss', price: round(15) },
        { id: 'w-demont', label: 'Abschluss', price: round(10) },
      ]
    },
    {
      id: 'task-kartons', title: 'Kartons', description: 'Umzugskartons', price: 0,
      variants: [
        { id: 'kar-m', label: 'M', price: round(3) },
        { id: 'kar-l', label: 'L', price: round(4) },
        { id: 'kar-xl', label: 'XL', price: round(5) },
        { id: 'kar-xxl', label: 'XXL', price: round(6) },
      ]
    },
    {
      id: 'task-heavy', title: 'Heavy Item', description: 'Schwerlast (Klavier, Safe)', price: 0,
      variants: [
        { id: 'h-m', label: 'M', price: round(200) },
        { id: 'h-l', label: 'L', price: round(250) },
        { id: 'h-xl', label: 'XL', price: round(300) },
        { id: 'h-xxl', label: 'XXL', price: round(400) },
        { id: 'h-mont', label: 'Montage', price: round(50) },
        { id: 'h-demont', label: 'Demontage', price: round(50) },
      ]
    },
    {
      id: 'task-fahrt', title: 'Fahrdienst', description: 'Transport pro KM', price: 0,
      variants: [
        { id: 'f-m', label: 'Pro KM', price: round(1.0) },
      ]
    },
    {
      id: 'task-etage', title: 'Etagenaufschlag', description: 'Zuschlag pro Etage', price: 0,
      variants: [
        { id: 'e-m', label: 'Pro Etage', price: round(5) },
      ]
    },
    {
      id: 'task-arbeit', title: 'Arbeitsstunde', description: 'Personal pro Stunde', price: 0,
      variants: [
        { id: 'a-std', label: 'Pro Stunde', price: round(20) },
      ]
    },
    {
      id: 'task-lampe', title: 'Lampe', description: 'Deckenleuchten etc.', price: 0,
      variants: [
        { id: 'l-m', label: 'M', price: round(5) },
        { id: 'l-l', label: 'L', price: round(5) },
        { id: 'l-xl', label: 'XL', price: round(5) },
        { id: 'l-xxl', label: 'XXL', price: round(5) },
        { id: 'l-mont', label: 'Montage', price: round(2) },
        { id: 'l-demont', label: 'Demontage', price: round(2) },
      ]
    },
    {
      id: 'task-fitness', title: 'Fitnessraum', description: 'Sportgeräte', price: 0,
      variants: [
        { id: 'fit-m', label: 'M', price: round(50) },
        { id: 'fit-l', label: 'L', price: round(70) },
        { id: 'fit-xl', label: 'XL', price: round(90) },
        { id: 'fit-xxl', label: 'XXL', price: round(120) },
        { id: 'fit-mont', label: 'Montage', price: round(15) },
        { id: 'fit-demont', label: 'Demontage', price: round(10) },
      ]
    },
    {
      id: 'task-garten', title: 'Garten', description: 'Gartenmöbel / Geräte', price: 0,
      variants: [
        { id: 'g-m', label: 'M', price: round(30) },
        { id: 'g-l', label: 'L', price: round(50) },
        { id: 'g-xl', label: 'XL', price: round(70) },
        { id: 'g-xxl', label: 'XXL', price: round(100) },
        { id: 'g-mont', label: 'Montage', price: round(10) },
        { id: 'g-demont', label: 'Demontage', price: round(5) },
      ]
    },
    {
      id: 'task-garage', title: 'Garage', description: 'Garageninhalt', price: 0,
      variants: [
        { id: 'gar-m', label: 'M', price: round(40) },
        { id: 'gar-l', label: 'L', price: round(60) },
        { id: 'gar-xl', label: 'XL', price: round(80) },
        { id: 'gar-xxl', label: 'XXL', price: round(100) },
        { id: 'gar-mont', label: 'Montage', price: round(10) },
        { id: 'gar-demont', label: 'Demontage', price: round(10) },
      ]
    },
    {
      id: 'task-keller', title: 'Keller', description: 'Kellerinhalt', price: 0,
      variants: [
        { id: 'kel-m', label: 'M', price: round(50) },
        { id: 'kel-l', label: 'L', price: round(70) },
        { id: 'kel-xl', label: 'XL', price: round(90) },
        { id: 'kel-xxl', label: 'XXL', price: round(120) },
        { id: 'kel-mont', label: 'Montage', price: round(20) },
        { id: 'kel-demont', label: 'Demontage', price: round(15) },
      ]
    }
  ];

  return tasks;
};

// --- Initial Data ---

const DEFAULT_COMPANY: CompanyProfile = {
  name: '',
  address: '',
  email: '',
  phone: '',
  taxId: '',
  vatId: '',
  bankName: '',
  accountHolder: '',
  iban: '',
  bic: ''
};

const DEFAULT_CLIENT: Client = {
  id: '', name: '', address: '', email: '', phone: ''
};

const INITIAL_INVOICE_STATE: InvoiceData = {
  id: '',
  invoiceNumber: 'RE-2024-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  sender: DEFAULT_COMPANY,
  client: DEFAULT_CLIENT,
  items: [],
  taxRate: 19,
  currency: '€',
  notes: '',
  status: 'draft'
};

const App: React.FC = () => {
  // --- State ---
  const [lang, setLang] = useState<'de' | 'ar'>('de');
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'create' | 'clients' | 'tasks' | 'history' | 'settings'>('create');
  const [showPreview, setShowPreview] = useState(false);

  // Data
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_INVOICE_STATE);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [clients, setClients] = useState<Client[]>([]);
  const [savedTasks, setSavedTasks] = useState<SavedTask[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceData[]>([]);

  // UI State
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTaskForVariants, setActiveTaskForVariants] = useState<SavedTask | null>(null);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false); // New state for collapsible menu

  // Modals State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingTask, setEditingTask] = useState<SavedTask | null>(null);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('zujaj_profile');
    if (savedProfile) setCompanyProfile(JSON.parse(savedProfile));

    const savedClients = localStorage.getItem('zujaj_clients');
    if (savedClients) setClients(JSON.parse(savedClients));

    const savedTasksData = localStorage.getItem('zujaj_tasks');
    if (savedTasksData) {
      setSavedTasks(JSON.parse(savedTasksData));
    } else {
      // Auto-load defaults if empty
      const defaults = generateStandardTasks();
      setSavedTasks(defaults);
      localStorage.setItem('zujaj_tasks', JSON.stringify(defaults));
    }

    const savedHistory = localStorage.getItem('zujaj_history');
    if (savedHistory) setInvoiceHistory(JSON.parse(savedHistory));
    
    if (savedProfile) {
      setInvoice(prev => ({ ...prev, sender: JSON.parse(savedProfile) }));
    }

    // PWA Install Event Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Save to LocalStorage helpers
  const saveProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    localStorage.setItem('zujaj_profile', JSON.stringify(profile));
    setInvoice(prev => ({ ...prev, sender: profile }));
  };

  const saveClientList = (newList: Client[]) => {
    setClients(newList);
    localStorage.setItem('zujaj_clients', JSON.stringify(newList));
  };

  const saveTaskList = (newList: SavedTask[]) => {
    setSavedTasks(newList);
    localStorage.setItem('zujaj_tasks', JSON.stringify(newList));
  };

  const loadStandardTasksToState = () => {
    if (window.confirm('Dies überschreibt alle aktuellen Aufgaben. Fortfahren? / This will overwrite current tasks. Continue?')) {
      const defaults = generateStandardTasks();
      saveTaskList(defaults);
      alert(t.standardLoaded);
    }
  };

  const saveToHistory = () => {
    const newHistory = [
      { ...invoice, id: invoice.id || Date.now().toString(), status: 'pending' as InvoiceStatus }, 
      ...invoiceHistory
    ];
    setInvoiceHistory(newHistory);
    localStorage.setItem('zujaj_history', JSON.stringify(newHistory));
    alert(t.saved);
  };

  const deleteFromHistory = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      const newHistory = invoiceHistory.filter(i => i.id !== id);
      setInvoiceHistory(newHistory);
      localStorage.setItem('zujaj_history', JSON.stringify(newHistory));
    }
  };

  // --- Actions for Modals ---

  const handleSaveClient = () => {
    if (!editingClient) return;
    const exists = clients.find(c => c.id === editingClient.id);
    let newList;
    if (exists) {
      newList = clients.map(c => c.id === editingClient.id ? editingClient : c);
    } else {
      newList = [...clients, editingClient];
    }
    saveClientList(newList);
    setEditingClient(null);
  };

  const handleDeleteClient = () => {
    if (!editingClient) return;
    if (window.confirm(t.confirmDelete)) {
      saveClientList(clients.filter(c => c.id !== editingClient.id));
      setEditingClient(null);
    }
  };

  const handleSaveTask = () => {
    if (!editingTask) return;
    const exists = savedTasks.find(t => t.id === editingTask.id);
    let newList;
    if (exists) {
      newList = savedTasks.map(t => t.id === editingTask.id ? editingTask : t);
    } else {
      newList = [...savedTasks, editingTask];
    }
    saveTaskList(newList);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    if (window.confirm(t.confirmDelete)) {
      saveTaskList(savedTasks.filter(t => t.id !== editingTask.id));
      setEditingTask(null);
    }
  };

  // --- Logic ---

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
    }));
  };

  // Logic for Quick Tasks
  const handleTaskClick = (task: SavedTask) => {
    if (task.variants && task.variants.length > 0) {
      setActiveTaskForVariants(task);
    } else {
      setInvoice(prev => ({
        ...prev,
        items: [...prev.items, { 
          id: Date.now().toString(), 
          description: task.description || task.title, 
          quantity: 1, 
          price: task.price 
        }]
      }));
    }
  };

  const handleVariantClick = (variant: TaskVariant) => {
    if (!activeTaskForVariants) return;
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: Date.now().toString(), 
        description: `${activeTaskForVariants.title} - ${variant.label}`, 
        quantity: 1, 
        price: variant.price 
      }]
    }));
  };

  const handleAiAdd = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    const result = await geminiService.parseInvoiceItem(aiInput);
    setIsAiLoading(false);
    if (result) {
      setInvoice(prev => ({
        ...prev,
        items: [...prev.items, { 
          id: Date.now().toString(), 
          description: result.description, 
          quantity: result.quantity, 
          price: result.price 
        }]
      }));
      setAiInput('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setInvoice(prev => ({ ...prev, client }));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rechnung ${invoice.invoiceNumber}`,
          text: `Rechnung für ${invoice.client.name}`,
          url: window.location.href, 
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      alert('Sharing not supported on this browser');
    }
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  // --- Components ---

  const InvoicePaper = ({ data }: { data: InvoiceData }) => (
    <div className="a4-paper text-sm relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-start mb-12">
        <div className="w-1/2">
           <p className="text-[10px] text-black underline mb-2">
             {data.sender.name} • {data.sender.address}
           </p>
           <div className="rounded p-4 border border-black min-h-[120px]">
             <p className="font-bold text-lg text-black">{data.client.name || 'Empfänger Name'}</p>
             <p className="whitespace-pre-wrap text-black">{data.client.address || 'Straße, Hausnummer\nPLZ Ort'}</p>
           </div>
        </div>
        <div className="w-1/3 text-right">
          <h1 className="text-3xl font-bold text-black mb-4">{isRTL ? 'فاتورة' : 'RECHNUNG'}</h1>
          <div className="space-y-1 text-black">
            <div className="flex justify-between">
              <span>{t.invoiceNumber}:</span>
              <span className="font-semibold text-black">{data.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.date}:</span>
              <span>{formatDateGerman(data.date)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.dueDate}:</span>
              <span>{formatDateGerman(data.dueDate)}</span>
            </div>
             <div className="flex justify-between">
              <span>{t.status}:</span>
              <span className="uppercase text-xs font-bold border border-black px-1 rounded">{data.status}</span>
            </div>
          </div>
        </div>
      </div>

      <table className="w-full mb-8 text-black">
        <thead>
          <tr className="border-b-2 border-black text-xs uppercase tracking-wider">
            <th className={`py-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t.description}</th>
            <th className="py-2 text-center w-20">{t.qty}</th>
            <th className="py-2 text-right w-24">{t.price}</th>
            <th className="py-2 text-right w-24">{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-300">
              <td className="py-3 pr-2">
                <p className="font-medium text-black">{item.description}</p>
              </td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right">{item.price.toFixed(2)}</td>
              <td className="py-3 text-right font-bold">{(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-12 text-black">
        <div className="w-1/2 max-w-xs space-y-2">
          <div className="flex justify-between">
            <span>{t.subtotal}</span>
            <span>{subtotal.toFixed(2)} {data.currency}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.tax} ({data.taxRate}%)</span>
            <span>{taxAmount.toFixed(2)} {data.currency}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t-2 border-black pt-2">
            <span>{t.total}</span>
            <span>{total.toFixed(2)} {data.currency}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 text-black">
        <p className="whitespace-pre-wrap">{data.notes || t.notesPlaceholder}</p>
      </div>

      <div className="absolute bottom-12 left-20mm right-20mm border-t border-black pt-4 text-[10px] text-black flex justify-between">
        <div>
          <p className="font-bold">{data.sender.name}</p>
          <p>{data.sender.address}</p>
          <p>{data.sender.phone}</p>
          <p>{data.sender.email}</p>
        </div>
        <div>
          <p className="font-bold">{t.bankDetails}</p>
          <p>{data.sender.bankName}</p>
          <p>{t.iban}: {data.sender.iban}</p>
          <p>{t.bic}: {data.sender.bic}</p>
        </div>
        <div>
          <p className="font-bold">Info</p>
          <p>{t.taxId}: {data.sender.taxId}</p>
          <p>USt-IdNr: {data.sender.vatId}</p>
          <p>{t.accHolder}: {data.sender.accountHolder}</p>
        </div>
      </div>
    </div>
  );

  // --- Render Sections ---

  const renderCreateTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-6">
        
        <GlassCard className="p-4 bg-slate-800/60">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2 text-blue-300">
               <Users size={18} />
               <h3 className="font-bold">{t.clients}</h3>
             </div>
             <select 
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
              onChange={(e) => handleSelectClient(e.target.value)}
              value={invoice.client.id}
             >
               <option value="">{t.selectClient}</option>
               {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <GlassInput 
                placeholder={t.selectClient} 
                value={invoice.client.name} 
                onChange={(e) => setInvoice(prev => ({ ...prev, client: { ...prev.client, name: e.target.value } }))}
              />
              <GlassInput 
                type="date"
                label={t.date}
                value={invoice.date} 
                onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
              />
           </div>
        </GlassCard>

        {savedTasks.length > 0 && (
          <GlassCard className="bg-slate-800/40 overflow-hidden transition-all duration-300">
            <div 
               onClick={() => setIsTaskMenuOpen(!isTaskMenuOpen)}
               className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
             >
                <div className="flex items-center gap-2">
                  <Briefcase className="text-blue-400" size={18} />
                  <span className="font-bold text-slate-200">{t.quickAdd}</span>
                </div>
                <div className="flex items-center gap-3">
                   {activeTaskForVariants && isTaskMenuOpen && (
                     <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                       {activeTaskForVariants.title}
                     </span>
                   )}
                   <ChevronDown 
                     size={20} 
                     className={`text-slate-400 transition-transform duration-300 ${isTaskMenuOpen ? 'rotate-180' : ''} group-hover:text-white`} 
                   />
                </div>
             </div>

            {isTaskMenuOpen && (
              <div className="p-4 border-t border-white/5 bg-slate-900/30 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                   {activeTaskForVariants && (
                     <button onClick={() => setActiveTaskForVariants(null)} className="text-xs text-blue-300 flex items-center gap-1 hover:underline">
                       <ArrowLeft size={12} /> {t.back}
                     </button>
                   )}
                </div>

                {activeTaskForVariants ? (
                   <div className="animate-in slide-in-from-right fade-in">
                     <p className="text-white font-bold mb-2">{t.selectVariant}: {activeTaskForVariants.title}</p>
                     <div className="flex flex-wrap gap-2">
                       {activeTaskForVariants.variants?.map(variant => (
                         <button
                           key={variant.id}
                           onClick={() => handleVariantClick(variant)}
                           className="px-4 py-3 bg-blue-600/30 hover:bg-blue-500/50 border border-blue-400/30 rounded-lg text-sm transition-all flex flex-col items-center min-w-[100px]"
                         >
                           <span className="font-bold">{variant.label}</span>
                           <span className="text-xs opacity-90">{variant.price.toFixed(2)} {invoice.currency}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                ) : (
                  <div className="flex flex-wrap gap-2 animate-in slide-in-from-left fade-in max-h-60 overflow-y-auto custom-scrollbar">
                    {savedTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={`
                          px-3 py-2 
                          bg-slate-700/50 hover:bg-blue-600/50 
                          border border-slate-600 
                          rounded-lg 
                          text-sm transition-all text-left 
                          flex flex-col gap-1 min-w-[100px]
                          ${task.variants?.length ? 'border-l-4 border-l-purple-500' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="font-semibold">{task.title}</span>
                          {task.variants && task.variants.length > 0 && <Layers size={12} className="text-purple-300" />}
                        </div>
                        {!task.variants?.length && (
                          <span className="text-xs opacity-70">{task.price.toFixed(2)} {invoice.currency}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        )}

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-4 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <input 
              type="text"
              className="bg-transparent w-full outline-none text-sm placeholder-slate-500"
              placeholder={t.aiPlaceholder}
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiAdd()}
            />
            <button onClick={handleAiAdd} disabled={isAiLoading} className="text-blue-400">
               {isAiLoading ? '...' : <Command size={16} />}
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {invoice.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-800/30 p-2 rounded border border-white/5">
                <div className="col-span-6">
                  <input 
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder-slate-600"
                    placeholder={t.description}
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    type="number" className="w-full bg-slate-900/50 text-center text-sm rounded py-1 outline-none"
                    value={item.quantity} onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-3">
                  <input 
                    type="number" className="w-full bg-slate-900/50 text-center text-sm rounded py-1 outline-none"
                    value={item.price} onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-400/50 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          
          <GlassButton onClick={handleAddItem} variant="secondary" className="w-full text-xs py-2">
            <Plus size={14} /> {t.items}
          </GlassButton>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-2">
           <div className="flex justify-between text-sm text-slate-400">
             <span>{t.subtotal}</span>
             <span>{subtotal.toFixed(2)}</span>
           </div>
           <div className="flex justify-between items-center text-sm text-slate-400">
             <div className="flex items-center gap-2">
               <span>{t.tax} %</span>
               <input 
                type="number" value={invoice.taxRate} 
                onChange={(e) => setInvoice(prev => ({...prev, taxRate: parseFloat(e.target.value)}))}
                className="w-12 bg-slate-900 text-center rounded border border-slate-700"
               />
             </div>
             <span>{taxAmount.toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-2 mt-2">
             <span>{t.total}</span>
             <span className="text-blue-400">{total.toFixed(2)} {invoice.currency}</span>
           </div>
        </GlassCard>
      </div>

      <div className="hidden xl:flex flex-col gap-4 relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl -z-10" />
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">{t.preview}</h2>
          <div className="flex gap-2">
             <GlassButton onClick={() => setShowPreview(true)} variant="primary"><Eye size={16} /></GlassButton>
             <GlassButton onClick={saveToHistory} variant="secondary"><Save size={16} /></GlassButton>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl scale-[0.65] origin-top-left w-[150%] h-[150%] bg-white text-black">
          <InvoicePaper data={invoice} />
        </div>
      </div>
    </div>
  );

  const renderClientsTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Users /> {t.clients}</h2>
        <GlassButton onClick={() => setEditingClient({ id: Date.now().toString(), name: '', address: '', email: '', phone: '' })}>
          <Plus size={16} /> {t.addClient}
        </GlassButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <GlassCard key={client.id} className="p-4 relative group hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-white">{client.name}</h3>
              <div className="flex gap-2">
                 <button onClick={() => setEditingClient(client)} className="text-blue-400 hover:text-blue-300 p-1 bg-blue-500/10 rounded">
                   <Edit3 size={14} />
                 </button>
              </div>
            </div>
            <p className="text-sm text-slate-400 truncate">{client.email || 'Keine E-Mail'}</p>
            <p className="text-sm text-slate-500 mt-1 truncate">{client.address || 'Keine Adresse'}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2"><CheckCircle /> {t.tasks}</h2>
        <div className="flex gap-2">
          <GlassButton onClick={loadStandardTasksToState} variant="secondary">
            <RefreshCw size={16} /> {t.loadStandard}
          </GlassButton>
          <GlassButton onClick={() => setEditingTask({ id: Date.now().toString(), title: '', description: '', price: 0 })}>
            <Plus size={16} /> {t.addTask}
          </GlassButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedTasks.map(task => (
          <GlassCard key={task.id} className="p-4 relative group hover:border-purple-500/50 transition-colors">
             <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold text-lg">{task.title}</h3>
               <button onClick={() => setEditingTask(task)} className="text-blue-400 hover:text-blue-300 p-1 bg-blue-500/10 rounded">
                 <Edit3 size={14} />
               </button>
             </div>
             <p className="text-sm text-slate-400 line-clamp-2 min-h-[40px]">{task.description}</p>
             <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
               <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded">
                 {task.variants?.length ? `${task.variants.length} Varianten` : 'Festpreis'}
               </span>
               <span className="font-bold text-green-400">
                 {!task.variants?.length ? `${task.price.toFixed(2)} €` : ''}
               </span>
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold flex items-center gap-2"><Settings /> {t.companyDetails}</h2>
         <GlassButton onClick={() => alert(t.saved)} variant="primary">
           <Save size={16} /> {t.save}
         </GlassButton>
      </div>
      
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-blue-400 font-bold border-b border-white/10 pb-2">Basisinformationen</h3>
        <GlassInput label="Firmenname" value={companyProfile.name} onChange={(e) => saveProfile({...companyProfile, name: e.target.value})} />
        <textarea 
          className="w-full bg-slate-900/50 rounded p-3 text-white border border-slate-700 h-24"
          placeholder="Anschrift"
          value={companyProfile.address} onChange={(e) => saveProfile({...companyProfile, address: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <GlassInput label="E-Mail" value={companyProfile.email} onChange={(e) => saveProfile({...companyProfile, email: e.target.value})} />
          <GlassInput label="Telefon" value={companyProfile.phone} onChange={(e) => saveProfile({...companyProfile, phone: e.target.value})} />
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <h3 className="text-green-400 font-bold border-b border-white/10 pb-2">Finanzen & Steuern</h3>
        <div className="grid grid-cols-2 gap-4">
          <GlassInput label={t.taxId} value={companyProfile.taxId} onChange={(e) => saveProfile({...companyProfile, taxId: e.target.value})} />
          <GlassInput label="USt-IdNr." value={companyProfile.vatId} onChange={(e) => saveProfile({...companyProfile, vatId: e.target.value})} />
        </div>
        <h4 className="text-sm font-semibold text-slate-400 mt-4">{t.bankDetails}</h4>
        <GlassInput label="Bankname" value={companyProfile.bankName} onChange={(e) => saveProfile({...companyProfile, bankName: e.target.value})} />
        <GlassInput label={t.accHolder} value={companyProfile.accountHolder} onChange={(e) => saveProfile({...companyProfile, accountHolder: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <GlassInput label={t.iban} value={companyProfile.iban} onChange={(e) => saveProfile({...companyProfile, iban: e.target.value})} />
          <GlassInput label={t.bic} value={companyProfile.bic} onChange={(e) => saveProfile({...companyProfile, bic: e.target.value})} />
        </div>
      </GlassCard>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6 animate-in fade-in">
       <h2 className="text-2xl font-bold flex items-center gap-2"><History /> {t.history}</h2>
       <div className="grid gap-4">
         {invoiceHistory.length === 0 && <p className="text-slate-500">Keine Rechnungen gefunden.</p>}
         {invoiceHistory.map((inv) => (
           <GlassCard key={inv.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
               <p className="font-bold text-lg text-white">{inv.invoiceNumber}</p>
               <p className="text-sm text-slate-400">{inv.client.name} • {inv.date}</p>
             </div>
             <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${inv.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {inv.status}
                </span>
                <span className="font-bold text-blue-300">
                  {inv.items.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)} {inv.currency}
                </span>
                <div className="flex gap-2">
                  <GlassButton 
                    onClick={() => { setInvoice(inv); setActiveTab('create'); }}
                    className="text-xs"
                    variant="secondary"
                  >
                    <Edit3 size={14} />
                  </GlassButton>
                  <GlassButton 
                    onClick={() => deleteFromHistory(inv.id)}
                    className="text-xs"
                    variant="danger"
                  >
                    <Trash2 size={14} />
                  </GlassButton>
                </div>
             </div>
           </GlassCard>
         ))}
       </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#1a1a1a] text-slate-200 transition-colors duration-500 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row h-screen overflow-hidden">
        
        <nav className="w-full md:w-20 lg:w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col no-print shrink-0">
           <div className="p-6 flex items-center gap-3 border-b border-white/5">
             <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
               <Receipt size={18} className="text-white" />
             </div>
             <span className="font-bold text-xl hidden lg:block tracking-tight">Zujaj</span>
           </div>
           
           <div className="flex-1 overflow-y-auto py-4 flex flex-row md:flex-col gap-1 px-2 md:px-4">
             <NavButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={<FileText size={20}/>} label={t.create} />
             <NavButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users size={20}/>} label={t.clients} />
             <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<Briefcase size={20}/>} label={t.tasks} />
             <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20}/>} label={t.history} />
             <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label={t.settings} />
           </div>

           <div className="p-4 border-t border-white/5 hidden md:block space-y-2">
             {deferredPrompt && (
               <button 
                 onClick={handleInstallApp}
                 className="w-full p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 mb-2"
               >
                 <Download size={14} /> {t.installApp}
               </button>
             )}
             <button 
               onClick={() => setLang(l => l === 'de' ? 'ar' : 'de')}
               className="w-full p-2 rounded-lg bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors"
             >
               {lang === 'de' ? 'Sprache: DE' : 'اللغة: AR'}
             </button>
           </div>
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative no-print">
           <div className="max-w-7xl mx-auto pb-24">
             {activeTab === 'create' && renderCreateTab()}
             {activeTab === 'clients' && renderClientsTab()}
             {activeTab === 'tasks' && renderTasksTab()}
             {activeTab === 'history' && renderHistoryTab()}
             {activeTab === 'settings' && renderSettingsTab()}
           </div>

           {activeTab === 'create' && (
             <div className="fixed bottom-6 right-6 xl:hidden">
               <button 
                onClick={() => setShowPreview(true)}
                className="w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
               >
                 <Eye size={24} />
               </button>
             </div>
           )}
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1a1a1a] w-full h-full max-w-6xl rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
            <div className="w-full md:w-64 bg-slate-900 p-6 flex flex-col gap-4 border-r border-white/5 shrink-0 no-print">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t.preview}</h3>
                <button onClick={() => setShowPreview(false)} className="md:hidden"><X /></button>
              </div>
              <GlassButton onClick={handlePrint} variant="primary" className="w-full py-3">
                <Printer size={18} /> {t.print}
              </GlassButton>
              <GlassButton onClick={saveToHistory} variant="secondary" className="w-full py-3">
                <Save size={18} /> {t.save}
              </GlassButton>
              <GlassButton onClick={handleShare} variant="secondary" className="w-full py-3">
                <Share2 size={18} /> Share
              </GlassButton>
              <div className="mt-auto">
                <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <X size={18} /> {t.close}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-800 overflow-y-auto p-8 flex justify-center items-start">
              <div className="print-only-container">
                <InvoicePaper data={invoice} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <GlassCard className="w-full max-w-md p-6 bg-slate-900 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">{t.editClient}</h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <GlassInput 
                placeholder="Name" 
                value={editingClient.name} 
                onChange={(e) => setEditingClient({...editingClient, name: e.target.value})} 
              />
              <GlassInput 
                placeholder="E-Mail" 
                value={editingClient.email} 
                onChange={(e) => setEditingClient({...editingClient, email: e.target.value})} 
              />
              <GlassInput 
                placeholder="Telefon" 
                value={editingClient.phone} 
                onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})} 
              />
              <textarea 
                className="w-full bg-slate-800/50 rounded p-3 text-slate-200 border border-slate-700 h-24 focus:border-blue-500/50 outline-none"
                placeholder="Adresse"
                value={editingClient.address}
                onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
              />
            </div>
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
               <button onClick={handleDeleteClient} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-red-500/10">
                 <Trash2 size={16} /> {t.delete}
               </button>
               <div className="flex gap-3">
                 <GlassButton onClick={() => setEditingClient(null)} variant="secondary">{t.close}</GlassButton>
                 <GlassButton onClick={handleSaveClient} variant="primary">{t.save}</GlassButton>
               </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <GlassCard className="w-full max-w-lg p-6 bg-slate-900 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">{t.editTask}</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <GlassInput 
                placeholder="Titel (z.B. Bett Reinigung)" 
                value={editingTask.title} 
                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} 
              />
              <textarea 
                className="w-full bg-slate-800/50 rounded p-3 text-slate-200 border border-slate-700 h-20 outline-none"
                placeholder="Beschreibung"
                value={editingTask.description}
                onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
              />
              <div className="w-1/2">
                <GlassInput 
                  label="Basispreis"
                  type="number"
                  value={editingTask.price} 
                  onChange={(e) => setEditingTask({...editingTask, price: parseFloat(e.target.value)})} 
                />
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
               <div className="flex justify-between items-center mb-3">
                 <h4 className="font-bold text-sm text-purple-300 uppercase">{t.smartTask} Varianten</h4>
                 <button 
                   onClick={() => setEditingTask({
                     ...editingTask, 
                     variants: [...(editingTask.variants || []), { id: Date.now().toString(), label: '', price: 0 }]
                   })}
                   className="text-xs text-blue-400 hover:text-white flex items-center gap-1"
                 >
                   <Plus size={14} /> {t.addVariant}
                 </button>
               </div>
               <div className="space-y-2">
                 {editingTask.variants?.map((v, idx) => (
                   <div key={v.id} className="flex gap-2 items-center">
                     <input 
                       className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                       placeholder="Label (z.B. XL)"
                       value={v.label}
                       onChange={(e) => {
                         const newVars = [...editingTask.variants!];
                         newVars[idx].label = e.target.value;
                         setEditingTask({...editingTask, variants: newVars});
                       }}
                     />
                     <input 
                       type="number"
                       className="w-24 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                       placeholder="Preis"
                       value={v.price}
                       onChange={(e) => {
                         const newVars = [...editingTask.variants!];
                         newVars[idx].price = parseFloat(e.target.value);
                         setEditingTask({...editingTask, variants: newVars});
                       }}
                     />
                     <button 
                       onClick={() => {
                         const newVars = editingTask.variants!.filter(va => va.id !== v.id);
                         setEditingTask({...editingTask, variants: newVars});
                       }}
                       className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 ))}
                 {(!editingTask.variants || editingTask.variants.length === 0) && (
                   <p className="text-xs text-slate-500 text-center py-2">Keine Varianten. Basispreis wird verwendet.</p>
                 )}
               </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
               <button onClick={handleDeleteTask} className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-red-500/10">
                 <Trash2 size={16} /> {t.delete}
               </button>
               <div className="flex gap-3">
                 <GlassButton onClick={() => setEditingTask(null)} variant="secondary">{t.close}</GlassButton>
                 <GlassButton onClick={handleSaveTask} variant="primary">{t.save}</GlassButton>
               </div>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
};

// Nav Helper
const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-3 p-3 rounded-xl transition-all w-full
      ${active 
        ? 'bg-blue-600/20 text-blue-400 font-bold shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }
    `}
  >
    {icon}
    <span className="hidden lg:block">{label}</span>
  </button>
);

export default App;