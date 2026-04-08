import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, Lock, MapPin, Linkedin, Instagram, Facebook } from 'lucide-react';

export default function LgpdConsentPage() {
  const [, params] = useRoute('/lgpd/:token');
  const token = params?.token || '';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/public/crm/lgpd/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject('Link inválido'))
      .then(d => { setData(d); setConsented(d.lgpdConsentimento); })
      .catch(() => setError('Link inválido ou expirado'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleConsent = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/public/crm/lgpd/${token}/consent`, { method: 'POST' });
    if (res.ok) setConsented(true);
    else setError('Erro ao registrar consentimento');
    setSubmitting(false);
  };

  const bgPattern = 'radial-gradient(circle at 20% 80%, rgba(42,91,70,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(78,141,124,0.06) 0%, transparent 50%)';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bgPattern, backgroundColor: '#f8faf9' }}>
      <div className="w-8 h-8 rounded-full border-2 border-[#2A5B46]/30 border-t-[#2A5B46] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bgPattern, backgroundColor: '#f8faf9' }}>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
      <IdasamFooter />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: bgPattern, backgroundColor: '#f8faf9' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A5B46] via-[#3a7a5e] to-[#4E8D7C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/3" />
        </div>
        <div className="max-w-xl mx-auto px-6 py-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white border border-white/20">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium tracking-wider uppercase">Proteção de Dados</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Consentimento LGPD</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-6 -mt-4 pb-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {consented ? (
            <div className="p-8 md:p-10 text-center space-y-5">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br from-[#2A5B46] to-[#4E8D7C]">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Consentimento Registrado!</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Obrigado, <strong>{data.nome}</strong>. Seus dados estão protegidos conforme a Lei Geral de Proteção de Dados.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-4">
                <Lock className="w-4 h-4" />
                Dados armazenados com criptografia
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 space-y-6">
              <div className="p-4 rounded-xl bg-[#2A5B46]/5 border border-[#2A5B46]/10">
                <p className="text-sm text-gray-700">
                  Olá, <strong className="text-[#2A5B46]">{data.nome}</strong>. O IDASAM solicita seu consentimento para o tratamento dos seus dados pessoais.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#2A5B46]" /> Termos de Tratamento de Dados
                </h4>

                {[
                  { title: 'Finalidade', text: 'Gestão de relacionamento institucional, comunicação e prestação de serviços pelo Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM.' },
                  { title: 'Dados tratados', text: 'Nome, e-mail, telefone, endereço e dados profissionais/institucionais previamente informados.' },
                  { title: 'Compartilhamento', text: 'Seus dados não serão compartilhados com terceiros sem seu consentimento prévio e expresso.' },
                  { title: 'Armazenamento', text: 'Dados armazenados em servidores seguros com criptografia de ponta a ponta.' },
                  { title: 'Seus direitos', text: 'Você pode solicitar a exclusão, correção, portabilidade ou revogação do consentimento a qualquer momento pelo e-mail contato@idasam.org.' },
                  { title: 'Base legal', text: 'Lei Geral de Proteção de Dados Pessoais — Lei nº 13.709/2018.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#2A5B46' }} />
                    <div>
                      <strong className="text-gray-700">{item.title}:</strong>{' '}
                      <span className="text-gray-600">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full text-white hover:opacity-90"
                size="lg"
                style={{ background: '#2A5B46' }}
                onClick={handleConsent}
                disabled={submitting}
              >
                {submitting ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" /> Registrando...</>
                ) : (
                  <><Shield className="w-4 h-4 mr-2" /> Concordo com o tratamento dos meus dados</>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                Ao clicar, você confirma ter lido e concordado com os termos acima, nos termos da LGPD.
              </p>
            </div>
          )}

        </div>
      </div>

      <IdasamFooter />
    </div>
  );
}

function IdasamFooter() {
  return (
    <footer className="bg-forest text-white py-14 px-4 mt-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <img src="https://i.imgur.com/01OfFEi.png" alt="IDASAM" className="w-[120px] h-auto object-contain mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Inovação e Tecnologia para o Desenvolvimento da Amazônia.
            </p>
            <div className="flex items-start gap-2 text-gray-300 text-xs mb-4">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Centro Empresarial Art Center, 3694, Manaus - AM</span>
            </div>
            <div className="flex gap-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/#quem-somos" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="/noticias" className="hover:text-white transition-colors">Notícias</a></li>
              <li><a href="/projetos" className="hover:text-white transition-colors">Projetos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Capacitação</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/capacitacao" className="hover:text-white transition-colors">Cursos 2026</a></li>
              <li><a href="/meu-certificado" className="hover:text-white transition-colors">Meu Certificado</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Transparência</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/transparencia" className="hover:text-white transition-colors">Legislação</a></li>
              <li><a href="/transparencia" className="hover:text-white transition-colors">Relatórios</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-600 pt-6 text-center">
          <p className="text-xs text-gray-300 leading-relaxed max-w-3xl mx-auto mb-3">
            O Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM (CNPJ: 02.906.177/0001-87)
            cumpre rigorosamente as leis brasileiras, assegurando transparência, ética e integridade em todas as suas atividades.
          </p>
          <p className="text-xs text-gray-400">© 2024 IDASAM. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
