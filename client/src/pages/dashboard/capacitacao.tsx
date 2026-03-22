import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  GraduationCap, Upload, Users, ChevronDown, ChevronUp,
  Plus, Pencil, Trash2, BookOpen, FileDown, FileUp, UserPlus, Clipboard, Check, Bell,
} from 'lucide-react';
import type { Course, Enrollment, CourseNotificationSubscription } from '@shared/schema';

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface EnrollmentWithCert extends Enrollment {
  hasCertificate: boolean;
}

const courseFormSchema = z.object({
  title: z.string().min(3, 'Título é obrigatório'),
  description: z.string().min(10, 'Descrição é obrigatória'),
  instructor: z.string().min(3, 'Professor é obrigatório'),
  workload: z.coerce.number().int().positive('Carga horária inválida'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  location: z.string().min(3, 'Local é obrigatório'),
  schedule: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  curriculum: z.string().optional().nullable(),
  vacancies: z.coerce.number().int().positive().optional().nullable(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

const defaultValues: CourseFormData = {
  title: '',
  description: '',
  instructor: '',
  workload: 20,
  startDate: '',
  endDate: '',
  location: 'Manaus – AM (Presencial)',
  schedule: '',
  address: '',
  curriculum: '',
  vacancies: null,
};

function courseToFormData(course: Course): CourseFormData {
  return {
    title: course.title,
    description: course.description,
    instructor: course.instructor,
    workload: course.workload,
    startDate: course.startDate,
    endDate: course.endDate,
    location: course.location,
    schedule: course.schedule ?? '',
    address: course.address ?? '',
    curriculum: course.curriculum ?? '',
    vacancies: course.vacancies ?? null,
  };
}

async function fetchEnrollmentsWithCerts(courseId: string, token: string): Promise<EnrollmentWithCert[]> {
  const res = await fetch(`/api/enrollments/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

const enrollmentFormSchema = z.object({
  fullName: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

type EnrollmentFormData = z.infer<typeof enrollmentFormSchema>;

function EnrollmentFormDialog({
  open,
  onClose,
  courseId,
  adminToken,
  editingEnrollment,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  adminToken: string;
  editingEnrollment: EnrollmentWithCert | null;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const isEditing = !!editingEnrollment;

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: { fullName: '', cpf: '', phone: '', email: '' },
  });

  React.useEffect(() => {
    if (open) {
      if (editingEnrollment) {
        form.reset({
          fullName: editingEnrollment.fullName,
          cpf: editingEnrollment.cpf,
          phone: editingEnrollment.phone,
          email: editingEnrollment.email,
        });
      } else {
        form.reset({ fullName: '', cpf: '', phone: '', email: '' });
      }
    }
  }, [open, editingEnrollment]);

  const mutation = useMutation({
    mutationFn: async (data: EnrollmentFormData) => {
      const url = isEditing ? `/api/enrollments/${editingEnrollment!.id}` : '/api/enrollments';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? data : { ...data, courseId };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: isEditing ? 'Aluno atualizado!' : 'Aluno adicionado!', description: isEditing ? 'Os dados foram salvos.' : 'O aluno foi inscrito no curso.' });
      qc.invalidateQueries({ queryKey: ['/api/enrollments/course', courseId] });
      onClose();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível salvar o aluno.', variant: 'destructive' });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-forest flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {isEditing ? 'Editar Aluno' : 'Adicionar Aluno'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl><Input placeholder="Nome do aluno" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="cpf" render={({ field }) => (
              <FormItem>
                <FormLabel>CPF *</FormLabel>
                <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl><Input placeholder="(92) 99999-9999" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail *</FormLabel>
                <FormControl><Input type="email" placeholder="aluno@email.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-forest hover:bg-forest/90 text-white" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteEnrollmentDialog({
  enrollment,
  courseId,
  adminToken,
  onClose,
}: {
  enrollment: EnrollmentWithCert | null;
  courseId: string;
  adminToken: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/enrollments/${enrollment!.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error('Falha ao excluir');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Aluno excluído', description: `"${enrollment?.fullName}" foi removido.` });
      qc.invalidateQueries({ queryKey: ['/api/enrollments/course', courseId] });
      onClose();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível excluir o aluno.', variant: 'destructive' });
    },
  });

  return (
    <Dialog open={!!enrollment} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Excluir Aluno
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-700">
          Tem certeza que deseja excluir o aluno{' '}
          <span className="font-semibold">"{enrollment?.fullName}"</span>?
          Esta ação não pode ser desfeita.
        </p>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Excluindo...' : 'Excluir Aluno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CourseEnrollments({ course, adminToken, onEdit, onDelete }: {
  course: Course;
  adminToken: string;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentWithCert | null>(null);
  const [deletingEnrollment, setDeletingEnrollment] = useState<EnrollmentWithCert | null>(null);
  const [importing, setImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const { data: enrollments = [], isLoading } = useQuery<EnrollmentWithCert[]>({
    queryKey: ['/api/enrollments/course', course.id],
    queryFn: () => fetchEnrollmentsWithCerts(course.id, adminToken),
    enabled: open && !!adminToken,
  });

  const handleUpload = async (enrollmentId: string, file: File) => {
    setUploadingId(enrollmentId);
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      const res = await fetch(`/api/certificates/upload/${enrollmentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      toast({ title: 'Certificado enviado!', description: 'PDF carregado com sucesso.' });
      qc.invalidateQueries({ queryKey: ['/api/enrollments/course', course.id] });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao enviar o certificado.', variant: 'destructive' });
    } finally {
      setUploadingId(null);
    }
  };

  const handleExportCSV = () => {
    const rows = [['nome', 'cpf', 'telefone', 'email']];
    for (const e of enrollments) {
      rows.push([e.fullName, e.cpf, e.phone, e.email]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscritos-${course.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exportado!', description: `${enrollments.length} inscritos exportados.` });
  };

  const handleImportCSV = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast({ title: 'Arquivo inválido', description: 'O CSV deve ter cabeçalho e ao menos uma linha de dados.', variant: 'destructive' });
        return;
      }
      const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const nameIdx = header.indexOf('nome');
      const cpfIdx = header.indexOf('cpf');
      const phoneIdx = header.indexOf('telefone');
      const emailIdx = header.indexOf('email');
      if (nameIdx < 0 && cpfIdx < 0 && phoneIdx < 0 && emailIdx < 0) {
        toast({ title: 'Colunas inválidas', description: 'O CSV deve ter ao menos uma das colunas: nome, cpf, telefone, email.', variant: 'destructive' });
        return;
      }
      const records = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        return {
          fullName: nameIdx >= 0 ? (cols[nameIdx] ?? '') : '',
          cpf: cpfIdx >= 0 ? (cols[cpfIdx] ?? '') : '',
          phone: phoneIdx >= 0 ? (cols[phoneIdx] ?? '') : '',
          email: emailIdx >= 0 ? (cols[emailIdx] ?? '') : '',
        };
      }).filter((r) => r.fullName || r.cpf || r.email || r.phone);

      const res = await fetch('/api/enrollments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ courseId: course.id, records }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ title: 'Erro na importação', description: result.message || 'Falha ao importar.', variant: 'destructive' });
        return;
      }
      qc.invalidateQueries({ queryKey: ['/api/enrollments/course', course.id] });
      const errMsg = result.errors?.length ? ` (${result.errors.length} linha(s) com erro)` : '';
      toast({ title: 'Importação concluída!', description: `${result.created} aluno(s) adicionado(s)${errMsg}.` });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao processar o arquivo CSV.', variant: 'destructive' });
    } finally {
      setImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  return (
    <>
      <Card className="border border-gray-200">
        <CardHeader className="cursor-pointer select-none" onClick={() => setOpen((v) => !v)}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-forest">{course.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {course.instructor} • {course.workload}h
                {course.schedule ? ` • ${course.schedule}` : ''}
                {' '}• {course.startDate} – {course.endDate}
              </p>
              {course.address && (
                <p className="text-xs text-gray-400 mt-0.5">{course.address}</p>
              )}
              {course.authCode && (
                <div className="flex items-center gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-gray-400">Cód. auth:</span>
                  <code className="text-xs font-mono text-forest bg-forest/8 border border-forest/20 px-1.5 py-0.5 rounded">{course.authCode}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-gray-400 hover:text-forest"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(course.authCode!);
                      toast({ title: 'Copiado!', description: 'Código de autenticação copiado.' });
                    }}
                  >
                    <Clipboard className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {open && !isLoading && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {enrollments.length} inscritos
                </Badge>
              )}
              {course.vacancies && (
                <Badge variant="outline" className="text-xs">
                  {course.vacancies} vagas
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={(e) => { e.stopPropagation(); onEdit(course); }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => { e.stopPropagation(); onDelete(course); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </CardHeader>

        {open && (
          <CardContent>
            {course.curriculum && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">Ementa / Conteúdo Programático</p>
                <p className="whitespace-pre-line">{course.curriculum}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setAddingStudent(true)}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Adicionar aluno
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={importing}
                onClick={() => csvInputRef.current?.click()}
              >
                <FileUp className="w-3 h-3 mr-1" />
                {importing ? 'Importando...' : 'Importar CSV'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={enrollments.length === 0}
                onClick={handleExportCSV}
              >
                <FileDown className="w-3 h-3 mr-1" />
                Exportar CSV
              </Button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportCSV(file);
                }}
              />
            </div>

            {isLoading ? (
              <div className="py-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" />
              </div>
            ) : enrollments.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Nenhuma inscrição neste curso.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 font-medium text-gray-600">Nome</th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-600">CPF</th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-600">E-mail</th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-600">Telefone</th>
                      <th className="text-left py-2 font-medium text-gray-600">Certificado</th>
                      <th className="text-left py-2 font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-4">{e.fullName}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{e.cpf}</td>
                        <td className="py-2 pr-4">{e.email}</td>
                        <td className="py-2 pr-4">{e.phone}</td>
                        <td className="py-2 pr-4">
                          {e.hasCertificate ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Enviado</Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs text-gray-400">Pendente</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                disabled={uploadingId === e.id}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'application/pdf';
                                  input.onchange = (ev) => {
                                    const file = (ev.target as HTMLInputElement).files?.[0];
                                    if (file) handleUpload(e.id, file);
                                  };
                                  input.click();
                                }}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                {uploadingId === e.id ? 'Enviando...' : 'PDF'}
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              onClick={() => setEditingEnrollment(e)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeletingEnrollment(e)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <EnrollmentFormDialog
        open={addingStudent || !!editingEnrollment}
        onClose={() => { setAddingStudent(false); setEditingEnrollment(null); }}
        courseId={course.id}
        adminToken={adminToken}
        editingEnrollment={editingEnrollment}
      />

      <DeleteEnrollmentDialog
        enrollment={deletingEnrollment}
        courseId={course.id}
        adminToken={adminToken}
        onClose={() => setDeletingEnrollment(null)}
      />
    </>
  );
}

function CourseFormDialog({
  open,
  onClose,
  editingCourse,
  adminToken,
}: {
  open: boolean;
  onClose: () => void;
  editingCourse: Course | null;
  adminToken: string;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { logout } = useAuth();
  const isEditing = !!editingCourse;

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: editingCourse ? courseToFormData(editingCourse) : defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(editingCourse ? courseToFormData(editingCourse) : defaultValues);
    }
  }, [open, editingCourse]);

  const mutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const clean = {
        ...data,
        schedule: data.schedule || null,
        address: data.address || null,
        curriculum: data.curriculum || null,
        vacancies: data.vacancies || null,
      };
      const url = isEditing ? `/api/courses/${editingCourse!.id}` : '/api/courses';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(clean),
      });
      if (res.status === 401) {
        throw new HttpError('Sessão expirada', 401);
      }
      if (!res.ok) throw new HttpError('Falha ao salvar', res.status);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'Curso atualizado!' : 'Curso criado!',
        description: isEditing ? 'As informações foram salvas.' : 'O novo curso foi adicionado.',
      });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      onClose();
    },
    onError: (err: Error) => {
      if (err instanceof HttpError && err.status === 401) {
        toast({ title: 'Sessão expirada', description: 'Faça login novamente para continuar.', variant: 'destructive' });
        logout();
      } else {
        toast({ title: 'Erro', description: 'Não foi possível salvar o curso.', variant: 'destructive' });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-forest flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {isEditing ? 'Editar Curso' : 'Novo Curso'}
          </DialogTitle>
        </DialogHeader>

        {isEditing && editingCourse?.authCode && (
          <div className="flex items-center gap-2 px-1 py-2 bg-forest/5 border border-forest/20 rounded-lg mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Código de Autenticação (somente leitura)</p>
              <code className="text-sm font-mono font-semibold text-forest">{editingCourse.authCode}</code>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-forest shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(editingCourse!.authCode!);
                toast({ title: 'Copiado!', description: 'Código de autenticação copiado.' });
              }}
            >
              <Clipboard className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Título do Curso *</FormLabel>
                  <FormControl><Input placeholder="Ex: Aplicação de IA em ambientes Industriais" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl><Textarea placeholder="Breve descrição do curso..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="instructor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Professor(a) *</FormLabel>
                  <FormControl><Input placeholder="Prof. Nome Sobrenome" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="workload" render={({ field }) => (
                <FormItem>
                  <FormLabel>Carga Horária (h) *</FormLabel>
                  <FormControl><Input type="number" min={1} placeholder="20" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Término *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="schedule" render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <FormControl><Input placeholder="Ex: Seg a Sex, 19h–22h" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="vacancies" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vagas Disponíveis</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Ex: 30"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Local (Resumido) *</FormLabel>
                  <FormControl><Input placeholder="Ex: Manaus – AM (Presencial)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl><Input placeholder="Ex: Rua das Flores, 123 – Centro, Manaus – AM" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="curriculum" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Ementa / Conteúdo Programático</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste os tópicos que serão abordados no curso..."
                      rows={5}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-forest hover:bg-forest/90 text-white" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Curso'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCourseDialog({
  course,
  adminToken,
  onClose,
}: {
  course: Course | null;
  adminToken: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { logout } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${course!.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        throw new HttpError('Sessão expirada', 401);
      }
      if (!res.ok) throw new HttpError('Falha ao excluir', res.status);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Curso excluído', description: `"${course?.title}" foi removido.` });
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      onClose();
    },
    onError: (err: Error) => {
      if (err instanceof HttpError && err.status === 401) {
        toast({ title: 'Sessão expirada', description: 'Faça login novamente para continuar.', variant: 'destructive' });
        logout();
      } else {
        toast({ title: 'Erro', description: 'Não foi possível excluir o curso.', variant: 'destructive' });
      }
    },
  });

  return (
    <Dialog open={!!course} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Excluir Curso
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-700">
          Tem certeza que deseja excluir o curso{' '}
          <span className="font-semibold">"{course?.title}"</span>?
          Esta ação não pode ser desfeita e todas as inscrições vinculadas serão afetadas.
        </p>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Excluindo...' : 'Excluir Curso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NotificationsTab({ adminToken }: { adminToken: string }) {
  const { data: subs = [], isLoading } = useQuery<CourseNotificationSubscription[]>({
    queryKey: ['/api/course-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/course-notifications', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error('Erro ao buscar notificações');
      return res.json();
    },
    enabled: !!adminToken,
  });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inscrições de Notificação</h2>
          <p className="text-sm text-gray-500">Usuários que solicitaram ser notificados sobre novos cursos.</p>
        </div>
        {!isLoading && (
          <Badge variant="secondary" className="text-xs">
            <Bell className="w-3 h-3 mr-1" />
            {subs.length} inscrito{subs.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest" />
        </div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Nenhuma inscrição de notificação ainda</p>
          <p className="text-sm mt-1">As inscrições feitas na página /capacitacao aparecerão aqui.</p>
        </div>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">E-mail</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data de inscrição</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 last:border-0">
                      <td className="py-3 px-4 font-medium text-gray-900">{sub.name}</td>
                      <td className="py-3 px-4 text-gray-600">{sub.email}</td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(sub.createdAt?.toString())}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DashboardCapacitacao() {
  const { adminToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'cursos' | 'notificacoes'>('cursos');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  if (!adminToken) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500">Sessão administrativa necessária. Faça login novamente.</p>
      </div>
    );
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <GraduationCap className="w-6 h-6 text-forest" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Capacitação</h1>
            <p className="text-gray-600">Gerencie cursos, inscrições e certificados IDASAM 2026</p>
          </div>
        </div>
        {activeTab === 'cursos' && (
          <Button
            className="bg-forest hover:bg-forest/90 text-white"
            onClick={() => { setEditingCourse(null); setFormOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('cursos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cursos'
              ? 'border-forest text-forest'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Cursos
        </button>
        <button
          onClick={() => setActiveTab('notificacoes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'notificacoes'
              ? 'border-forest text-forest'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notificações
        </button>
      </div>

      {activeTab === 'cursos' ? (
        <>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Nenhum curso cadastrado</p>
              <p className="text-sm mt-1">Clique em "Novo Curso" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseEnrollments
                  key={course.id}
                  course={course}
                  adminToken={adminToken}
                  onEdit={handleEdit}
                  onDelete={setDeletingCourse}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <NotificationsTab adminToken={adminToken} />
      )}

      <CourseFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        editingCourse={editingCourse}
        adminToken={adminToken}
      />

      <DeleteCourseDialog
        course={deletingCourse}
        adminToken={adminToken}
        onClose={() => setDeletingCourse(null)}
      />
    </div>
  );
}
