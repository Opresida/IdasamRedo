import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Calendar, Clock, CheckCircle, BookOpen, HelpCircle } from 'lucide-react';
import type { Course, CourseWithEnrollment } from '@shared/schema';

const enrollmentSchema = z.object({
  courseId: z.string().uuid(),
  fullName: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  company: z.string().optional(),
});

type EnrollmentForm = z.infer<typeof enrollmentSchema>;

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

interface EnrollmentDialogProps {
  course: Course | CourseWithEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnrollmentDialog({ course, open, onOpenChange }: EnrollmentDialogProps) {
  const { toast } = useToast();
  const [enrolled, setEnrolled] = useState(false);

  const form = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { courseId: '', fullName: '', cpf: '', phone: '', email: '', company: '' },
  });

  // Reseta o formulário e a tela de confirmação sempre que o curso muda ou o modal reabre.
  useEffect(() => {
    if (open && course) {
      setEnrolled(false);
      form.reset({ courseId: course.id, fullName: '', cpf: '', phone: '', email: '', company: '' });
    }
  }, [open, course?.id]);

  const mutation = useMutation({
    mutationFn: (data: EnrollmentForm) => apiRequest('POST', '/api/enrollments', data),
    onSuccess: () => {
      setEnrolled(true);
      toast({ title: 'Inscrição realizada!', description: 'Sua inscrição foi confirmada com sucesso.' });
      // Atualiza a lista (/api/courses) e o curso único (/api/courses/:id) por prefixo,
      // pra a contagem de vagas refletir a nova inscrição.
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: (error: Error) => {
      // O backend envia o erro como "<status>: <corpo>". Para 409 (já matriculado / esgotado),
      // extraímos a mensagem específica para o aluno entender em vez de tentar de novo em loop.
      let description = 'Não foi possível realizar a inscrição. Tente novamente.';
      const match = error?.message?.match(/^(\d{3}):\s*([\s\S]*)$/);
      if (match) {
        const body = match[2];
        try {
          const parsed = JSON.parse(body);
          if (parsed?.message) description = parsed.message;
        } catch {
          if (body) description = body;
        }
      }
      toast({ title: 'Erro', description, variant: 'destructive' });
    },
  });

  const courseStatus = course?.status ?? 'open';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-forest">
            {enrolled ? 'Inscrição Confirmada!' : 'Inscrição no Curso'}
          </DialogTitle>
        </DialogHeader>

        {enrolled ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inscrição realizada com sucesso!</h3>
            <p className="text-gray-600 text-sm mb-2">Você está inscrito em:</p>
            <p className="font-medium text-forest mb-4">{course?.title}</p>
            <p className="text-sm text-gray-500">
              Após a conclusão do curso, acesse{' '}
              <a href="/meu-certificado" className="text-forest underline">Meu Certificado</a>{' '}
              para baixar seu diploma.
            </p>
            <Button className="mt-6 bg-forest hover:bg-forest/90 text-white" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : course && courseStatus !== 'open' ? (
          <div className="flex flex-col items-center py-6 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-medium text-gray-900 mb-1">{course.title}</p>
            <p className="text-sm text-gray-500 mt-2">
              {(courseStatus === 'closed') && 'As inscrições para este curso estão encerradas.'}
              {(courseStatus === 'coming_soon') && 'Este curso ainda não está disponível para inscrições.'}
              {(courseStatus === 'completed') && 'Este curso já foi concluído.'}
            </p>
            <Button className="mt-6" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-forest mb-1">{course?.title}</p>
              {course?.schedule && (
                <p className="text-xs text-gray-500">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {course.schedule}
                </p>
              )}
              {course?.startDate && (
                <p className="text-xs text-gray-500">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {formatDate(course.startDate)} a {formatDate(course.endDate)}
                </p>
              )}
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="cpf" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl><Input placeholder="(92) 99999-9999" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="company" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Empresa <span className="text-xs font-normal text-gray-400">(opcional)</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-gray-400 hover:text-forest" aria-label="Ajuda sobre o campo Empresa">
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[240px] text-center">
                          Esse campo é opcional, mas caso venha de alguma empresa, favor preencher o nome abaixo.
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl><Input placeholder="Nome da empresa (se houver)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-forest hover:bg-forest/90 text-white" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Inscrevendo...' : 'Confirmar Inscrição'}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
