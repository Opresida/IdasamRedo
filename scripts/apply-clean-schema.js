
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 APLICANDO SCHEMA CONSOLIDADO NO SUPABASE');
console.log('==========================================');

const schemaPath = path.join(__dirname, '..', 'supabase_clean_consolidated_schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Arquivo de schema não encontrado:', schemaPath);
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('📄 Schema carregado com sucesso');
console.log('📋 Próximos passos:');
console.log('');
console.log('1️⃣  Abra o Supabase Dashboard: https://app.supabase.com');
console.log('2️⃣  Vá para "SQL Editor"');
console.log('3️⃣  Cole o conteúdo do arquivo: supabase_clean_consolidated_schema.sql');
console.log('4️⃣  Execute o script (clique em "Run")');
console.log('');
console.log('🔍 O que o schema faz:');
console.log('   ✅ Remove todas as tabelas duplicadas');
console.log('   ✅ Cria estrutura única e otimizada');
console.log('   ✅ Corrige conflitos de colunas');
console.log('   ✅ Adiciona índices para performance');
console.log('   ✅ Insere dados de exemplo');
console.log('');
console.log('⚡ Após executar, seu sistema estará funcionando perfeitamente!');
