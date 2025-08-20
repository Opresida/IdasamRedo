
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    // Netlify vai processar automaticamente
    // Apenas mostra feedback visual
    setTimeout(() => {
      setIsSubmitted(true);
    }, 500);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mensagem Enviada!</h3>
            <p className="text-gray-600">
              Obrigado pelo seu interesse. Entraremos em contato em breve!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-forest">
          Apresente seu Projeto
        </CardTitle>
        <CardDescription className="text-center">
          Preencha os dados abaixo para enviar sua proposta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form 
          name="projeto-submission" 
          method="POST" 
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Campo honeypot para anti-spam (oculto) */}
          <input type="hidden" name="form-name" value="projeto-submission" />
          <div className="hidden">
            <Label htmlFor="bot-field">Não preencha este campo</Label>
            <Input id="bot-field" name="bot-field" />
          </div>

          {/* Nome completo */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-forest font-medium">
              Nome Completo *
            </Label>
            <Input
              id="nome"
              name="nome"
              type="text"
              required
              placeholder="Seu nome completo"
              className="border-forest/20 focus:border-forest"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-forest font-medium">
              Telefone *
            </Label>
            <Input
              id="telefone"
              name="telefone"
              type="tel"
              required
              placeholder="(11) 99999-9999"
              className="border-forest/20 focus:border-forest"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-forest font-medium">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="border-forest/20 focus:border-forest"
            />
          </div>

          {/* Organização */}
          <div className="space-y-2">
            <Label htmlFor="organizacao" className="text-forest font-medium">
              Organização/Empresa
            </Label>
            <Input
              id="organizacao"
              name="organizacao"
              type="text"
              placeholder="Nome da sua organização"
              className="border-forest/20 focus:border-forest"
            />
          </div>

          {/* Descrição do projeto */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-forest font-medium">
              Descrição do Projeto *
            </Label>
            <Textarea
              id="descricao"
              name="descricao"
              required
              placeholder="Descreva brevemente seu projeto e como ele se alinha com a missão do IDASAM..."
              className="border-forest/20 focus:border-forest min-h-[120px]"
            />
          </div>

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="arquivo" className="text-forest font-medium">
              Documento do Projeto (PDF, DOCX)
            </Label>
            <div className="relative">
              <Input
                id="arquivo"
                name="arquivo"
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="border-forest/20 focus:border-forest file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest file:text-white hover:file:bg-forest/90"
              />
              {fileName && (
                <div className="mt-2 flex items-center gap-2 text-sm text-forest">
                  <Upload className="w-4 h-4" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Tamanho máximo: 10MB. Formatos aceitos: PDF, DOC, DOCX
            </p>
          </div>

          {/* Botão de envio */}
          <Button 
            type="submit" 
            className="w-full bg-forest hover:bg-forest/90 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Proposta
          </Button>

          <p className="text-xs text-center text-gray-500">
            Ao enviar, você concorda com nossos termos de privacidade.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
