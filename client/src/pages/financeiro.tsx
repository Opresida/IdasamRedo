
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Gestão Financeira
          </CardTitle>
          <CardDescription>
            Controle de doações, despesas e relatórios financeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Página em Desenvolvimento
            </h3>
            <p className="text-gray-600">
              Esta seção será implementada em breve para controle financeiro da organização.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
