import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, ArrowRight, BookOpen, Award, Users } from 'lucide-react';
import { Link } from 'wouter';

export default function CapacitacaoSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-forest/5 via-white to-teal/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <div>
            <Badge className="bg-forest/10 text-forest border-forest/20 mb-4">
              Novo em 2026
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Capacitação Profissional
              <span className="block text-forest">IDASAM 2026</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              O IDASAM oferece cursos de capacitação focados em Indústria 4.0 e transformação digital.
              Aprenda com especialistas e obtenha certificado reconhecido em 6 áreas estratégicas — 
              todos em março de 2026, presencialmente em Manaus.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <BookOpen className="w-6 h-6 text-forest mx-auto mb-2" />
                <div className="font-bold text-2xl text-gray-900">6</div>
                <div className="text-xs text-gray-500">Cursos</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <Users className="w-6 h-6 text-forest mx-auto mb-2" />
                <div className="font-bold text-2xl text-gray-900">120h</div>
                <div className="text-xs text-gray-500">Carga total</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <Award className="w-6 h-6 text-forest mx-auto mb-2" />
                <div className="font-bold text-2xl text-gray-900">PDF</div>
                <div className="text-xs text-gray-500">Certificado</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/capacitacao">
                <Button className="bg-forest hover:bg-forest/90 text-white gap-2">
                  Ver Cursos e Inscrever-se
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/meu-certificado">
                <Button variant="outline" className="border-forest text-forest hover:bg-forest/5 gap-2">
                  <Award className="w-4 h-4" />
                  Baixar Meu Certificado
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual side */}
          <div className="relative">
            <div className="bg-forest rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

              <GraduationCap className="w-10 h-10 mb-4 text-white/80" />
              <h3 className="text-xl font-bold mb-4">Cronograma – Março 2026</h3>
              <ul className="space-y-3 relative z-10">
                {[
                  "Aplicação de IA's em ambientes Industriais",
                  'Transformação Digital',
                  'Lean Manufacturing aplicada à Indústria 4.0',
                  'Inovação Tecnológica na Indústria',
                  'Processos avaliativos da maturidade da indústria 4.0',
                  'Logística e Cadeia de Suprimentos',
                ].map((area, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
