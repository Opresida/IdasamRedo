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
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Mail, Users, Pencil, Trash2, Plus, Send, Search, X, FileText, Zap } from 'lucide-react';
import type { EmailAudience, AudienceLead, EmailTemplate } from '@shared/schema';
import { EMAIL_TRIGGER_TYPES } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

type AudienceWithCount = EmailAudience & { leadCount: number };

const TRIGGER_LABELS: Record<string, string> = {
  manual: 'Manual',
  course_signup: 'Matrícula em Curso',
  certificate_ready: 'Certificado Emitido',
  course_notification: 'Notificação de Curso',
};

// ─── Audiences Tab ────────────────────────────────────────────────────────────

function AudiencesTab({ adminToken }: { adminToken: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedAudienceId, setSelectedAudienceId] = useState<string | null>(null);
  const [createName, setCreateName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
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
    enabled: debouncedQuery.length > 1 && !!adminToken,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Audience list + create */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nome da nova audiência..."
            value={createName}
            onChange={e => setCreateName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && createName.trim()) createAudience.mutate(); }}
          />
          <Button
            className="bg-forest hover:bg-forest/90 text-white shrink-0"
            disabled={!createName.trim() || createAudience.isPending}
            onClick={() => createAudience.mutate()}
          >
            <Plus className="w-4 h-4 mr-1" /> Criar
          </Button>
        </div>

        {loadingAudiences ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" /></div>
        ) : audiences.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Nenhuma audiência criada</p>
            <p className="text-sm">Crie uma audiência para começar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {audiences.map(a => (
              <div
                key={a.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedAudienceId === a.id ? 'border-forest bg-forest/5' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setSelectedAudienceId(a.id)}
              >
                <div>
                  <p className="font-medium text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.leadCount} lead{a.leadCount !== 1 ? 's' : ''}</p>
                </div>
                <Button
                  size="sm" variant="ghost"
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={e => { e.stopPropagation(); deleteAudience.mutate(a.id); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Leads for selected audience */}
      <div className="space-y-4">
        {!selectedAudience ? (
          <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <Users className="w-10 h-10 mx-auto mb-2" />
            <p className="font-medium">Selecione uma audiência</p>
            <p className="text-sm">para gerenciar seus leads</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{selectedAudience.name}</h3>
              <p className="text-sm text-gray-500">Busque e adicione leads de matrículas e notificações</p>
            </div>

            {/* Search leads */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {debouncedQuery.length > 1 && (
              <Card className="border border-gray-200">
                <CardContent className="p-2">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-gray-400 p-2">Nenhum resultado encontrado</p>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((r, i) => {
                        const alreadyAdded = leads.some(l => l.email.toLowerCase() === r.email.toLowerCase());
                        return (
                          <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                            <div>
                              <p className="text-sm font-medium">{r.name}</p>
                              <p className="text-xs text-gray-500">{r.email} · <span className="text-forest">{r.source}</span></p>
                            </div>
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs"
                              disabled={alreadyAdded || addLead.isPending}
                              onClick={() => addLead.mutate({ name: r.name, email: r.email })}
                            >
                              {alreadyAdded ? 'Adicionado' : 'Adicionar'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Leads list */}
            {loadingLeads ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" /></div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Nenhum lead na audiência. Use a busca acima.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {leads.map(l => (
                  <div key={l.id} className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 border border-transparent hover:border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{l.name}</p>
                      <p className="text-xs text-gray-500">{l.email}</p>
                    </div>
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                      onClick={() => removeLead.mutate(l.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
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
  const [dialogOpen, setDialogOpen] = useState(false);
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
    if (dialogOpen) {
      if (editingTemplate) {
        form.reset({ name: editingTemplate.name, subject: editingTemplate.subject, body: editingTemplate.body, trigger: editingTemplate.trigger as typeof EMAIL_TRIGGER_TYPES[number] });
        setPreviewMd(editingTemplate.body);
      } else {
        form.reset({ name: '', subject: '', body: '', trigger: 'manual' });
        setPreviewMd('');
        setPreview('');
      }
    }
  }, [dialogOpen, editingTemplate]);

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
      setDialogOpen(false);
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
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Templates de E-mail</h2>
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

      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) { setDialogOpen(false); setEditingTemplate(null); } }}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-forest flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(d => saveMutation.mutate(d))} className="flex flex-col flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                <FormField control={form.control} name="body" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Markdown (editar aqui)</FormLabel>
                    <FormControl>
                      <Textarea
                        className="flex-1 font-mono text-sm resize-none min-h-[300px]"
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
                    className="flex-1 border border-gray-200 rounded-md p-4 overflow-y-auto text-sm leading-relaxed prose prose-sm max-w-none min-h-[300px] bg-white"
                    dangerouslySetInnerHTML={{ __html: preview || '<p class="text-gray-400">Nenhum conteúdo ainda...</p>' }}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingTemplate(null); }}>Cancelar</Button>
                <Button type="submit" className="bg-forest hover:bg-forest/90 text-white" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar Template'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Campaign Tab ─────────────────────────────────────────────────────────────

interface EmailCampaignRecord {
  id: string;
  audienceId: string;
  templateId: string;
  sentAt: string | null;
  sentCount: number;
}

function CampaignTab({ adminToken }: { adminToken: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedAudienceId, setSelectedAudienceId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sending, setSending] = useState(false);

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
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleSend = async () => {
    if (!selectedAudienceId || !selectedTemplateId) return;
    setSending(true);
    try {
      const res = await fetch('/api/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ audienceId: selectedAudienceId, templateId: selectedTemplateId }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ title: 'Erro ao disparar', description: result.message, variant: 'destructive' });
      } else {
        toast({ title: 'Campanha disparada!', description: `${result.sent} e-mail(s) enviados, ${result.failed} com falha.` });
        qc.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      }
    } catch {
      toast({ title: 'Erro inesperado', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const audienceMap = Object.fromEntries(audiences.map(a => [a.id, a.name]));
  const templateMap = Object.fromEntries(templates.map(t => [t.id, t.name]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Disparar Campanha</h2>
        <p className="text-sm text-gray-500">Selecione uma audiência e um template para enviar a campanha.</p>
      </div>

      <Card className="border border-gray-200 max-w-xl">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Audiência</label>
            <Select value={selectedAudienceId} onValueChange={setSelectedAudienceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma audiência..." />
              </SelectTrigger>
              <SelectContent>
                {audiences.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name} ({a.leadCount} leads)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Template</label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name} — {t.subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAudience && selectedTemplate && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1 border">
              <p><span className="text-gray-500">Audiência:</span> <strong>{selectedAudience.name}</strong> ({selectedAudience.leadCount} destinatário{selectedAudience.leadCount !== 1 ? 's' : ''})</p>
              <p><span className="text-gray-500">Template:</span> <strong>{selectedTemplate.name}</strong></p>
              <p><span className="text-gray-500">Assunto:</span> {selectedTemplate.subject}</p>
            </div>
          )}

          <Button
            className="w-full bg-forest hover:bg-forest/90 text-white"
            disabled={!selectedAudienceId || !selectedTemplateId || sending || (selectedAudience?.leadCount ?? 0) === 0}
            onClick={handleSend}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Disparando...' : 'Disparar Campanha'}
          </Button>
        </CardContent>
      </Card>

      {campaigns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-800">Histórico de Campanhas</h3>
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Audiência</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Template</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Enviados</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...campaigns].reverse().map(c => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">{audienceMap[c.audienceId] ?? c.audienceId.slice(0, 8)}</td>
                      <td className="py-3 px-4">{templateMap[c.templateId] ?? c.templateId.slice(0, 8)}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{c.sentCount} enviado{c.sentCount !== 1 ? 's' : ''}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{c.sentAt ? new Date(c.sentAt).toLocaleString('pt-BR') : '—'}</td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
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

  if (!adminToken) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500">Sessão administrativa necessária. Faça login novamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <Mail className="w-6 h-6 text-forest" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-mail Marketing</h1>
          <p className="text-gray-600">Gerencie audiências, templates e campanhas de e-mail</p>
        </div>
      </div>

      <Tabs defaultValue="audiencias">
        <TabsList className="mb-4">
          <TabsTrigger value="audiencias" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Audiências
          </TabsTrigger>
          <TabsTrigger value="studio" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Estúdio de Templates
          </TabsTrigger>
          <TabsTrigger value="campanha" className="flex items-center gap-2">
            <Send className="w-4 h-4" /> Disparar Campanha
          </TabsTrigger>
        </TabsList>
        <TabsContent value="audiencias">
          <AudiencesTab adminToken={adminToken} />
        </TabsContent>
        <TabsContent value="studio">
          <TemplatesTab adminToken={adminToken} />
        </TabsContent>
        <TabsContent value="campanha">
          <CampaignTab adminToken={adminToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
