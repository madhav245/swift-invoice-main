import { Product, Client, Invoice, AppSettings } from './types';
import { supabase } from './supabase';

// LocalStorage keys for non-synced data
const LOCAL_KEYS = {
  unlocked: 'inv_unlocked',
  invoiceCounter: 'inv_counter',
};

// Default Settings
export const defaultSettings: AppSettings = {
  companyName: 'My Business',
  companyAddress: '',
  companyPhone: '',
  taxRate: 0,
  pinCode: '',
  darkMode: false,
  currency: '₹',
};

// ============= PRODUCTS =============
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const saveProducts = async (p: Product[]): Promise<void> => {
  try {
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('products').insert(p);
    if (error) throw error;
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

export const addProduct = async (p: Product): Promise<void> => {
  try {
    const { error } = await supabase.from('products').insert([p]);
    if (error) throw error;
  } catch (error) {
    console.error('Error adding product:', error);
  }
};

export const updateProduct = async (p: Product): Promise<void> => {
  try {
    const { error } = await supabase.from('products').update(p).eq('id', p.id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating product:', error);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

// ============= CLIENTS =============
export const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

export const saveClients = async (c: Client[]): Promise<void> => {
  try {
    await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('clients').insert(c);
    if (error) throw error;
  } catch (error) {
    console.error('Error saving clients:', error);
  }
};

export const addClient = async (c: Client): Promise<void> => {
  try {
    const { error } = await supabase.from('clients').insert([c]);
    if (error) throw error;
  } catch (error) {
    console.error('Error adding client:', error);
  }
};

export const updateClient = async (c: Client): Promise<void> => {
  try {
    const { error } = await supabase.from('clients').update(c).eq('id', c.id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating client:', error);
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting client:', error);
  }
};

// ============= INVOICES =============
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};

export const saveInvoices = async (i: Invoice[]): Promise<void> => {
  try {
    await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('invoices').insert(i);
    if (error) throw error;
  } catch (error) {
    console.error('Error saving invoices:', error);
  }
};

export const addInvoice = async (i: Invoice): Promise<void> => {
  try {
    const { error } = await supabase.from('invoices').insert([i]);
    if (error) throw error;
  } catch (error) {
    console.error('Error adding invoice:', error);
  }
};

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting invoice:', error);
  }
};

// ============= INVOICE COUNTER =============
export const getNextInvoiceNumber = async (): Promise<string> => {
  try {
    const { data: settings } = await supabase.from('settings').select('*').limit(1).single();
    
    if (!settings) {
      return 'INV-00001';
    }

    // Get current max invoice number from invoices table
    const { data: invoices } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (invoices && invoices.length > 0) {
      const lastNum = parseInt(invoices[0].invoice_number.replace('INV-', ''));
      nextNum = lastNum + 1;
    }

    return `INV-${String(nextNum).padStart(5, '0')}`;
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    return `INV-${String(Date.now() % 100000).padStart(5, '0')}`;
  }
};

// ============= SETTINGS =============
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    
    if (!data) {
      // Create default settings
      const { data: newSettings } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();
      return newSettings || defaultSettings;
    }

    return {
      companyName: data.company_name || '',
      companyLogo: data.company_logo || undefined,
      companyAddress: data.company_address || '',
      companyPhone: data.company_phone || '',
      taxRate: data.tax_rate || 0,
      pinCode: data.pin_code || '',
      darkMode: data.dark_mode || false,
      currency: data.currency || '₹',
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return defaultSettings;
  }
};

export const saveSettings = async (s: AppSettings): Promise<void> => {
  try {
    const dbData = {
      company_name: s.companyName,
      company_logo: s.companyLogo,
      company_address: s.companyAddress,
      company_phone: s.companyPhone,
      tax_rate: s.taxRate,
      currency: s.currency,
      dark_mode: s.darkMode,
      pin_code: s.pinCode,
    };

    const { data: existing } = await supabase.from('settings').select('id').limit(1).single();

    if (existing) {
      const { error } = await supabase.from('settings').update(dbData).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('settings').insert([dbData]);
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// ============= PIN & UNLOCK =============
export const isPinSet = async (): Promise<boolean> => {
  try {
    const settings = await getSettings();
    return settings.pinCode.length > 0;
  } catch (error) {
    console.error('Error checking PIN:', error);
    return false;
  }
};

export const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    const settings = await getSettings();
    return settings.pinCode === pin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

export const isUnlocked = (): boolean => {
  try {
    const data = localStorage.getItem(LOCAL_KEYS.unlocked);
    return data === 'true';
  } catch {
    return false;
  }
};

export const setUnlocked = (v: boolean): void => {
  try {
    localStorage.setItem(LOCAL_KEYS.unlocked, v ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting unlock state:', error);
  }
};
