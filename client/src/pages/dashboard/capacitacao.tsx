import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { GraduationCap, Upload, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { Course, Enrollment } from '@shared/schema';

interface EnrollmentWithCert extends Enrollment {
  hasCertificate: boolean;
}

async function fetchEnrollmentsWithCerts(courseId: string, token: string): Promise<EnrollmentWithCert[]> {
  const res = await fetch(`/api/enrollments/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

function CourseEnrollments({ course, adminToken }: { course: Course; adminToken: string }) {
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
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-forest">{course.title}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {course.instructor} • {course.workload}h • {course.startDate} – {course.endDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {open && !isLoading && (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {enrollments.length} inscritos
              </Badge>
            )}
            {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent>
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
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Enviado
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs text-gray-400">
                              Pendente
                            </Badge>
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

export default function DashboardCapacitacao() {
  const { adminToken } = useAuth();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <GraduationCap className="w-6 h-6 text-forest" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Capacitação</h1>
          <p className="text-gray-600">Gerencie inscrições e certificados dos cursos IDASAM 2026</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseEnrollments key={course.id} course={course} adminToken={adminToken} />
          ))}
        </div>
      )}
    </div>
  );
}
