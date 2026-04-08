import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

export default function LgpdConsentPage() {
  const [, params] = useRoute('/lgpd/:token');
  const token = params?.token || '';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/public/crm/lgpd/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject('Link inválido'))
      .then(d => { setData(d); setConsented(d.lgpdConsentimento); })
      .catch(() => setError('Link inválido ou expirado'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleConsent = async () => {
    const res = await fetch(`/api/public/crm/lgpd/${token}/consent`, { method: 'POST' });
    if (res.ok) setConsented(true);
    else setError('Erro ao registrar consentimento');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Carregando...</p></div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">{error}</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-700" />
          </div>
          <CardTitle>Consentimento LGPD</CardTitle>
          <p className="text-sm text-gray-500">IDASAM — Instituto de Desenvolvimento da Amazônia</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {consented ? (
            <div className="text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <p className="font-semibold text-green-700">Consentimento registrado com sucesso!</p>
              <p className="text-sm text-gray-500">Obrigado, {data.nome}. Seus dados estão protegidos conforme a LGPD.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Olá, <strong>{data.nome}</strong>. O IDASAM solicita seu consentimento para o tratamento dos seus dados pessoais conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
                <p><strong>Finalidade:</strong> Gestão de relacionamento institucional, comunicação e prestação de serviços.</p>
                <p><strong>Dados tratados:</strong> Nome, e-mail, telefone, endereço e dados profissionais/institucionais informados.</p>
                <p><strong>Compartilhamento:</strong> Seus dados não serão compartilhados com terceiros sem seu consentimento prévio.</p>
                <p><strong>Direitos:</strong> Você pode solicitar a exclusão, correção ou portabilidade dos seus dados a qualquer momento pelo e-mail contato@idasam.org.</p>
                <p><strong>Armazenamento:</strong> Dados são armazenados em servidores seguros com criptografia.</p>
              </div>
              <Button className="w-full" size="lg" onClick={handleConsent}>
                <Shield className="w-4 h-4 mr-2" />
                Concordo com o tratamento dos meus dados
              </Button>
              <p className="text-xs text-center text-gray-400">
                Ao clicar, você confirma ter lido e concordado com a política de privacidade do IDASAM.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
