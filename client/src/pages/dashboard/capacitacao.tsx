import React, { useState } from 'react';
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
  Plus, Pencil, Trash2, BookOpen,
} from 'lucide-react';
import type { Course, Enrollment } from '@shared/schema';

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

  return (
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
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4">{e.fullName}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{e.cpf}</td>
                      <td className="py-2 pr-4">{e.email}</td>
                      <td className="py-2 pr-4">{e.phone}</td>
                      <td className="py-2">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
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

export default function DashboardCapacitacao() {
  const { adminToken } = useAuth();
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
        <Button
          className="bg-forest hover:bg-forest/90 text-white"
          onClick={() => { setEditingCourse(null); setFormOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Curso
        </Button>
      </div>

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
