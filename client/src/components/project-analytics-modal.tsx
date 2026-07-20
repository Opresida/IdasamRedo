// Modal reutilizável de Analytics de um projeto: resumo financeiro + 3 gráficos de custo
// (recharts) + bloco da Capacitação (se vinculado) + Impacto Positivo. Usado no admin
// (dados completos, com token) e no público (dados já filtrados pelos toggles).
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from 'recharts';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, GraduationCap, Sparkles } from 'lucide-react';

export type ProjectAnalyticsData = {
  projeto: {
    id: string; nome: string; descricao: string; categoria: string; status: string;
    orcamentoTotal: number; programaCapacitacao: string | null; impactoIntro: string | null;
    analyticsPublico: boolean; impactoPublico: boolean; visivelTransparencia: boolean;
    mostrarOrcamento: boolean; mostrarTransacoes: boolean;
  };
  custos: {
    receitas: number; despesas: number; saldo: number;
    despesasPorCategoria: { categoria: string; total: number }[];
    custosFixos: number; custosVariaveis: number;
    evolucaoMensal: { mes: string; receitas: number; despesas: number }[];
  };
  impactos: { id: string; titulo: string; valor: string; descricao: string | null; icone: string | null; isPublic: boolean }[];
  impactoVisivel: boolean;
  capacitacao: null | {
    totalMatriculas: number; certificadosEmitidos: number; alunosFormados: number; totalCursos: number; cursosConcluidos: number;
  };
};

const PROGRAM_LABELS: Record<string, string> = { proindi: 'PROINDI 4.0', pti: 'PTI' };
const CAT_COLORS = ['#1c4a2b', '#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777', '#0891b2', '#65a30d', '#dc2626', '#475569'];
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const mesLabel = (m: string) => { const [y, mm] = m.split('-'); return mm && y ? `${mm}/${y.slice(2)}` : m; };

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <p className={`text-xl font-bold ${color ?? 'text-gray-900'}`}>{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function ProjectAnalyticsModal({
  open, onClose, fetchUrl, adminToken, admin,
}: { open: boolean; onClose: () => void; fetchUrl: string; adminToken?: string; admin?: boolean }) {
  const { data, isLoading, isError } = useQuery<ProjectAnalyticsData>({
    queryKey: [fetchUrl],
    queryFn: async () => {
      const res = await fetch(fetchUrl, adminToken ? { headers: { Authorization: `Bearer ${adminToken}` } } : undefined);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: open,
  });

  const temCustos = !!data && (data.custos.despesas > 0 || data.custos.receitas > 0);
  const fixoVar = data ? [
    { name: 'Fixos', value: data.custos.custosFixos },
    { name: 'Variáveis', value: data.custos.custosVariaveis },
  ].filter((x) => x.value > 0) : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-forest">
            <BarChart3 className="w-4 h-4" />
            {data ? `Análise & Impacto — ${data.projeto.nome}` : 'Análise & Impacto'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" /></div>
          ) : isError || !data ? (
            <div className="text-center py-16 text-gray-400">Não foi possível carregar a análise deste projeto.</div>
          ) : (
            <>
              {/* Cabeçalho: categoria + programa */}
              <div className="flex flex-wrap items-center gap-2">
                {data.projeto.categoria && <Badge variant="secondary" className="text-xs">{data.projeto.categoria}</Badge>}
                {data.projeto.programaCapacitacao && (
                  <Badge className="text-xs border bg-indigo-100 text-indigo-700 border-indigo-200">
                    Capacitação: {PROGRAM_LABELS[data.projeto.programaCapacitacao] ?? data.projeto.programaCapacitacao}
                  </Badge>
                )}
              </div>

              {/* Resumo financeiro */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-forest" /> Resumo financeiro</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Receitas" value={brl(data.custos.receitas)} color="text-green-600" />
                  <StatCard label="Despesas" value={brl(data.custos.despesas)} color="text-red-600" />
                  <StatCard label="Saldo" value={brl(data.custos.saldo)} color={data.custos.saldo >= 0 ? 'text-forest' : 'text-red-600'} />
                  {(admin || data.projeto.mostrarOrcamento) && <StatCard label="Orçamento" value={brl(data.projeto.orcamentoTotal)} />}
                </div>
              </div>

              {/* Gráficos de custos */}
              {temCustos ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Despesas por categoria */}
                  <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Despesas por categoria</p>
                    {data.custos.despesasPorCategoria.length === 0 ? (
                      <p className="text-xs text-gray-400 py-8 text-center">Sem despesas registradas.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={data.custos.despesasPorCategoria} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={78} label={(e: any) => e.categoria}>
                            {data.custos.despesasPorCategoria.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => brl(Number(v))} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Fixos × Variáveis */}
                  <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Custos fixos × variáveis</p>
                    {fixoVar.length === 0 ? (
                      <p className="text-xs text-gray-400 py-8 text-center">Despesas sem classificação fixo/variável.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={fixoVar} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={78} label={(e: any) => e.name}>
                            <Cell fill="#2563eb" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                          <Tooltip formatter={(v: any) => brl(Number(v))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Evolução mensal */}
                  <div className="border border-gray-100 rounded-lg p-3 lg:col-span-2">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Evolução mensal (receitas × despesas)</p>
                    {data.custos.evolucaoMensal.length === 0 ? (
                      <p className="text-xs text-gray-400 py-8 text-center">Sem histórico mensal.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={data.custos.evolucaoMensal.map((m) => ({ ...m, label: mesLabel(m.mes) }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => brl(Number(v))} width={70} />
                          <Tooltip formatter={(v: any) => brl(Number(v))} />
                          <Legend />
                          <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#16a34a" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#dc2626" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Nenhum dado financeiro público para exibir gráficos.</p>
              )}

              {/* Capacitação */}
              {data.capacitacao && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-forest" /> Capacitação {data.projeto.programaCapacitacao ? `— ${PROGRAM_LABELS[data.projeto.programaCapacitacao]}` : ''}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Matrículas" value={data.capacitacao.totalMatriculas.toLocaleString('pt-BR')} color="text-forest" />
                    <StatCard label="Certificados" value={data.capacitacao.certificadosEmitidos.toLocaleString('pt-BR')} color="text-green-600" />
                    <StatCard label="Alunos formados" value={data.capacitacao.alunosFormados.toLocaleString('pt-BR')} />
                    <StatCard label="Cursos" value={`${data.capacitacao.cursosConcluidos}/${data.capacitacao.totalCursos}`} />
                  </div>
                </div>
              )}

              {/* Impacto Positivo */}
              {data.impactoVisivel && data.impactos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-forest" /> Impacto Positivo</p>
                  {data.projeto.impactoIntro && <p className="text-xs text-gray-500 mb-3">{data.projeto.impactoIntro}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.impactos.map((i) => (
                      <div key={i.id} className="border border-gray-100 rounded-lg p-3 bg-forest/5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-2xl font-bold text-forest">{i.valor}</p>
                          {admin && !i.isPublic && <Badge className="text-[10px] bg-gray-100 text-gray-500 border-gray-200">privado</Badge>}
                        </div>
                        <p className="text-sm font-medium text-gray-800">{i.titulo}</p>
                        {i.descricao && <p className="text-xs text-gray-500 mt-1">{i.descricao}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
