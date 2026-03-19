import React, { useState } from 'react';
import FloatingNavbar from '@/components/floating-navbar';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Award, Download, Search, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CertificateResult {
  enrollmentId: string;
  fullName: string;
  courseTitle: string;
  hasCertificate: boolean;
}

export default function MeuCertificadoPage() {
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CertificateResult[] | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({ title: 'Atenção', description: 'Informe seu CPF ou e-mail.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/certificates/lookup?identifier=${encodeURIComponent(identifier.trim())}`);
      if (res.status === 404) {
        setResults([]);
        return;
      }
      if (!res.ok) throw new Error('Erro ao consultar');
      const data = await res.json();
      setResults(data);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível consultar. Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (enrollmentId: string) => {
    setDownloading(enrollmentId);
    try {
      const encodedId = encodeURIComponent(identifier.trim());
      const res = await fetch(`/api/certificates/download/${enrollmentId}?identifier=${encodedId}`);
      if (!res.ok) {
        toast({ title: 'Erro', description: 'Certificado não disponível ainda.', variant: 'destructive' });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'certificado.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível baixar o certificado.', variant: 'destructive' });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="font-inter bg-sand text-gray-800 min-h-screen">
      <FloatingNavbar />

      {/* Hero */}
      <section className="bg-forest text-white pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Award className="w-14 h-14 mx-auto mb-4 text-white/80" />
          <h1 className="text-4xl font-bold mb-4">Meu Certificado</h1>
          <p className="text-lg text-white/80">
            Consulte e baixe seu certificado de participação nos cursos de capacitação do IDASAM.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-forest">
                <Search className="w-5 h-5" />
                Consultar Certificado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="identifier">CPF ou E-mail</Label>
                  <Input
                    id="identifier"
                    placeholder="Digite seu CPF ou e-mail cadastrado"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-forest hover:bg-forest/90 text-white"
                  disabled={loading}
                >
                  {loading ? 'Consultando...' : 'Consultar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {results !== null && (
            <div className="mt-8">
              {results.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Nenhuma inscrição encontrada</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Verifique se o CPF ou e-mail informado está correto.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Suas inscrições:</h3>
                  {results.map((item) => (
                    <Card key={item.enrollmentId} className="border border-gray-200">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.courseTitle}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.fullName}</p>
                            <div className="mt-2">
                              {item.hasCertificate ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Certificado disponível
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-gray-500">
                                  Aguardando emissão
                                </Badge>
                              )}
                            </div>
                          </div>
                          {item.hasCertificate && (
                            <Button
                              size="sm"
                              className="bg-forest hover:bg-forest/90 text-white"
                              onClick={() => handleDownload(item.enrollmentId)}
                              disabled={downloading === item.enrollmentId}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {downloading === item.enrollmentId ? 'Baixando...' : 'Baixar PDF'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <ShadcnblocksComFooter2 />
    </div>
  );
}
