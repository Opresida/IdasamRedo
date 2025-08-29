
import { supabase } from '../supabaseClient';

// Types baseados no schema do Supabase
export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  project_id?: string | null;
  is_public: boolean;
  status: string;
  supplier_id?: string | null;
  donor_id?: string | null;
  bank_account_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  agency?: string | null;
  account_number?: string | null;
  initial_balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj_cpf?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  pix_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Donor {
  id: string;
  name: string;
  cnpj_cpf?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  pix_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Service para Transações Financeiras
export const financialTransactionsService = {
  // Buscar todas as transações
  async getAll(): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Buscar transações por projeto
  async getByProject(projectId: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Buscar transações públicas
  async getPublic(): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('is_public', true)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Criar nova transação
  async create(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar transação
  async update(id: string, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar transação
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Atualizar visibilidade pública
  async updateVisibility(id: string, isPublic: boolean): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Service para Contas Bancárias
export const bankAccountsService = {
  async getAll(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(account)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Service para Fornecedores
export const suppliersService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Service para Doadores
export const donorsService = {
  async getAll(): Promise<Donor[]> {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(donor: Omit<Donor, 'id' | 'created_at' | 'updated_at'>): Promise<Donor> {
    const { data, error } = await supabase
      .from('donors')
      .insert(donor)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Donor>): Promise<Donor> {
    const { data, error } = await supabase
      .from('donors')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('donors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
