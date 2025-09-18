// Supabase removed - will be replaced with internal database calls

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  // Will be updated with new schema
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

// Placeholder services - will be reimplemented with internal API
export const financialTransactionsService = {
  async getAll(): Promise<FinancialTransaction[]> {
    throw new Error("Service needs to be reimplemented with new internal API");
  },
};

export const bankAccountsService = {
  async getAll() {
    throw new Error("Service needs to be reimplemented with new internal API");
  },
};

export const suppliersService = {
  async getAll() {
    throw new Error("Service needs to be reimplemented with new internal API");
  },
};

export const donorsService = {
  async getAll() {
    throw new Error("Service needs to be reimplemented with new internal API");
  },
};