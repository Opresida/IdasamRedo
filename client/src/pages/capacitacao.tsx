import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FloatingNavbar from '@/components/floating-navbar';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Calendar, Clock, MapPin, User, BookOpen, CheckCircle,
  ChevronDown, ChevronUp, AlignLeft, Users,
} from 'lucide-react';
import type { Course } from '@shared/schema';

const enrollmentSchema = z.object({
  courseId: z.string().uuid(),
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
});

type EnrollmentForm = z.infer<typeof enrollmentSchema>;

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function CourseCard({ course, onEnroll }: { course: Course; onEnroll: (c: Course) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold leading-snug text-forest">
            {course.title}
          </CardTitle>
          {course.vacancies && (
            <Badge variant="outline" className="shrink-0 text-xs border-forest/30 text-forest">
              <Users className="w-3 h-3 mr-1" />
              {course.vacancies} vagas
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-0">
        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-forest flex-shrink-0" />
            <span>{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest flex-shrink-0" />
            <span>{course.workload}h de carga horária
              {course.schedule ? ` • ${course.schedule}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-forest flex-shrink-0" />
            <span>{formatDate(course.startDate)} a {formatDate(course.endDate)}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
            <div>
              <span>{course.location}</span>
              {course.address && (
                <p className="text-xs text-gray-500 mt-0.5">{course.address}</p>
              )}
            </div>
          </div>
        </div>

        {course.curriculum && (
          <div className="mb-4">
            <button
              className="flex items-center gap-1 text-sm font-medium text-forest hover:text-forest/80 transition-colors"
              onClick={() => setExpanded((v) => !v)}
            >
              <AlignLeft className="w-4 h-4" />
              Conteúdo Programático
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700 whitespace-pre-line">
                {course.curriculum}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto">
          <Button
            className="w-full bg-forest hover:bg-forest/90 text-white"
            onClick={() => onEnroll(course)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Inscrever-se
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CapacitacaoPage() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const form = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { courseId: '', fullName: '', cpf: '', phone: '', email: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: EnrollmentForm) => apiRequest('POST', '/api/enrollments', data),
    onSuccess: () => {
      setEnrolled(true);
      toast({ title: 'Inscrição realizada!', description: 'Sua inscrição foi confirmada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível realizar a inscrição. Tente novamente.', variant: 'destructive' });
    },
  });

  const openEnrollDialog = (course: Course) => {
    setSelectedCourse(course);
    setEnrolled(false);
    form.reset({ courseId: course.id, fullName: '', cpf: '', phone: '', email: '' });
  };

  return (
    <div className="font-inter bg-sand text-gray-800 min-h-screen">
      <FloatingNavbar />

      {/* Hero */}
      <section className="bg-forest text-white pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-4">IDASAM 2026</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Capacitação Profissional</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Desenvolva competências para atuar no desenvolvimento sustentável da Amazônia.
            Inscreva-se nos nossos cursos de 2026 e avance na sua carreira.
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Cursos Disponíveis — Cronograma 2026
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Nenhum curso disponível no momento</p>
              <p className="text-sm mt-1">Em breve novos cursos serão publicados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} onEnroll={openEnrollDialog} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enrollment Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
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
              <p className="font-medium text-forest mb-4">{selectedCourse?.title}</p>
              <p className="text-sm text-gray-500">
                Após a conclusão do curso, acesse{' '}
                <a href="/meu-certificado" className="text-forest underline">Meu Certificado</a>{' '}
                para baixar seu diploma.
              </p>
              <Button className="mt-6 bg-forest hover:bg-forest/90 text-white" onClick={() => setSelectedCourse(null)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-forest mb-1">{selectedCourse?.title}</p>
                {selectedCourse?.schedule && (
                  <p className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {selectedCourse.schedule}
                  </p>
                )}
                {selectedCourse?.startDate && (
                  <p className="text-xs text-gray-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(selectedCourse.startDate)} a {formatDate(selectedCourse.endDate)}
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
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedCourse(null)}>
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

      <ShadcnblocksComFooter2 />
    </div>
  );
}
