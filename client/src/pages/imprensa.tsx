
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

export default function ImprensaPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Gestão de Imprensa
          </CardTitle>
          <CardDescription>
            Gerencie releases, contatos de mídia e cobertura jornalística
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Página em Desenvolvimento
            </h3>
            <p className="text-gray-600">
              Esta seção será implementada em breve para gerenciar as atividades de imprensa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
