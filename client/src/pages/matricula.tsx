import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import FloatingNavbar from '@/components/floating-navbar';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import WhatsAppFloat from '@/components/whatsapp-float';
import EnrollmentDialog from '@/components/enrollment-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, Clock, MapPin, User, BookOpen, Users, GraduationCap, AlertCircle,
} from 'lucide-react';
import type { CourseWithEnrollment } from '@shared/schema';

const STATUS_LABELS: Record<string, string> = {
  open: 'Inscrições Abertas',
  closed: 'Inscrições Encerradas',
  coming_soon: 'Em Breve',
  completed: 'Concluído',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  open: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-red-100 text-red-700 border-red-200',
  coming_soon: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function MatriculaPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: course, isLoading, isError } = useQuery<CourseWithEnrollment>({
    queryKey: ['/api/courses', courseId],
    enabled: !!courseId,
  });

  const courseStatus = course?.status ?? 'open';
  const filled = course?.enrolledCount ?? 0;
  const available = course?.vacancies != null ? Math.max(0, course.vacancies - filled) : null;
  const isFull = available === 0;
  const canEnroll = courseStatus === 'open' && !isFull;

  return (
    <div className="font-inter bg-sand text-gray-800 min-h-screen flex flex-col">
      <FloatingNavbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
          </div>
        ) : isError || !course ? (
          <Card className="w-full max-w-md text-center border border-gray-200">
            <CardContent className="py-12">
              <AlertCircle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-forest mb-2">Curso não encontrado</h1>
              <p className="text-sm text-gray-500 mb-6">
                O link de matrícula pode estar incorreto ou o curso não está mais disponível.
              </p>
              <Button asChild variant="outline">
                <a href="/capacitacao">Ver todos os cursos</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-lg border border-gray-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-3 text-forest">
                <GraduationCap className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">IDASAM · Capacitação</span>
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-2xl font-bold leading-snug text-forest">
                  {course.title}
                </CardTitle>
                <Badge className={`text-xs border shrink-0 ${STATUS_BADGE_CLASSES[courseStatus] ?? STATUS_BADGE_CLASSES.open}`}>
                  {STATUS_LABELS[courseStatus] ?? 'Inscrições Abertas'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Disponibilidade de vagas */}
              <div className={`rounded-xl border p-4 mb-5 ${isFull ? 'border-red-200 bg-red-50' : 'border-forest/20 bg-forest/5'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Users className={`w-4 h-4 ${isFull ? 'text-red-600' : 'text-forest'}`} />
                  <span className={`text-sm font-semibold ${isFull ? 'text-red-700' : 'text-forest'}`}>
                    {course.vacancies != null
                      ? (isFull ? 'Vagas esgotadas' : `${available} ${available === 1 ? 'vaga disponível' : 'vagas disponíveis'}`)
                      : `${filled} ${filled === 1 ? 'inscrito' : 'inscritos'}`}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {course.vacancies != null
                    ? `${filled} de ${course.vacancies} vagas preenchidas`
                    : 'Vagas ilimitadas'}
                </p>
              </div>

              <div className="space-y-2.5 text-sm text-gray-700 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-forest flex-shrink-0" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-forest flex-shrink-0" />
                  <span>{course.workload}h de carga horária{course.schedule ? ` • ${course.schedule}` : ''}</span>
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

              {canEnroll ? (
                <Button
                  className="w-full bg-forest hover:bg-forest/90 text-white h-11 text-base"
                  onClick={() => setDialogOpen(true)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Fazer Matrícula
                </Button>
              ) : (
                <div>
                  <Button className="w-full h-11" variant="outline" disabled>
                    <BookOpen className="w-4 h-4 mr-2" />
                    {courseStatus === 'open' && isFull && 'Vagas Esgotadas'}
                    {courseStatus === 'closed' && 'Inscrições Encerradas'}
                    {courseStatus === 'coming_soon' && 'Em Breve'}
                    {courseStatus === 'completed' && 'Curso Concluído'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {courseStatus === 'open' && isFull && 'Todas as vagas deste curso já foram preenchidas.'}
                    {courseStatus === 'closed' && 'As inscrições para este curso estão encerradas.'}
                    {courseStatus === 'coming_soon' && 'Este curso ainda não está disponível para inscrições.'}
                    {courseStatus === 'completed' && 'Este curso já foi concluído.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <EnrollmentDialog
        course={course ?? null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ShadcnblocksComFooter2 />
      <WhatsAppFloat />
    </div>
  );
}
