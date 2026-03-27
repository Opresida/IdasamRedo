import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFPageProxy } from 'pdfjs-dist';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import {
  GraduationCap, Upload, Users, ChevronDown, ChevronUp,
  Plus, Pencil, Trash2, BookOpen, FileDown, FileUp, UserPlus, Clipboard, Check, Bell, Eye,
  AlignLeft, AlignCenter, AlignRight, Search,
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Progress } from '@/components/ui/progress';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Course, Enrollment, CourseNotificationSubscription } from '@shared/schema';
import { COURSE_STATUSES } from '@shared/schema';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  status: z.enum(COURSE_STATUSES).default('open'),
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
  status: 'open',
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
    status: (course.status as typeof COURSE_STATUSES[number]) ?? 'open',
  };
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  closed: 'Fechado',
  coming_soon: 'Em Breve',
  completed: 'Concluído',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  open: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
  coming_soon: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
};

async function fetchEnrollmentsWithCerts(courseId: string, token: string): Promise<EnrollmentWithCert[]> {
  const res = await fetch(`/api/enrollments/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

type BlockKey = 'aluno';

interface TextBlock {
  key: BlockKey;
  label: string;
  text: string;
  pctX: number;
  pctY: number;
  baseSize: number;
  font: 'poppins' | 'alexbrush';
  bold: boolean;
  italic: boolean;
  page: 1 | 2;
  align: 'left' | 'center' | 'right';
}

const EXAMPLE_VALUES: Record<string, string> = {
  aluno: 'Nome de Exemplo',
};

const DEFAULT_BLOCKS: TextBlock[] = [
  { key: 'aluno', label: 'Nome do Aluno', text: '{aluno}', pctX: 0.5, pctY: 0.5, baseSize: 24, font: 'alexbrush', bold: false, italic: false, page: 1, align: 'left' },
];

function parseVariables(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

const FONT_URLS = {
  alexbrushRegular: '/fonts/alexbrush.ttf',
  poppinsRegular: '/fonts/poppins-regular.ttf',
};

async function generateCertificatePdf(
  templateBytes: ArrayBuffer,
  block: TextBlock,
  studentName: string,
  alexBrushBytes: ArrayBuffer,
  poppinsBytes: ArrayBuffer,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const fAlexBrush = await pdfDoc.embedFont(alexBrushBytes);
  const fPoppins = await pdfDoc.embedFont(poppinsBytes);
  const embedFont = block.font === 'alexbrush' ? fAlexBrush : fPoppins;
  const realValues: Record<string, string> = {
    aluno: studentName || 'Nome do Aluno',
    curso: 'Curso',
    carga: '—',
    data: new Date().toLocaleDateString('pt-BR'),
  };
  const pages = pdfDoc.getPages();
  const pageIndex = block.page - 1;
  const page = pages[pageIndex] ?? pages[0];
  const { width: pdfWidth, height: pdfHeight } = page.getSize();

  const safePctX = isFinite(block.pctX) ? Math.max(0, Math.min(1, block.pctX)) : 0.5;
  const safePctY = isFinite(block.pctY) ? Math.max(0, Math.min(1, block.pctY)) : 0.5;
  const safeSize = isFinite(block.baseSize) && block.baseSize > 0 ? block.baseSize : 24;
  const align = block.align ?? 'left';

  const finalX = safePctX * pdfWidth;
  const finalY = pdfHeight - (safePctY * pdfHeight) - (safeSize * 0.8);
  const maxWidth = pdfWidth * 0.8;

  let resolvedText = parseVariables(block.text, realValues);
  resolvedText = resolvedText.replace(/\{\s*aluno\s*\}/gi, studentName || 'Nome do Aluno');
  resolvedText = resolvedText.replace(/\{\s*curso\s*\}/gi, realValues.curso);
  resolvedText = resolvedText.replace(/\{\s*carga\s*\}/gi, realValues.carga);
  resolvedText = resolvedText.replace(/\{\s*data\s*\}/gi, realValues.data);
  const textToDraw = resolvedText.trim() || studentName || 'Nome do Aluno';
  const safeDrawSize = Math.max(6, safeSize);
  const lineHeight = safeDrawSize * 1.2;

  const rawLines = textToDraw.split('\n');
  const wrappedLines: string[] = [];
  for (const rawLine of rawLines) {
    const words = rawLine.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (embedFont.widthOfTextAtSize(candidate, safeDrawSize) <= maxWidth) {
        current = candidate;
      } else {
        if (current) wrappedLines.push(current);
        current = word;
      }
    }
    if (current) wrappedLines.push(current);
  }
  if (wrappedLines.length === 0) wrappedLines.push(textToDraw);

  const clampedFinalY = Math.max(0, Math.min(finalY, pdfHeight - safeDrawSize));
  const blockMaxWidth = pdfWidth * 0.8;
  wrappedLines.forEach((line, index) => {
    const lineWidth = embedFont.widthOfTextAtSize(line, safeDrawSize);
    let lineX: number;
    if (align === 'center') {
      lineX = (pdfWidth - lineWidth) / 2;
    } else if (align === 'right') {
      lineX = finalX + (blockMaxWidth - lineWidth);
    } else {
      lineX = finalX;
    }
    const lineY = clampedFinalY - index * lineHeight;
    page.drawText(line, {
      x: Math.max(0, Math.min(lineX, pdfWidth - lineWidth - 1)),
      y: Math.max(0, lineY),
      size: safeDrawSize,
      font: embedFont,
      color: rgb(0, 0, 0),
    });
  });
  return pdfDoc.save();
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new HttpError(errorData.message || 'Falha ao salvar', res.status);
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: isEditing ? 'Aluno atualizado!' : 'Aluno adicionado!', description: isEditing ? 'Os dados foram salvos.' : 'O aluno foi inscrito no curso.' });
      qc.invalidateQueries({ queryKey: ['/api/enrollments/course', courseId] });
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof HttpError && err.status === 409) {
        toast({ title: 'Aluno já matriculado', description: err.message, variant: 'destructive' });
      } else {
        toast({ title: 'Erro', description: 'Não foi possível salvar o aluno.', variant: 'destructive' });
      }
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
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentWithCert | null>(null);
  const [deletingEnrollment, setDeletingEnrollment] = useState<EnrollmentWithCert | null>(null);
  const [importing, setImporting] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<{ done: number; total: number } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const hasCertConfig = !!(course.certTemplate && course.certBlockConfig);

  const { data: enrollments = [], isLoading } = useQuery<EnrollmentWithCert[]>({
    queryKey: ['/api/enrollments/course', course.id],
    queryFn: () => fetchEnrollmentsWithCerts(course.id, adminToken),
    enabled: open && !!adminToken,
  });

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredEnrollments = searchTerm.trim()
    ? enrollments.filter((e) => normalize(e.fullName ?? '').includes(normalize(searchTerm)))
    : enrollments;

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
      const skipped = result.skipped ?? 0;
      const errCount = result.errors?.length ?? 0;
      toast({
        title: 'Importação concluída!',
        description: `${result.created} adicionado(s) · ${skipped} duplicado(s) ignorado(s) · ${errCount} com erro`,
      });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao processar o arquivo CSV.', variant: 'destructive' });
    } finally {
      setImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const handleDispatchFromCourse = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasCertConfig) return;
    const courseEnrollments = await fetchEnrollmentsWithCerts(course.id, adminToken);
    if (courseEnrollments.length === 0) {
      toast({ title: 'Nenhum aluno inscrito neste curso', variant: 'destructive' });
      return;
    }
    setDispatching(true);
    setDispatchProgress({ done: 0, total: courseEnrollments.length });
    try {
      const config = JSON.parse(course.certBlockConfig!);
      const rawBlock = config.block;
      let block: TextBlock;
      if (config.version >= 4 && isFinite(rawBlock.pctX) && isFinite(rawBlock.pctY)) {
        block = { ...rawBlock, align: rawBlock.align ?? 'left' } as TextBlock;
      } else {
        const sf: number = config.scaleFactor ?? 1;
        const legacyX = isFinite(rawBlock.x) ? rawBlock.x : 100;
        const legacyY = isFinite(rawBlock.y) ? rawBlock.y : 150;
        const legacySize = isFinite(rawBlock.size) && rawBlock.size > 0 ? rawBlock.size : 24;
        let absX = legacyX;
        let absY = legacyY;
        if (!config.version || config.version < 2) {
          absX = legacyX * sf;
          absY = legacyY * sf;
        } else if (config.version >= 3) {
          const scaleX = isFinite(config.scaleX) && config.scaleX > 0 ? config.scaleX : 1;
          const scaleY = isFinite(config.scaleY) && config.scaleY > 0 ? config.scaleY : 1;
          absX = legacyX * scaleX;
          absY = legacyY * scaleY;
        }
        const templateBytesForSize = Uint8Array.from(atob(course.certTemplate!), (c) => c.charCodeAt(0)).buffer;
        const pdfDocTemp = await PDFDocument.load(templateBytesForSize);
        const tempPages = pdfDocTemp.getPages();
        const tempPage = tempPages[(rawBlock.page ?? 1) - 1] ?? tempPages[0];
        const { width: tW, height: tH } = tempPage.getSize();
        block = {
          ...rawBlock,
          pctX: tW > 0 ? absX / tW : 0.5,
          pctY: tH > 0 ? absY / tH : 0.5,
          baseSize: legacySize,
          align: rawBlock.align ?? 'left',
        } as TextBlock;
      }
      const templateBytes = Uint8Array.from(atob(course.certTemplate!), (c) => c.charCodeAt(0)).buffer;
      const [alexBrushBytes, poppinsBytes] = await Promise.all([
        fetch(FONT_URLS.alexbrushRegular).then((r) => r.arrayBuffer()),
        fetch(FONT_URLS.poppinsRegular).then((r) => r.arrayBuffer()),
      ]);
      let done = 0;
      let errors = 0;
      for (const enrollment of courseEnrollments) {
        try {
          const pdfBytes = await generateCertificatePdf(
            templateBytes, block, enrollment.fullName ?? '', alexBrushBytes, poppinsBytes
          );
          const base64 = btoa(
            new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          const res = await fetch(`/api/certificates/upload-base64/${enrollment.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ fileData: base64 }),
          });
          if (!res.ok) errors++;
        } catch {
          errors++;
        }
        done++;
        setDispatchProgress({ done, total: courseEnrollments.length });
      }
      qc.invalidateQueries({ queryKey: ['/api/enrollments/course', course.id] });
      if (errors === 0) {
        toast({ title: 'Certificados disparados!', description: `${courseEnrollments.length} certificado(s) enviados com sucesso.` });
      } else {
        toast({ title: 'Disparo concluído com avisos', description: `${done - errors} enviados, ${errors} com erro.`, variant: 'destructive' });
      }
    } catch (err) {
      console.error('Dispatch error:', err instanceof Error ? err.message : err);
      toast({ title: 'Erro ao disparar certificados', description: err instanceof Error ? err.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setDispatching(false);
      setDispatchProgress(null);
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
            <div className="flex items-center gap-2 ml-4 flex-wrap justify-end">
              <Badge className={`text-xs border ${STATUS_BADGE_CLASSES[course.status] ?? STATUS_BADGE_CLASSES.open}`}>
                {STATUS_LABELS[course.status] ?? 'Aberto'}
              </Badge>
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
              {hasCertConfig && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-forest border-forest/40 hover:bg-forest/10"
                  disabled={dispatching}
                  onClick={handleDispatchFromCourse}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  {dispatching
                    ? (dispatchProgress ? `${dispatchProgress.done}/${dispatchProgress.total}` : '...')
                    : 'Disparar Certificados'}
                </Button>
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
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Buscar aluno pelo nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
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
                    {filteredEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-sm text-gray-500">
                          Nenhum aluno encontrado para "{searchTerm}".
                        </td>
                      </tr>
                    ) : filteredEnrollments.map((e) => (
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
              </>
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

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do Curso *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                      <SelectItem value="coming_soon">Em Breve</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
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

function GerarPdfsTab({ adminToken, courses }: { adminToken: string; courses: Course[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [blocks, setBlocks] = useState<TextBlock[]>(DEFAULT_BLOCKS);
  const [generating, setGenerating] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [pdfOriginalSize, setPdfOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [domContainerSize, setDomContainerSize] = useState<{ width: number; height: number } | null>(null);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const dragStateRef = useRef<{
    key: BlockKey;
    startMouseX: number;
    startMouseY: number;
    startPctX: number;
    startPctY: number;
  } | null>(null);
  const domContainerSizeRef = useRef<{ width: number; height: number } | null>(null);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const pdfWrapperCallbackRef = React.useCallback((el: HTMLDivElement | null) => {
    (pdfWrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const clientWidth = (entry.target as HTMLDivElement).clientWidth;
        const clientHeight = (entry.target as HTMLDivElement).clientHeight;
        if (clientWidth > 0 && clientHeight > 0) {
          domContainerSizeRef.current = { width: clientWidth, height: clientHeight };
          setDomContainerSize((prev) => {
            if (prev && Math.abs(prev.width - clientWidth) <= 2 && Math.abs(prev.height - clientHeight) <= 2) return prev;
            return { width: clientWidth, height: clientHeight };
          });
        }
      }
    });
    observer.observe(el);
    resizeObserverRef.current = observer;
  }, []);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;

  const previewValues: Record<string, string> = {
    ...EXAMPLE_VALUES,
  };

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery<EnrollmentWithCert[]>({
    queryKey: ['/api/enrollments/course', selectedCourseId],
    queryFn: () => fetchEnrollmentsWithCerts(selectedCourseId, adminToken),
    enabled: !!selectedCourseId && !!adminToken,
  });

  React.useEffect(() => {
    if (!selectedCourseId) {
      setTemplateFile(null);
      setBlocks(DEFAULT_BLOCKS);
      setPdfOriginalSize(null);
      setDomContainerSize(null);
      return;
    }

    const localKey = `cert_config_${selectedCourseId}`;
    const localRaw = localStorage.getItem(localKey);
    if (localRaw) {
      try {
        const localConfig = JSON.parse(localRaw);
        if (localConfig.block) {
          const b = localConfig.block;
          if (localConfig.version >= 4 && isFinite(b.pctX) && isFinite(b.pctY)) {
            setBlocks([{ ...b, pctX: Math.max(0, Math.min(1, b.pctX)), pctY: Math.max(0, Math.min(1, b.pctY)), align: b.align ?? 'left' }]);
            if (localConfig.templateBase64) {
              const binaryStr = atob(localConfig.templateBase64);
              const bytes = new Uint8Array(binaryStr.length);
              for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
              const blob = new Blob([bytes], { type: 'application/pdf' });
              setTemplateFile(new File([blob], 'template.pdf', { type: 'application/pdf' }));
            }
            return;
          }
          localStorage.removeItem(localKey);
        }
      } catch {
        localStorage.removeItem(localKey);
      }
    }

    const course = courses.find((c) => c.id === selectedCourseId);
    if (course?.certTemplate && course?.certBlockConfig) {
      const loadConfig = async () => {
        try {
          const binaryStr = atob(course.certTemplate!);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const file = new File([blob], 'template.pdf', { type: 'application/pdf' });
          setTemplateFile(file);
          const config = JSON.parse(course.certBlockConfig!);
          if (config.block) {
            const savedBlock = config.block;
            if (config.version >= 4 && isFinite(savedBlock.pctX) && isFinite(savedBlock.pctY)) {
              setBlocks([{
                ...savedBlock,
                pctX: Math.max(0, Math.min(1, savedBlock.pctX)),
                pctY: Math.max(0, Math.min(1, savedBlock.pctY)),
                align: savedBlock.align ?? 'left',
              }]);
            } else {
              try {
                const sf: number = config.scaleFactor ?? 1;
                const legacyX = isFinite(savedBlock.x) ? savedBlock.x : 100;
                const legacyY = isFinite(savedBlock.y) ? savedBlock.y : 150;
                const legacySize = isFinite(savedBlock.size) && savedBlock.size > 0 ? savedBlock.size : 24;
                let absX = legacyX;
                let absY = legacyY;
                if (!config.version || config.version < 2) {
                  absX = legacyX * sf;
                  absY = legacyY * sf;
                } else if (config.version >= 3) {
                  const sX = isFinite(config.scaleX) && config.scaleX > 0 ? config.scaleX : 1;
                  const sY = isFinite(config.scaleY) && config.scaleY > 0 ? config.scaleY : 1;
                  absX = legacyX * sX;
                  absY = legacyY * sY;
                }
                const templateArrayBuffer = bytes.buffer;
                const pdfDocTemp = await PDFDocument.load(templateArrayBuffer);
                const tempPages = pdfDocTemp.getPages();
                const tempPage = tempPages[(savedBlock.page ?? 1) - 1] ?? tempPages[0];
                const { width: tW, height: tH } = tempPage.getSize();
                const migratedPctX = tW > 0 ? absX / tW : 0.5;
                const migratedPctY = tH > 0 ? absY / tH : 0.5;
                if (migratedPctX < 0 || migratedPctX > 1 || migratedPctY < 0 || migratedPctY > 1 || !isFinite(migratedPctX) || !isFinite(migratedPctY)) {
                  setBlocks(DEFAULT_BLOCKS);
                } else {
                  setBlocks([{
                    ...savedBlock,
                    pctX: migratedPctX,
                    pctY: migratedPctY,
                    baseSize: legacySize,
                    align: savedBlock.align ?? 'left',
                  } as TextBlock]);
                }
              } catch {
                setBlocks(DEFAULT_BLOCKS);
              }
            }
          }
        } catch {
          setTemplateFile(null);
          setBlocks(DEFAULT_BLOCKS);
          setPdfOriginalSize(null);
        }
      };
      loadConfig();
    } else {
      setTemplateFile(null);
      setBlocks(DEFAULT_BLOCKS);
      setPdfOriginalSize(null);
    }
  }, [selectedCourseId, courses]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!templateFile) { setPdfUrl(null); setPdfOriginalSize(null); setDomContainerSize(null); return; }
    const url = URL.createObjectURL(templateFile);
    setPdfUrl(url);
    setCurrentPage(1);
    setLoadProgress(0);
    return () => URL.revokeObjectURL(url);
  }, [templateFile]);

  const handleLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setLoadProgress(100);
  }, []);

  const handlePageLoadSuccess = useCallback((page: PDFPageProxy) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfOriginalSize({ width: viewport.width, height: viewport.height });
  }, []);

  const handleBlockMouseDown = useCallback((key: BlockKey, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const block = blocks.find((b) => b.key === key);
    if (!block) return;
    dragStateRef.current = {
      key,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPctX: block.pctX,
      startPctY: block.pctY,
    };

    const onMouseMove = (ev: MouseEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      const container = domContainerSizeRef.current;
      if (!container) return;
      const el = blockRefs.current[ds.key];
      if (!el) return;
      const domW = container.width;
      const domH = container.height;
      const dx = ev.clientX - ds.startMouseX;
      const dy = ev.clientY - ds.startMouseY;
      const rawX = ds.startPctX * domW + dx;
      const rawY = ds.startPctY * domH + dy;
      const clampedX = Math.max(0, Math.min(domW - el.offsetWidth, rawX));
      const clampedY = Math.max(0, Math.min(domH - el.offsetHeight, rawY));
      el.style.left = `${clampedX}px`;
      el.style.top = `${clampedY}px`;
    };

    const onMouseUp = (ev: MouseEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      const container = domContainerSizeRef.current;
      dragStateRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (!container) return;
      const el = blockRefs.current[ds.key];
      if (!el) return;
      const domW = container.width;
      const domH = container.height;
      const dx = ev.clientX - ds.startMouseX;
      const dy = ev.clientY - ds.startMouseY;
      const rawX = ds.startPctX * domW + dx;
      const rawY = ds.startPctY * domH + dy;
      const clampedX = Math.max(0, Math.min(domW - el.offsetWidth, rawX));
      const clampedY = Math.max(0, Math.min(domH - el.offsetHeight, rawY));
      const pctX = clampedX / domW;
      const pctY = clampedY / domH;
      setBlocks((prev) => prev.map((b) => b.key === ds.key ? { ...b, pctX, pctY } : b));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [blocks]);

  const handleBlockTouchStart = useCallback((key: BlockKey, e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const block = blocks.find((b) => b.key === key);
    if (!block) return;
    const touch = e.touches[0];
    dragStateRef.current = {
      key,
      startMouseX: touch.clientX,
      startMouseY: touch.clientY,
      startPctX: block.pctX,
      startPctY: block.pctY,
    };

    const onTouchMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const ds = dragStateRef.current;
      if (!ds) return;
      const container = domContainerSizeRef.current;
      if (!container) return;
      const el = blockRefs.current[ds.key];
      if (!el) return;
      const t = ev.touches[0];
      const domW = container.width;
      const domH = container.height;
      const dx = t.clientX - ds.startMouseX;
      const dy = t.clientY - ds.startMouseY;
      const rawX = ds.startPctX * domW + dx;
      const rawY = ds.startPctY * domH + dy;
      const clampedX = Math.max(0, Math.min(domW - el.offsetWidth, rawX));
      const clampedY = Math.max(0, Math.min(domH - el.offsetHeight, rawY));
      el.style.left = `${clampedX}px`;
      el.style.top = `${clampedY}px`;
    };

    const onTouchEnd = (ev: TouchEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      const container = domContainerSizeRef.current;
      dragStateRef.current = null;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (!container) return;
      const el = blockRefs.current[ds.key];
      if (!el) return;
      const t = ev.changedTouches[0];
      const domW = container.width;
      const domH = container.height;
      const dx = t.clientX - ds.startMouseX;
      const dy = t.clientY - ds.startMouseY;
      const rawX = ds.startPctX * domW + dx;
      const rawY = ds.startPctY * domH + dy;
      const clampedX = Math.max(0, Math.min(domW - el.offsetWidth, rawX));
      const clampedY = Math.max(0, Math.min(domH - el.offsetHeight, rawY));
      const pctX = clampedX / domW;
      const pctY = clampedY / domH;
      setBlocks((prev) => prev.map((b) => b.key === ds.key ? { ...b, pctX, pctY } : b));
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
  }, [blocks]);

  useEffect(() => {
    return () => {
      dragStateRef.current = null;
    };
  }, []);

  const updateBlock = useCallback((key: BlockKey, patch: Partial<TextBlock>) => {
    setBlocks((prev) => prev.map((b) => b.key === key ? { ...b, ...patch } : b));
  }, []);

  const handleSaveConfig = async () => {
    if (!selectedCourse) {
      toast({ title: 'Selecione um curso', variant: 'destructive' });
      return;
    }
    if (!templateFile) {
      toast({ title: 'Selecione o PDF template', variant: 'destructive' });
      return;
    }
    setSavingConfig(true);
    try {
      const templateBytes = await templateFile.arrayBuffer();
      const base64Template = btoa(
        new Uint8Array(templateBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      const blockConfig = JSON.stringify({ block: blocks[0], version: 4 });

      const localKey = `cert_config_${selectedCourse.id}`;
      try {
        localStorage.setItem(localKey, JSON.stringify({ block: blocks[0], templateBase64: base64Template, version: 4 }));
      } catch {
        // localStorage quota exceeded, ignore
      }

      const res = await fetch(`/api/courses/${selectedCourse.id}/cert-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ certTemplate: base64Template, certBlockConfig: blockConfig }),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      qc.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({ title: 'Configuração salva!', description: 'Template e posição do bloco salvos para este curso.' });
    } catch (err) {
      console.error('SaveConfig error:', err instanceof Error ? err.message : err);
      toast({ title: 'Erro', description: err instanceof Error ? err.message : 'Não foi possível salvar a configuração.', variant: 'destructive' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCourse) {
      toast({ title: 'Selecione um curso', variant: 'destructive' });
      return;
    }
    if (!templateFile) {
      toast({ title: 'Selecione o PDF template', variant: 'destructive' });
      return;
    }
    if (enrollments.length === 0) {
      toast({ title: 'Nenhum aluno inscrito neste curso', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      const [alexBrushBytes, poppinsBytes] = await Promise.all([
        fetch(FONT_URLS.alexbrushRegular).then((r) => r.arrayBuffer()),
        fetch(FONT_URLS.poppinsRegular).then((r) => r.arrayBuffer()),
      ]);
      const templateBytes = await templateFile.arrayBuffer();
      const zip = new JSZip();

      for (const enrollment of enrollments) {
        const block = blocks[0];
        const pdfBytes = await generateCertificatePdf(
          templateBytes, block, enrollment.fullName ?? '', alexBrushBytes, poppinsBytes
        );
        const safeName = (enrollment.fullName ?? `aluno-${enrollment.id}`)
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();
        zip.file(`${safeName}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipName = `certificados-${selectedCourse.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
      saveAs(zipBlob, zipName);
      toast({ title: 'Certificados gerados!', description: `${enrollments.length} PDF(s) compactados em ${zipName}.` });
    } catch (err) {
      console.error('Generate error:', err instanceof Error ? err.message : err);
      toast({ title: 'Erro ao gerar certificados', description: err instanceof Error ? err.message : 'Verifique o template e tente novamente.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!templateFile) {
      toast({ title: 'Selecione o PDF template', variant: 'destructive' });
      return;
    }
    try {
      const [alexBrushBytes, poppinsBytes] = await Promise.all([
        fetch(FONT_URLS.alexbrushRegular).then((r) => r.arrayBuffer()),
        fetch(FONT_URLS.poppinsRegular).then((r) => r.arrayBuffer()),
      ]);
      const templateBytes = await templateFile.arrayBuffer();
      const block = blocks[0];
      const pdfBytes = await generateCertificatePdf(
        templateBytes, block, 'Nome do Aluno', alexBrushBytes, poppinsBytes
      );
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'previa-certificado.pdf');
    } catch (err) {
      console.error('Preview error:', err instanceof Error ? err.message : err);
      toast({ title: 'Erro ao gerar prévia', description: err instanceof Error ? err.message : 'Verifique o template e tente novamente.', variant: 'destructive' });
    }
  };

  const handleDispatch = async () => {
    if (!selectedCourse) {
      toast({ title: 'Selecione um curso', variant: 'destructive' });
      return;
    }
    if (!templateFile) {
      toast({ title: 'Selecione o PDF template', variant: 'destructive' });
      return;
    }
    if (enrollments.length === 0) {
      toast({ title: 'Nenhum aluno inscrito neste curso', variant: 'destructive' });
      return;
    }

    setDispatching(true);
    setDispatchProgress({ done: 0, total: enrollments.length });
    try {
      const [alexBrushBytes, poppinsBytes] = await Promise.all([
        fetch(FONT_URLS.alexbrushRegular).then((r) => r.arrayBuffer()),
        fetch(FONT_URLS.poppinsRegular).then((r) => r.arrayBuffer()),
      ]);
      const templateBytes = await templateFile.arrayBuffer();
      let done = 0;
      let errors = 0;
      for (const enrollment of enrollments) {
        try {
          const block = blocks[0];
          const pdfBytes = await generateCertificatePdf(
            templateBytes, block, enrollment.fullName ?? '', alexBrushBytes, poppinsBytes
          );
          const base64 = btoa(
            new Uint8Array(pdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          const res = await fetch(`/api/certificates/upload-base64/${enrollment.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ fileData: base64 }),
          });
          if (!res.ok) errors++;
        } catch {
          errors++;
        }
        done++;
        setDispatchProgress({ done, total: enrollments.length });
      }
      qc.invalidateQueries({ queryKey: ['/api/enrollments/course', selectedCourseId] });
      if (errors === 0) {
        toast({ title: 'Certificados disparados!', description: `${enrollments.length} certificado(s) enviados com sucesso.` });
      } else {
        toast({ title: 'Disparo concluído com avisos', description: `${done - errors} enviados, ${errors} com erro.`, variant: 'destructive' });
      }
    } catch (err) {
      console.error('Dispatch error:', err instanceof Error ? err.message : err);
      toast({ title: 'Erro ao disparar certificados', description: err instanceof Error ? err.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setDispatching(false);
      setDispatchProgress(null);
    }
  };

  const alunoBlock = blocks[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Gerar Certificados em Lote</h2>
        <p className="text-sm text-gray-500">Selecione um curso, faça upload do PDF template, posicione o bloco do nome e dispare os certificados para todos os alunos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel: controls */}
        <div className="space-y-4">
          <Card className="border border-gray-200">
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Curso</label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourseId && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    {loadingEnrollments ? 'Carregando...' : `${enrollments.length} aluno(s) inscrito(s)`}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Template PDF</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={() => templateInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {templateFile ? templateFile.name : 'Selecionar PDF'}
                  </Button>
                  {templateFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-gray-400 hover:text-red-500"
                      onClick={() => { setTemplateFile(null); setBlocks(DEFAULT_BLOCKS); }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <input
                  ref={templateInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setTemplateFile(file); setBlocks(DEFAULT_BLOCKS); }
                    if (templateInputRef.current) templateInputRef.current.value = '';
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="bg-forest hover:bg-forest/90 text-white w-full"
                  disabled={dispatching || savingConfig || !selectedCourseId || !templateFile}
                  onClick={handleDispatch}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {dispatching ? (dispatchProgress ? `Disparando... ${dispatchProgress.done}/${dispatchProgress.total}` : 'Disparando...') : 'Disparar Certificados'}
                </Button>
                {dispatchProgress && (
                  <Progress value={(dispatchProgress.done / dispatchProgress.total) * 100} className="h-1.5" />
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    disabled={generating || dispatching || !selectedCourseId || !templateFile}
                    onClick={handleGenerate}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {generating ? 'Gerando...' : 'Baixar ZIP'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    disabled={dispatching || !templateFile}
                    onClick={handlePreview}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Baixar Prévia
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    disabled={savingConfig || dispatching || !selectedCourseId || !templateFile}
                    onClick={handleSaveConfig}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {savingConfig ? 'Salvando...' : 'Salvar Config'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block control: only Nome do Aluno */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Bloco de Texto</p>
            <Card className="border border-gray-200">
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{alunoBlock.label}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-500 whitespace-nowrap">Tamanho:</label>
                    <input
                      type="number"
                      min={6}
                      max={120}
                      value={alunoBlock.baseSize}
                      onChange={(e) => updateBlock(alunoBlock.key, { baseSize: Number(e.target.value) })}
                      className="w-16 h-7 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:ring-1 focus:ring-forest"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-500 whitespace-nowrap">Fonte:</label>
                    <select
                      value={alunoBlock.font}
                      onChange={(e) => updateBlock(alunoBlock.key, { font: e.target.value as 'poppins' | 'alexbrush' })}
                      className="h-7 text-xs border border-gray-300 rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-forest"
                    >
                      <option value="alexbrush">Alex Brush</option>
                      <option value="poppins">Poppins</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-500 whitespace-nowrap">Página:</label>
                    <select
                      value={alunoBlock.page}
                      onChange={(e) => updateBlock(alunoBlock.key, { page: Number(e.target.value) as 1 | 2 })}
                      className="h-7 text-xs border border-gray-300 rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-forest"
                    >
                      <option value={1}>Página 1</option>
                      <option value={2}>Página 2</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-500 whitespace-nowrap">Alinhamento:</label>
                    <div className="flex items-center gap-0.5">
                      {(['left', 'center', 'right'] as const).map((a) => {
                        const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
                        const isActive = (alunoBlock.align ?? 'left') === a;
                        return (
                          <button
                            key={a}
                            type="button"
                            title={a === 'left' ? 'Esquerda' : a === 'center' ? 'Centro' : 'Direita'}
                            onClick={() => updateBlock(alunoBlock.key, { align: a })}
                            className={`h-7 w-7 flex items-center justify-center rounded border text-xs transition-colors ${
                              isActive
                                ? 'bg-forest text-white border-forest'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right panel: PDF preview with drag & drop */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Preview do PDF</p>

          {!templateFile ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center text-gray-400">
              <FileDown className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Faça upload do PDF template para posicionar o bloco do nome visualmente</p>
            </div>
          ) : (
            <>
              {loadProgress > 0 && loadProgress < 100 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Carregando PDF...</p>
                  <Progress value={loadProgress} className="h-1.5" />
                </div>
              )}

              {numPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Página:</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      currentPage === 1 ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Página 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(2)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      currentPage === 2 ? 'bg-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Página 2
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Arraste o bloco do nome para a posição desejada. As coordenadas são capturadas automaticamente.
              </p>

              <div className="border border-gray-200 rounded-lg overflow-auto" style={{ maxHeight: '75vh' }}>
                <div
                  ref={pdfWrapperCallbackRef}
                  className="relative inline-block w-full"
                  style={{ userSelect: 'none' }}
                >
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={handleLoadSuccess}
                    onLoadProgress={({ loaded, total }) => setLoadProgress(total ? Math.round((loaded / total) * 100) : 50)}
                    loading={
                      <div className="p-8 space-y-2">
                        <p className="text-xs text-center text-gray-400">Carregando PDF...</p>
                        <Progress value={loadProgress} className="h-1.5" />
                      </div>
                    }
                  >
                    <Page
                      pageNumber={currentPage}
                      width={domContainerSize?.width || pdfWrapperRef.current?.clientWidth || 600}
                      onLoadSuccess={handlePageLoadSuccess}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>

                  {domContainerSize && domContainerSize.width > 0 && loadProgress === 100 && pdfOriginalSize && blocks.filter((b) => b.page === currentPage).map((block) => {
                    const domW = domContainerSize.width;
                    const domH = domContainerSize.height;
                    const pdfW = pdfOriginalSize.width;
                    const visualFontSize = Math.max(8, block.baseSize * (domW / pdfW));
                    const visualX = block.pctX * domW;
                    const visualY = block.pctY * domH;
                    const displayText = parseVariables(block.text, previewValues);
                    return (
                      <div
                        key={block.key}
                        ref={(el) => { blockRefs.current[block.key] = el; }}
                        className="absolute select-none px-2 py-1 rounded border border-dashed bg-white/70 backdrop-blur-sm text-gray-800 hover:bg-white/90 hover:border-gray-600 transition-colors"
                        style={{
                          zIndex: 10,
                          cursor: 'grab',
                          fontSize: `${visualFontSize}px`,
                          fontWeight: 400,
                          fontStyle: 'normal',
                          fontFamily: block.font === 'alexbrush' ? '"Alex Brush", cursive' : 'Poppins, sans-serif',
                          textAlign: block.align ?? 'left',
                          borderColor: 'rgba(100,100,200,0.5)',
                          left: (block.align ?? 'left') === 'center' ? 0 : `${visualX}px`,
                          top: `${visualY}px`,
                          width: (block.align ?? 'left') === 'center' ? '100%' : undefined,
                        }}
                        title={`${block.label} — X: ${(block.pctX * 100).toFixed(1)}%, Y: ${(block.pctY * 100).toFixed(1)}%`}
                        onMouseDown={(e) => handleBlockMouseDown(block.key, e)}
                        onTouchStart={(e) => handleBlockTouchStart(block.key, e)}
                      >
                        {displayText || block.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardCapacitacao() {
  const { adminToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'cursos' | 'notificacoes' | 'gerar-pdfs'>('cursos');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'coming_soon' | 'completed'>('all');

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const filteredCourses = statusFilter === 'all' ? courses : courses.filter((c) => c.status === statusFilter);

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
        <button
          onClick={() => setActiveTab('gerar-pdfs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'gerar-pdfs'
              ? 'border-forest text-forest'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileDown className="w-4 h-4" />
          Gerar PDFs
        </button>
      </div>

      {activeTab === 'cursos' ? (
        <>
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'all', label: 'Todos' },
              { value: 'open', label: 'Aberto' },
              { value: 'closed', label: 'Fechado' },
              { value: 'coming_soon', label: 'Em Breve' },
              { value: 'completed', label: 'Concluído' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  statusFilter === value
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
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
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Nenhum curso encontrado</p>
              <p className="text-sm mt-1">Não há cursos com o status selecionado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
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
      ) : activeTab === 'notificacoes' ? (
        <NotificationsTab adminToken={adminToken} />
      ) : (
        <GerarPdfsTab adminToken={adminToken} courses={courses} />
      )}

      <CourseFormDialog
        key={editingCourse?.id ?? 'new'}
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
