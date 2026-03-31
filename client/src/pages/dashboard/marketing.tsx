import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail, Users, Pencil, Trash2, Plus, Send, Search, X, FileText,
  Zap, Bell, BookOpen, Code2, Eye, BarChart3, TrendingUp, AlertCircle, CheckCircle2,
  ChevronRight, ArrowRight, ArrowLeft, Layers, Target, RefreshCw,
} from 'lucide-react';
import type { EmailAudience, AudienceLead, EmailTemplate, Course, CourseNotificationSubscription, CustomHtmlTemplate, EmailTriggerType } from '@shared/schema';
import { EMAIL_TRIGGER_TYPES, COURSE_STATUSES } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

type AudienceWithCount = EmailAudience & { leadCount: number };

const TRIGGER_LABELS: Record<string, string> = {
  manual: 'Manual',
  course_signup: 'Matrícula em Curso',
  certificate_ready: 'Certificado Emitido',
  course_notification: 'Notificação de Curso',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  closed: 'Fechado',
  coming_soon: 'Em Breve',
  completed: 'Concluído',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  open: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
  coming_soon: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
};

// ─── Audiences Tab ────────────────────────────────────────────────────────────

type LeadSearchMode = 'text' | 'course';

function AudiencesTab({ adminToken }: { adminToken: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedAudienceId, setSelectedAudienceId] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchMode, setSearchMode] = useState<LeadSearchMode>('text');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: audiences = [], isLoading: loadingAudiences } = useQuery<AudienceWithCount[]>({
    queryKey: ['/api/marketing/audiences'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/audiences', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: leads = [], isLoading: loadingLeads } = useQuery<AudienceLead[]>({
    queryKey: ['/api/marketing/audiences', selectedAudienceId, 'leads'],
    queryFn: async () => {
      const res = await fetch(`/api/marketing/audiences/${selectedAudienceId}/leads`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!selectedAudienceId && !!adminToken,
  });

  const { data: searchResults = [] } = useQuery<{ name: string; email: string; source: string }[]>({
    queryKey: ['/api/marketing/leads/search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/marketing/leads/search?q=${encodeURIComponent(debouncedQuery)}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: searchMode === 'text' && debouncedQuery.length > 1 && !!adminToken,
  });

  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
  });

  const { data: courseLeads = [], isLoading: loadingCourseLeads } = useQuery<{ name: string; email: string; source: string; courseTitle: string }[]>({
    queryKey: ['/api/marketing/leads/by-course', selectedCourseIds.join(',')],
    queryFn: async () => {
      if (selectedCourseIds.length === 0) return [];
      const res = await fetch(`/api/marketing/leads/by-course?courseIds=${selectedCourseIds.join(',')}`, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: searchMode === 'course' && selectedCourseIds.length > 0 && !!adminToken,
  });

  const { data: notificationSubs = [], isLoading: loadingNotifSubs } = useQuery<CourseNotificationSubscription[]>({
    queryKey: ['/api/marketing/notification-subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/notification-subscriptions', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const createAudience = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/marketing/audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ name: createName }),
      });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Audiência criada!' });
      setCreateName('');
      qc.invalidateQueries({ queryKey: ['/api/marketing/audiences'] });
    },
    onError: () => toast({ title: 'Erro ao criar audiência', variant: 'destructive' }),
  });

  const deleteAudience = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketing/audiences/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
    },
    onSuccess: () => {
      toast({ title: 'Audiência removida' });
      if (selectedAudienceId) setSelectedAudienceId(null);
      qc.invalidateQueries({ queryKey: ['/api/marketing/audiences'] });
    },
    onError: () => toast({ title: 'Erro ao remover audiência', variant: 'destructive' }),
  });

  const addLead = useMutation({
    mutationFn: async (lead: { name: string; email: string }) => {
      const res = await fetch(`/api/marketing/audiences/${selectedAudienceId}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Lead adicionado!' });
      setSearchQuery('');
      setDebouncedQuery('');
      qc.invalidateQueries({ queryKey: ['/api/marketing/audiences', selectedAudienceId, 'leads'] });
      qc.invalidateQueries({ queryKey: ['/api/marketing/audiences'] });
    },
    onError: () => toast({ title: 'Erro ao adicionar lead', variant: 'destructive' }),
  });

  const removeLead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketing/leads/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
    },
    onSuccess: () => {
      toast({ title: 'Lead removido' });
      qc.invalidateQueries({ queryKey: ['/api/marketing/audiences', selectedAudienceId, 'leads'] });
      qc.invalidateQueries({ queryKey: ['/api/marketing/audiences'] });
    },
    onError: () => toast({ title: 'Erro ao remover lead', variant: 'destructive' }),
  });

  const selectedAudience = audiences.find(a => a.id === selectedAudienceId);

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const activeResults = searchMode === 'course' ? courseLeads : (debouncedQuery.length > 1 ? searchResults : []);

  return (
    <div className="space-y-6">
      {/* Master-detail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-xl border border-gray-200 overflow-hidden min-h-[520px]">
        {/* Left: Audience list */}
        <div className="lg:col-span-2 border-r border-gray-200 bg-gray-50/50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Audiências</p>
            <div className="flex gap-2">
              <Input
                placeholder="Nova audiência..."
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && createName.trim()) createAudience.mutate(); }}
                className="text-sm h-8"
              />
              <Button
                size="sm"
                className="bg-forest hover:bg-forest/90 text-white h-8 px-3 shrink-0"
                disabled={!createName.trim() || createAudience.isPending}
                onClick={() => createAudience.mutate()}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingAudiences ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forest" /></div>
            ) : audiences.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Nenhuma audiência</p>
                <p className="text-xs text-gray-400 mt-1">Crie uma audiência acima.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {audiences.map(a => (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group ${
                      selectedAudienceId === a.id
                        ? 'bg-forest text-white shadow-sm'
                        : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedAudienceId(a.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        selectedAudienceId === a.id ? 'bg-white/20 text-white' : 'bg-forest/10 text-forest'
                      }`}>
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${selectedAudienceId === a.id ? 'text-white' : 'text-gray-900'}`}>{a.name}</p>
                        <p className={`text-xs ${selectedAudienceId === a.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {a.leadCount} lead{a.leadCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {selectedAudienceId === a.id && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                      <Button
                        size="sm" variant="ghost"
                        className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                          selectedAudienceId === a.id ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        onClick={e => { e.stopPropagation(); deleteAudience.mutate(a.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Leads panel */}
        <div className="lg:col-span-3 flex flex-col bg-white">
          {!selectedAudience ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-base font-semibold text-gray-600 mb-1">Selecione uma audiência</p>
              <p className="text-sm text-gray-400">Clique em uma audiência à esquerda para gerenciar seus leads</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{selectedAudience.name}</h3>
                    <Badge className="bg-forest/10 text-forest border-0 text-xs">{selectedAudience.leadCount} leads</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Busque e adicione leads por nome, e-mail ou curso</p>
                </div>
              </div>

              <div className="p-4 border-b border-gray-100 space-y-3">
                {/* Search mode toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      searchMode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setSearchMode('text')}
                  >
                    <Search className="w-3 h-3" /> Por Nome/E-mail
                  </button>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      searchMode === 'course' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setSearchMode('course')}
                  >
                    <BookOpen className="w-3 h-3" /> Por Curso
                  </button>
                </div>

                {/* Text search */}
                {searchMode === 'text' && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                    {searchQuery && (
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => { setSearchQuery(''); setDebouncedQuery(''); }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Course filter */}
                {searchMode === 'course' && (
                  <div className="space-y-2">
                    <div className="max-h-36 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2 bg-gray-50">
                      {allCourses.map(c => (
                        <label
                          key={c.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white transition-colors ${selectedCourseIds.includes(c.id) ? 'bg-white border border-forest/20' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCourseIds.includes(c.id)}
                            onChange={() => toggleCourse(c.id)}
                            className="rounded text-forest"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{c.title}</p>
                          </div>
                          <Badge className={`text-xs shrink-0 ${STATUS_BADGE_CLASSES[c.status] ?? ''}`}>
                            {STATUS_LABELS[c.status] ?? c.status}
                          </Badge>
                        </label>
                      ))}
                    </div>
                    {selectedCourseIds.length > 0 && (
                      <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1" onClick={() => setSelectedCourseIds([])}>
                        <X className="w-3 h-3" /> Limpar seleção
                      </button>
                    )}
                  </div>
                )}

                {/* Search results */}
                {activeResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">{activeResults.length} resultado{activeResults.length !== 1 ? 's' : ''} encontrado{activeResults.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-40 overflow-y-auto">
                      {activeResults.map((r, i) => {
                        const alreadyAdded = leads.some(l => l.email.toLowerCase() === r.email.toLowerCase());
                        return (
                          <div key={i} className="flex items-center justify-between p-2.5 hover:bg-gray-50">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-900">{r.name}</p>
                              <p className="text-xs text-gray-500 truncate">{r.email} · <span className="text-forest">{r.source}</span></p>
                            </div>
                            <Button
                              size="sm" variant="outline"
                              className="h-6 text-xs shrink-0 ml-2 px-2"
                              disabled={alreadyAdded || addLead.isPending}
                              onClick={() => addLead.mutate({ name: r.name, email: r.email })}
                            >
                              {alreadyAdded ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Plus className="w-3 h-3" />}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {searchMode === 'text' && debouncedQuery.length > 1 && searchResults.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Nenhum resultado para "{debouncedQuery}"</p>
                )}
                {searchMode === 'course' && selectedCourseIds.length > 0 && !loadingCourseLeads && courseLeads.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Nenhum aluno matriculado nos cursos selecionados</p>
                )}
              </div>

              {/* Leads list */}
              <div className="flex-1 overflow-y-auto">
                {loadingLeads ? (
                  <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forest" /></div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-10 px-6">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-4 h-4 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">Nenhum lead nesta audiência</p>
                    <p className="text-xs text-gray-400 mt-1">Use a busca acima para adicionar.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {leads.map(l => (
                      <div key={l.id} className="flex items-center justify-between py-2.5 px-4 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-forest/10 flex items-center justify-center text-xs font-bold text-forest shrink-0">
                            {(l.name || l.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{l.name}</p>
                            <p className="text-xs text-gray-500 truncate">{l.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm" variant="ghost"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeLead.mutate(l.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Subscriptions Panel */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-gray-900">Notificações de Curso</CardTitle>
              <p className="text-xs text-gray-500">Leads que solicitaram avisos sobre novos cursos</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">{notificationSubs.length}</Badge>
        </CardHeader>
        <CardContent className="pt-0">
          {loadingNotifSubs ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-forest" /></div>
          ) : notificationSubs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">Nenhuma inscrição de notificação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {notificationSubs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{sub.name}</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-gray-500 truncate">{sub.email}</p>
                        {sub.createdAt && (
                          <p className="text-xs text-gray-400 shrink-0">· {new Date(sub.createdAt).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedAudienceId ? (
                    <Button
                      size="sm" variant="outline"
                      className="h-7 text-xs shrink-0 ml-2"
                      disabled={leads.some(l => l.email.toLowerCase() === sub.email.toLowerCase()) || addLead.isPending}
                      onClick={() => addLead.mutate({ name: sub.name, email: sub.email })}
                    >
                      {leads.some(l => l.email.toLowerCase() === sub.email.toLowerCase()) ? 'Adicionado' : 'Adicionar'}
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400 italic shrink-0">Selecione audiência</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Templates Studio Tab ─────────────────────────────────────────────────────

const templateFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  body: z.string().min(1, 'Corpo é obrigatório'),
  trigger: z.enum(EMAIL_TRIGGER_TYPES),
});
type TemplateFormData = z.infer<typeof templateFormSchema>;

function TemplatesTab({ adminToken }: { adminToken: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewMd, setPreviewMd] = useState('');
  const [preview, setPreview] = useState('');

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/marketing/templates'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/templates', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: { name: '', subject: '', body: '', trigger: 'manual' },
  });

  React.useEffect(() => {
    if (sheetOpen) {
      if (editingTemplate) {
        form.reset({ name: editingTemplate.name, subject: editingTemplate.subject, body: editingTemplate.body, trigger: (EMAIL_TRIGGER_TYPES as ReadonlyArray<string>).includes(editingTemplate.trigger) ? (editingTemplate.trigger as EmailTriggerType) : 'manual' });
        setPreviewMd(editingTemplate.body);
      } else {
        form.reset({ name: '', subject: '', body: '', trigger: 'manual' });
        setPreviewMd('');
        setPreview('');
      }
    }
  }, [sheetOpen, editingTemplate]);

  useEffect(() => {
    let cancelled = false;
    if (!previewMd) { setPreview(''); return; }
    import('marked').then(({ marked }) => {
      if (!cancelled) setPreview(marked.parse(previewMd) as string);
    });
    return () => { cancelled = true; };
  }, [previewMd]);

  const saveMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const url = editingTemplate ? `/api/marketing/templates/${editingTemplate.id}` : '/api/marketing/templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingTemplate ? 'Template atualizado!' : 'Template salvo!' });
      qc.invalidateQueries({ queryKey: ['/api/marketing/templates'] });
      setSheetOpen(false);
      setEditingTemplate(null);
    },
    onError: () => toast({ title: 'Erro ao salvar template', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketing/templates/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
    },
    onSuccess: () => {
      toast({ title: 'Template removido' });
      qc.invalidateQueries({ queryKey: ['/api/marketing/templates'] });
    },
    onError: () => toast({ title: 'Erro ao remover template', variant: 'destructive' }),
  });

  const handleOpen = (tpl?: EmailTemplate) => {
    setEditingTemplate(tpl ?? null);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Templates de E-mail (Markdown)</h2>
          <p className="text-sm text-gray-500">Escreva em Markdown e visualize em tempo real</p>
        </div>
        <Button className="bg-forest hover:bg-forest/90 text-white" onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Novo Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-2" />
          <p className="font-medium">Nenhum template criado</p>
          <p className="text-sm">Clique em "Novo Template" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map(tpl => (
            <Card key={tpl.id} className="border border-gray-200">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{tpl.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-2.5 h-2.5 mr-1" />
                      {TRIGGER_LABELS[tpl.trigger] ?? tpl.trigger}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{tpl.subject}</p>
                </div>
                <div className="flex gap-1 ml-4 shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50" onClick={() => handleOpen(tpl)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-50" onClick={() => deleteMutation.mutate(tpl.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={v => { if (!v) { setSheetOpen(false); setEditingTemplate(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-4xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-forest flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(d => saveMutation.mutate(d))} className="flex flex-col gap-4 h-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Template</FormLabel>
                      <FormControl><Input placeholder="Ex: Boas-vindas" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto do E-mail</FormLabel>
                      <FormControl><Input placeholder="Ex: Bem-vindo ao IDASAM!" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="trigger" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Gatilho</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMAIL_TRIGGER_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{TRIGGER_LABELS[t]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="body" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Markdown (editar aqui)</FormLabel>
                      <FormControl>
                        <Textarea
                          className="font-mono text-sm resize-none min-h-[360px]"
                          placeholder="# Olá {{nome}}!&#10;&#10;Seja bem-vindo ao curso **{{curso}}**."
                          {...field}
                          onChange={e => { field.onChange(e); setPreviewMd(e.target.value); }}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-400">Use &#123;&#123;nome&#125;&#125;, &#123;&#123;curso&#125;&#125; como variáveis</p>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview HTML</p>
                    <div
                      className="border border-gray-200 rounded-md p-4 overflow-y-auto text-sm leading-relaxed prose prose-sm max-w-none min-h-[360px] bg-white"
                      dangerouslySetInnerHTML={{ __html: preview || '<p class="text-gray-400">Nenhum conteúdo ainda...</p>' }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setSheetOpen(false); setEditingTemplate(null); }}>Cancelar</Button>
                  <Button type="submit" className="bg-forest hover:bg-forest/90 text-white" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Salvando...' : 'Salvar Template'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Custom HTML Templates Tab ────────────────────────────────────────────────

const htmlTemplateFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  htmlContent: z.string().min(1, 'Conteúdo HTML é obrigatório'),
  campaignIds: z.array(z.string()).optional().nullable(),
  triggerType: z.enum(EMAIL_TRIGGER_TYPES).optional(),
});
type HtmlTemplateFormData = z.infer<typeof htmlTemplateFormSchema>;

function HtmlTemplatesTab({ adminToken }: { adminToken: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<CustomHtmlTemplate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showEditorPreview, setShowEditorPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [quickPreviewTemplate, setQuickPreviewTemplate] = useState<CustomHtmlTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery<CustomHtmlTemplate[]>({
    queryKey: ['/api/marketing/html-templates'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/html-templates', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: campaigns = [] } = useQuery<{ id: string; audienceId: string; templateId: string | null; customHtmlTemplateId?: string | null; sentAt?: string | null; sentCount: number }[]>({
    queryKey: ['/api/marketing/campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/campaigns', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const form = useForm<HtmlTemplateFormData>({
    resolver: zodResolver(htmlTemplateFormSchema),
    defaultValues: { name: '', htmlContent: '', triggerType: 'manual' },
  });

  React.useEffect(() => {
    if (sheetOpen) {
      if (editingTemplate) {
        form.reset({
          name: editingTemplate.name,
          htmlContent: editingTemplate.htmlContent,
          campaignIds: editingTemplate.campaignIds ?? [],
          triggerType: (EMAIL_TRIGGER_TYPES as ReadonlyArray<string>).includes(editingTemplate.triggerType ?? '') ? (editingTemplate.triggerType as EmailTriggerType) : 'manual',
        });
        setPreviewHtml(editingTemplate.htmlContent);
        setSelectedCampaignIds(editingTemplate.campaignIds ?? []);
      } else {
        form.reset({ name: '', htmlContent: '', campaignIds: [], triggerType: 'manual' });
        setPreviewHtml('');
        setSelectedCampaignIds([]);
      }
      setShowEditorPreview(false);
    }
  }, [sheetOpen, editingTemplate]);

  const saveMutation = useMutation({
    mutationFn: async (data: HtmlTemplateFormData) => {
      const url = editingTemplate ? `/api/marketing/html-templates/${editingTemplate.id}` : '/api/marketing/html-templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ ...data, campaignIds: selectedCampaignIds }),
      });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingTemplate ? 'Template HTML atualizado!' : 'Template HTML salvo!' });
      qc.invalidateQueries({ queryKey: ['/api/marketing/html-templates'] });
      setSheetOpen(false);
      setEditingTemplate(null);
    },
    onError: () => toast({ title: 'Erro ao salvar template HTML', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketing/html-templates/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
    },
    onSuccess: () => {
      toast({ title: 'Template HTML removido' });
      qc.invalidateQueries({ queryKey: ['/api/marketing/html-templates'] });
    },
    onError: () => toast({ title: 'Erro ao remover template HTML', variant: 'destructive' }),
  });

  const handleOpen = (tpl?: CustomHtmlTemplate) => {
    setEditingTemplate(tpl ?? null);
    setSheetOpen(true);
  };

  const getUsageCount = (templateId: string) => {
    return campaigns.filter(c => c.customHtmlTemplateId === templateId).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">HTML Personalizado</h2>
          <p className="text-sm text-gray-500">Crie templates em HTML puro com preview ao vivo</p>
        </div>
        <Button className="bg-forest hover:bg-forest/90 text-white" onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Novo Template HTML
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Code2 className="w-10 h-10 mx-auto mb-2" />
          <p className="font-medium">Nenhum template HTML criado</p>
          <p className="text-sm">Clique em "Novo Template HTML" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map(tpl => {
            const usageCount = getUsageCount(tpl.id);
            const trigger: string = tpl.triggerType ?? 'manual';
            return (
              <Card key={tpl.id} className="border border-gray-200">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{tpl.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        <Code2 className="w-2.5 h-2.5 mr-1" />
                        HTML
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="w-2.5 h-2.5 mr-1" />
                        {TRIGGER_LABELS[trigger] ?? trigger}
                      </Badge>
                      {usageCount > 0 && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          {usageCount} campanha{usageCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {tpl.htmlContent.length} caracteres · criado em {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-4 shrink-0">
                    <Button
                      size="sm" variant="ghost"
                      className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                      title="Preview rápido"
                      onClick={() => setQuickPreviewTemplate(tpl)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50" onClick={() => handleOpen(tpl)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-50" onClick={() => deleteMutation.mutate(tpl.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Preview Modal */}
      <Dialog open={!!quickPreviewTemplate} onOpenChange={v => { if (!v) setQuickPreviewTemplate(null); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-forest">
              <Eye className="w-4 h-4" />
              Preview — {quickPreviewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0">
            {quickPreviewTemplate && (
              <iframe
                srcDoc={quickPreviewTemplate.htmlContent || '<p style="color:#aaa;padding:16px">Sem conteúdo</p>'}
                className="w-full h-full min-h-[500px]"
                sandbox="allow-same-origin"
                title="Preview HTML"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Sheet */}
      <Sheet open={sheetOpen} onOpenChange={v => { if (!v) { setSheetOpen(false); setEditingTemplate(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-5xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-4 border-b shrink-0">
            <SheetTitle className="text-forest flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              {editingTemplate ? 'Editar Template HTML' : 'Novo Template HTML'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(d => saveMutation.mutate(d))} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Template</FormLabel>
                      <FormControl><Input placeholder="Ex: Newsletter Março 2026" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="triggerType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Gatilho</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? 'manual'}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMAIL_TRIGGER_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{TRIGGER_LABELS[t]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Campanhas Associadas <span className="text-gray-400 font-normal text-xs">(opcional)</span></p>
                    {campaigns.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Nenhuma campanha criada ainda</p>
                    ) : (
                      <div className="max-h-24 overflow-y-auto space-y-1 border rounded-md p-2 bg-gray-50">
                        {campaigns.map(c => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-1 py-0.5">
                            <input
                              type="checkbox"
                              checked={selectedCampaignIds.includes(c.id)}
                              onChange={() => setSelectedCampaignIds(prev =>
                                prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                              )}
                              className="rounded text-forest"
                            />
                            <span className="text-xs text-gray-700">
                              {new Date(c.sentAt ?? '').toLocaleDateString('pt-BR')} — {c.sentCount} enviado{c.sentCount !== 1 ? 's' : ''}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button" size="sm"
                    variant={!showEditorPreview ? 'default' : 'outline'}
                    className={!showEditorPreview ? 'bg-forest hover:bg-forest/90 text-white' : ''}
                    onClick={() => setShowEditorPreview(false)}
                  >
                    <Code2 className="w-3 h-3 mr-1" /> Editor HTML
                  </Button>
                  <Button
                    type="button" size="sm"
                    variant={showEditorPreview ? 'default' : 'outline'}
                    className={showEditorPreview ? 'bg-forest hover:bg-forest/90 text-white' : ''}
                    onClick={() => setShowEditorPreview(true)}
                  >
                    <Eye className="w-3 h-3 mr-1" /> Preview
                  </Button>
                </div>

                <FormField control={form.control} name="htmlContent" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    {!showEditorPreview ? (
                      <>
                        <FormControl>
                          <Textarea
                            className="font-mono text-sm resize-none min-h-[400px]"
                            placeholder="<!DOCTYPE html><html>...</html>"
                            {...field}
                            onChange={e => { field.onChange(e); setPreviewHtml(e.target.value); }}
                          />
                        </FormControl>
                        <p className="text-xs text-gray-400">HTML puro — use &#123;&#123;nome&#125;&#125; e &#123;&#123;email&#125;&#125; como variáveis</p>
                      </>
                    ) : (
                      <div className="border border-gray-200 rounded-md overflow-hidden min-h-[400px] bg-white">
                        <iframe
                          srcDoc={previewHtml || field.value || '<p style="color:#aaa;padding:16px">Nenhum conteúdo ainda...</p>'}
                          className="w-full min-h-[400px]"
                          sandbox="allow-same-origin"
                          title="Preview HTML"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setSheetOpen(false); setEditingTemplate(null); }}>Cancelar</Button>
                  <Button type="submit" className="bg-forest hover:bg-forest/90 text-white" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Salvando...' : 'Salvar Template HTML'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Campaign Tab (Wizard) ────────────────────────────────────────────────────

interface EmailCampaignRecord {
  id: string;
  audienceId: string;
  templateId: string | null;
  customHtmlTemplateId?: string | null;
  sentAt: string | null;
  sentCount: number;
  errorCount: number;
  openCount: number;
  subject?: string | null;
}

type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS = [
  { id: 1, label: 'Audiência', icon: Users },
  { id: 2, label: 'Template', icon: FileText },
  { id: 3, label: 'Revisar', icon: Eye },
  { id: 4, label: 'Disparar', icon: Send },
];

function WizardProgress({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {WIZARD_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isDone ? 'bg-forest text-white' :
                isActive ? 'bg-forest text-white ring-4 ring-forest/20' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <p className={`text-xs font-medium ${isActive ? 'text-forest' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${step.id < currentStep ? 'bg-forest' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CampaignTab({ adminToken }: { adminToken: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [selectedAudienceId, setSelectedAudienceId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('__none_md__');
  const [selectedHtmlTemplateId, setSelectedHtmlTemplateId] = useState('__none__');
  const [manualSubject, setManualSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: audiences = [] } = useQuery<AudienceWithCount[]>({
    queryKey: ['/api/marketing/audiences'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/audiences', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/marketing/templates'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/templates', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: htmlTemplates = [] } = useQuery<CustomHtmlTemplate[]>({
    queryKey: ['/api/marketing/html-templates'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/html-templates', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: campaigns = [] } = useQuery<EmailCampaignRecord[]>({
    queryKey: ['/api/marketing/campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/campaigns', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketing/campaigns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
    },
    onSuccess: () => {
      toast({ title: 'Campanha removida' });
      qc.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
    },
    onError: () => toast({ title: 'Erro ao remover campanha', variant: 'destructive' }),
  });

  const selectedAudience = audiences.find(a => a.id === selectedAudienceId);
  const effectiveTemplateId = (selectedTemplateId && selectedTemplateId !== '__none_md__') ? selectedTemplateId : '';
  const selectedTemplate = templates.find(t => t.id === effectiveTemplateId);
  const effectiveHtmlTemplateId = selectedHtmlTemplateId === '__none__' ? null : selectedHtmlTemplateId;
  const selectedHtmlTemplate = htmlTemplates.find(t => t.id === effectiveHtmlTemplateId);

  const htmlIsSelected = !!effectiveHtmlTemplateId;
  const markdownOptional = htmlIsSelected;
  const needsManualSubject = htmlIsSelected && !effectiveTemplateId;
  const subjectFromTemplate = selectedTemplate?.subject ?? '';
  const effectiveSubject = needsManualSubject ? manualSubject : subjectFromTemplate;

  const step1Valid = !!selectedAudienceId && (selectedAudience?.leadCount ?? 0) > 0;
  const step2Valid = htmlIsSelected || !!effectiveTemplateId;
  const step3Valid = step2Valid && (!needsManualSubject || manualSubject.trim().length > 0);
  const canSend = step1Valid && step3Valid;

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedAudienceId('');
    setSelectedTemplateId('__none_md__');
    setSelectedHtmlTemplateId('__none__');
    setManualSubject('');
    setSent(false);
  };

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const res = await fetch('/api/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          audienceId: selectedAudienceId,
          templateId: effectiveTemplateId || null,
          customHtmlTemplateId: effectiveHtmlTemplateId,
          subject: needsManualSubject ? manualSubject : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ title: 'Erro ao disparar', description: result.message, variant: 'destructive' });
      } else {
        toast({ title: 'Campanha disparada!', description: `${result.sent} e-mail(s) enviados, ${result.failed} com falha.` });
        qc.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
        setSent(true);
      }
    } catch {
      toast({ title: 'Erro inesperado', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const audienceMap = Object.fromEntries(audiences.map(a => [a.id, a.name]));
  const templateMap = Object.fromEntries(templates.map(t => [t.id, t.name]));
  const htmlTemplateMap = Object.fromEntries(htmlTemplates.map(t => [t.id, t.name]));

  return (
    <div className="space-y-8">
      {/* Wizard */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <WizardProgress currentStep={wizardStep} />

          {/* Step 1: Audience */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Selecione a Audiência</h3>
                <p className="text-sm text-gray-500">Escolha quem receberá esta campanha</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {audiences.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhuma audiência disponível</p>
                  </div>
                ) : audiences.map(a => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAudienceId === a.id
                        ? 'border-forest bg-forest/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAudienceId(a.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          selectedAudienceId === a.id ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{a.name}</p>
                          <p className="text-xs text-gray-500">{a.leadCount} lead{a.leadCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {selectedAudienceId === a.id && <CheckCircle2 className="w-5 h-5 text-forest" />}
                    </div>
                  </div>
                ))}
              </div>
              {selectedAudienceId && (selectedAudience?.leadCount ?? 0) === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Esta audiência não tem leads. Adicione leads na aba Audiências.
                </p>
              )}
              <div className="flex justify-end pt-2">
                <Button
                  className="bg-forest hover:bg-forest/90 text-white"
                  disabled={!step1Valid}
                  onClick={() => setWizardStep(2)}
                >
                  Próximo <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Template */}
          {wizardStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Selecione o Template</h3>
                <p className="text-sm text-gray-500">Escolha um template Markdown, HTML personalizado ou ambos</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Template Markdown
                    {markdownOptional && <span className="text-gray-400 font-normal ml-1">(opcional — HTML selecionado)</span>}
                  </label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder={markdownOptional ? 'Opcional' : 'Selecione um template Markdown...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none_md__">Nenhum — usar somente HTML</SelectItem>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name} — {t.subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Template HTML <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <Select value={selectedHtmlTemplateId} onValueChange={v => {
                    setSelectedHtmlTemplateId(v);
                    if (v === '__none__') setManualSubject('');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sem template HTML" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum — usar corpo Markdown</SelectItem>
                      {htmlTemplates.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <Code2 className="w-3 h-3" />
                            {t.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {needsManualSubject && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Assunto do E-mail <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ex: Newsletter de Março — IDASAM"
                      value={manualSubject}
                      onChange={e => setManualSubject(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setWizardStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
                <Button
                  className="bg-forest hover:bg-forest/90 text-white"
                  disabled={!step2Valid || (needsManualSubject && !manualSubject.trim())}
                  onClick={() => setWizardStep(3)}
                >
                  Próximo <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {wizardStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Revisar Campanha</h3>
                <p className="text-sm text-gray-500">Confirme os detalhes antes de disparar</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-forest" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Audiência</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedAudience?.name}</p>
                  </div>
                  <Badge className="ml-auto bg-forest/10 text-forest border-0">{selectedAudience?.leadCount} destinatário{(selectedAudience?.leadCount ?? 0) !== 1 ? 's' : ''}</Badge>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Assunto</p>
                    <p className="text-sm font-semibold text-gray-900">{effectiveSubject || <span className="text-gray-400 italic text-sm">não definido</span>}</p>
                  </div>
                </div>
                {selectedTemplate && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Template Markdown</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedTemplate.name}</p>
                    </div>
                  </div>
                )}
                {selectedHtmlTemplate && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Template HTML</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedHtmlTemplate.name}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setWizardStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
                <Button
                  className="bg-forest hover:bg-forest/90 text-white"
                  onClick={() => setWizardStep(4)}
                >
                  Confirmar <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Send */}
          {wizardStep === 4 && (
            <div className="space-y-5">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Campanha Disparada!</h3>
                  <p className="text-sm text-gray-500 mb-6">Os e-mails foram enviados para {selectedAudience?.name}.</p>
                  <Button className="bg-forest hover:bg-forest/90 text-white" onClick={resetWizard}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Nova Campanha
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Pronto para Disparar</h3>
                    <p className="text-sm text-gray-500">Esta ação irá enviar e-mails para <strong>{selectedAudience?.leadCount}</strong> destinatário{(selectedAudience?.leadCount ?? 0) !== 1 ? 's' : ''}.</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-700">Esta ação não pode ser desfeita. Certifique-se de que as informações estão corretas antes de disparar.</p>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setWizardStep(3)} disabled={sending}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                    </Button>
                    <Button
                      className="bg-forest hover:bg-forest/90 text-white"
                      disabled={!canSend || sending}
                      onClick={handleSend}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Disparando...' : 'Disparar Campanha'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign history */}
      {campaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-800">Histórico de Campanhas</h3>
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Audiência</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Template</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">HTML</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Enviados</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Erros</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Aberturas</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...campaigns].reverse().map(c => (
                      <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{audienceMap[c.audienceId] ?? c.audienceId.slice(0, 8)}</td>
                        <td className="py-3 px-4">{c.templateId ? (templateMap[c.templateId] ?? c.templateId.slice(0, 8)) : <span className="text-gray-400 text-xs">—</span>}</td>
                        <td className="py-3 px-4">
                          {c.customHtmlTemplateId ? (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                              {htmlTemplateMap[c.customHtmlTemplateId] ?? 'HTML'}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{c.sentCount}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {(c.errorCount ?? 0) > 0 ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">{c.errorCount}</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">{c.openCount ?? 0}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{c.sentAt ? new Date(c.sentAt).toLocaleString('pt-BR') : '—'}</td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteCampaignMutation.mutate(c.id)}
                            disabled={deleteCampaignMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalSent: number;
  totalErrors: number;
  totalOpens: number;
  openRate: number;
  campaigns: EmailCampaignRecord[];
}

function AnalyticsTab({ adminToken }: { adminToken: string }) {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/marketing/analytics'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/analytics', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: audiences = [] } = useQuery<AudienceWithCount[]>({
    queryKey: ['/api/marketing/audiences'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/audiences', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: templates = [] } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/marketing/templates'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/templates', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const audienceMap = Object.fromEntries(audiences.map(a => [a.id, a.name]));
  const templateMap = Object.fromEntries(templates.map(t => [t.id, t.name]));

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" /></div>;
  }

  if (!analytics) {
    return <div className="text-center py-16 text-gray-400"><p>Erro ao carregar analytics</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Analytics de E-mail</h2>
        <p className="text-sm text-gray-500">Métricas globais e detalhadas por campanha</p>
      </div>

      {/* Global metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Enviados</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalSent.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Erros</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalErrors.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Aberturas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalOpens.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-forest" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Taxa de Abertura</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.openRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-campaign breakdown */}
      {analytics.campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          <BarChart3 className="w-10 h-10 mx-auto mb-2" />
          <p className="font-medium">Nenhuma campanha enviada ainda</p>
          <p className="text-sm">Dispare uma campanha para ver os analytics aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-800">Detalhamento por Campanha</h3>
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Audiência</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Assunto / Template</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Enviados</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Erros</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Aberturas</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...analytics.campaigns].reverse().map(c => {
                      const openRate = c.sentCount > 0
                        ? Math.round(((c.openCount ?? 0) / c.sentCount) * 100)
                        : 0;
                      const tplName = c.templateId ? (templateMap[c.templateId] ?? '—') : '—';
                      const displayLabel = c.subject ?? tplName;
                      return (
                        <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                            {c.sentAt ? new Date(c.sentAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="py-3 px-4 max-w-[140px] truncate">{audienceMap[c.audienceId] ?? c.audienceId.slice(0, 8)}</td>
                          <td className="py-3 px-4 max-w-[180px] truncate text-gray-700">{displayLabel}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{c.sentCount}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            {(c.errorCount ?? 0) > 0 ? (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">{c.errorCount}</Badge>
                            ) : (
                              <span className="text-gray-400 text-xs">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">{c.openCount ?? 0}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-semibold ${openRate >= 20 ? 'text-green-600' : openRate > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                              {openRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const { adminToken } = useAuth();

  const { data: audiences = [] } = useQuery<AudienceWithCount[]>({
    queryKey: ['/api/marketing/audiences'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/audiences', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: campaigns = [] } = useQuery<EmailCampaignRecord[]>({
    queryKey: ['/api/marketing/campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/campaigns', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const { data: notificationSubs = [] } = useQuery<CourseNotificationSubscription[]>({
    queryKey: ['/api/marketing/notification-subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/notification-subscriptions', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error('Erro');
      return res.json();
    },
    enabled: !!adminToken,
  });

  if (!adminToken) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500">Sessão administrativa necessária. Faça login novamente.</p>
      </div>
    );
  }

  const totalLeads = audiences.reduce((sum, a) => sum + a.leadCount, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + (c.openCount ?? 0), 0);
  const openRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-forest/10 rounded-xl">
            <Mail className="w-6 h-6 text-forest" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">E-mail Marketing</h1>
            <p className="text-gray-500 text-sm">Gerencie audiências, templates e campanhas</p>
          </div>
        </div>
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-400" />
          {notificationSubs.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
              {notificationSubs.length > 99 ? '99+' : notificationSubs.length}
            </span>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-forest" />
              </div>
              <Badge variant="secondary" className="text-xs font-normal">{audiences.length} audiência{audiences.length !== 1 ? 's' : ''}</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalLeads.toLocaleString('pt-BR')}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total de Leads</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-xs font-normal">{campaigns.length} campanha{campaigns.length !== 1 ? 's' : ''}</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSent.toLocaleString('pt-BR')}</p>
            <p className="text-sm text-gray-500 mt-0.5">E-mails Enviados</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <Badge variant="secondary" className="text-xs font-normal">{totalOpens} abertura{totalOpens !== 1 ? 's' : ''}</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{openRate}%</p>
            <p className="text-sm text-gray-500 mt-0.5">Taxa de Abertura Média</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audiencias">
        <TabsList className="mb-4 bg-gray-100 p-1 rounded-lg gap-0.5">
          <TabsTrigger value="audiencias" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <Users className="w-3.5 h-3.5" /> Audiências
          </TabsTrigger>
          <TabsTrigger value="studio" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <FileText className="w-3.5 h-3.5" /> Estúdio
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <Code2 className="w-3.5 h-3.5" /> HTML
          </TabsTrigger>
          <TabsTrigger value="campanha" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <Send className="w-3.5 h-3.5" /> Disparar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="audiencias">
          <AudiencesTab adminToken={adminToken} />
        </TabsContent>
        <TabsContent value="studio">
          <TemplatesTab adminToken={adminToken} />
        </TabsContent>
        <TabsContent value="html">
          <HtmlTemplatesTab adminToken={adminToken} />
        </TabsContent>
        <TabsContent value="campanha">
          <CampaignTab adminToken={adminToken} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab adminToken={adminToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
