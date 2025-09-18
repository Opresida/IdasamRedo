// Supabase client removed - using internal database system
// This file is kept as placeholder to avoid import errors

export const supabase = {
  // Placeholder object to prevent import errors
  // All functionality moved to internal database system
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null })
  }),
  rpc: () => ({ data: [], error: null })
};

console.warn('Supabase client is deprecated. Using internal database system.');