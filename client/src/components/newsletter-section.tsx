
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check, Send } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      return;
    }

    setIsLoading(true);
    
    // Simular API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  return (
    <section className="py-20 bg-forest">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 sm:p-12 text-center">
          {/* Ícone */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            📧 Newsletter IDASAM
          </h2>

          {/* Descrição */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
            Mantenha-se atualizado com as últimas novidades, projetos e conquistas do 
            IDASAM. Receba conteúdo exclusivo diretamente em seu email!
          </p>

          {!isSubscribed ? (
            <>
              {/* Formulário */}
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
                <Input
                  type="email"
                  placeholder="Digite seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 px-4 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white border-0 whitespace-nowrap"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Inscrevendo...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Inscrever-se
                    </div>
                  )}
                </Button>
              </form>

              {/* Benefícios */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-300" />
                  <span>Conteúdo exclusivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-300" />
                  <span>Sem spam</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-300" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </>
          ) : (
            /* Mensagem de sucesso */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                🎉 Inscrição realizada com sucesso!
              </h3>
              <p className="text-white/80">
                Obrigado por se inscrever! Você receberá nossas novidades em breve.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
