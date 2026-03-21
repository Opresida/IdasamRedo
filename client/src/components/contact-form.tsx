
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { insertContactSubmissionSchema, type InsertContactSubmission } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<InsertContactSubmission>({
    resolver: zodResolver(insertContactSubmissionSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      organizacao: '',
      descricao: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertContactSubmission) =>
      apiRequest('POST', '/api/contact', data),
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const onSubmit = (data: InsertContactSubmission) => {
    mutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <CardContent className="pt-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Mensagem Enviada!</h3>
          <p className="text-gray-600">
            Obrigado pelo seu interesse. Entraremos em contato em breve!
          </p>
        </div>
      </CardContent>
    );
  }

  return (
    <div>
      <CardDescription className="text-center mb-6">
        Preencha os dados abaixo para enviar sua proposta
      </CardDescription>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-forest font-medium">Nome Completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome completo"
                      className="border-forest/20 focus:border-forest"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-forest font-medium">Telefone *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="border-forest/20 focus:border-forest"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-forest font-medium">Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="border-forest/20 focus:border-forest"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-forest font-medium">Organização/Empresa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da sua organização"
                      className="border-forest/20 focus:border-forest"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-forest font-medium">Descrição do Projeto *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva brevemente seu projeto e como ele se alinha com a missão do IDASAM..."
                      className="border-forest/20 focus:border-forest min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mutation.isError && (
              <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Ocorreu um erro ao enviar sua proposta. Por favor, tente novamente.</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-forest hover:bg-forest/90 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Proposta
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Ao enviar, você concorda com nossos termos de privacidade.
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
