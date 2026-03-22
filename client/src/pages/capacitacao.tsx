import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FloatingNavbar from '@/components/floating-navbar';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Calendar, Clock, MapPin, User, BookOpen, CheckCircle,
  ChevronDown, ChevronUp, AlignLeft, Users, ShieldCheck, ShieldX, Search,
  Star, Award, GraduationCap, Bell,
} from 'lucide-react';
import type { Course } from '@shared/schema';

type VerifiedCourse = {
  id: string;
  title: string;
  instructor: string;
  workload: number;
  startDate: string;
  endDate: string;
  location: string;
  authCode: string;
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'none';
}) {
  const { ref, inView } = useInView();
  const reduced = useReducedMotion();
  const translateMap = {
    up: 'translateY(28px)',
    left: 'translateX(-28px)',
    right: 'translateX(28px)',
    none: 'none',
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView || reduced ? 1 : 0,
        transform: inView || reduced ? 'none' : translateMap[direction],
        transition: reduced ? 'none' : `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function VerifySection() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedCourse | null | 'not-found'>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/courses/verify?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data as VerifiedCourse);
      } else {
        setResult('not-found');
      }
    } catch {
      setResult('not-found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-white border-t border-gray-100">
      <div className="max-w-2xl mx-auto">
        <FadeIn className="text-center mb-8">
          <ShieldCheck className="w-10 h-10 text-forest mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificar Autenticidade do Curso</h2>
          <p className="text-gray-600 text-sm">
            Digite o código de autenticação do curso para confirmar sua veracidade e visualizar as informações oficiais.
          </p>
        </FadeIn>

        <form onSubmit={handleVerify} className="mb-6">
          <label htmlFor="auth-code-input" className="block text-sm font-medium text-gray-700 mb-2">
            Código de Autenticação
          </label>
          <div className="flex gap-2">
          <Input
            id="auth-code-input"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }}
            placeholder="Ex: IDASAM-A3F7B2C1"
            className="flex-1 font-mono tracking-wider uppercase"
            maxLength={16}
          />
          <Button
            type="submit"
            className="bg-forest hover:bg-forest/90 text-white shrink-0"
            disabled={loading || !code.trim()}
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Verificando...' : 'Verificar'}
          </Button>
          </div>
        </form>

        {result === 'not-found' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ShieldX className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">Código não encontrado</p>
              <p className="text-sm text-red-600 mt-0.5">
                Verifique se o código está correto. Os dados do curso não foram localizados na base IDASAM.
              </p>
            </div>
          </div>
        )}

        {result && result !== 'not-found' && (
          <div className="p-5 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-700">Curso verificado — Autêntico</p>
                <p className="text-xs text-green-600">Constante na base de dados oficial do IDASAM</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium text-gray-900">Curso:</span> {result.title}</p>
              <p><span className="font-medium text-gray-900">Professor(a):</span> {result.instructor}</p>
              <p><span className="font-medium text-gray-900">Carga horária:</span> {result.workload}h</p>
              <p><span className="font-medium text-gray-900">Período:</span> {formatDate(result.startDate)} a {formatDate(result.endDate)}</p>
              <p><span className="font-medium text-gray-900">Local:</span> {result.location}</p>
              <p className="pt-1 border-t border-green-200 font-mono text-xs text-green-700">
                Código: {result.authCode}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const enrollmentSchema = z.object({
  courseId: z.string().uuid(),
  fullName: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

const notificationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
});

type EnrollmentForm = z.infer<typeof enrollmentSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function CourseCard({ course, onEnroll }: { course: Course; onEnroll: (c: Course) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="flex flex-col h-full border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-forest/40 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold leading-snug text-forest">
            {course.title}
          </CardTitle>
          {course.vacancies && (
            <Badge variant="outline" className="shrink-0 text-xs border-forest/30 text-forest">
              <Users className="w-3 h-3 mr-1" />
              {course.vacancies} vagas
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-0">
        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-forest flex-shrink-0" />
            <span>{course.instructor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest flex-shrink-0" />
            <span>{course.workload}h de carga horária
              {course.schedule ? ` • ${course.schedule}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-forest flex-shrink-0" />
            <span>{formatDate(course.startDate)} a {formatDate(course.endDate)}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
            <div>
              <span>{course.location}</span>
              {course.address && (
                <p className="text-xs text-gray-500 mt-0.5">{course.address}</p>
              )}
            </div>
          </div>
        </div>

        {course.curriculum && (
          <div className="mb-4">
            <button
              className="flex items-center gap-1 text-sm font-medium text-forest hover:text-forest/80 transition-colors"
              onClick={() => setExpanded((v) => !v)}
            >
              <AlignLeft className="w-4 h-4" />
              Conteúdo Programático
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700 whitespace-pre-line">
                {course.curriculum}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto">
          <Button
            className="w-full bg-forest hover:bg-forest/90 text-white"
            onClick={() => onEnroll(course)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Inscrever-se
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const TESTIMONIALS = [
  {
    img: 'https://i.pravatar.cc/150?img=1',
    name: 'Ana Paula Souza',
    city: 'Manaus – AM',
    text: 'O curso de Transformação Digital mudou a forma como vejo meu negócio. Aprendi ferramentas práticas que já estou aplicando na minha empresa.',
  },
  {
    img: 'https://i.pravatar.cc/150?img=5',
    name: 'Carlos Mendes',
    city: 'Parintins – AM',
    text: 'Nunca imaginei que teria acesso a uma capacitação de qualidade sem sair do Amazonas. O IDASAM trouxe esse conteúdo de excelência para nós.',
  },
  {
    img: 'https://i.pravatar.cc/150?img=9',
    name: 'Fernanda Lima',
    city: 'Tefé – AM',
    text: 'O curso de Lean Manufacturing foi incrível. Os professores são muito qualificados e o conteúdo é completamente aplicável ao nosso contexto amazônico.',
  },
  {
    img: 'https://i.pravatar.cc/150?img=12',
    name: 'Rafael Teixeira',
    city: 'Itacoatiara – AM',
    text: 'Consegui uma promoção logo após concluir o curso de IA Industrial. O certificado do IDASAM tem muito reconhecimento no mercado.',
  },
  {
    img: 'https://i.pravatar.cc/150?img=20',
    name: 'Juliana Costa',
    city: 'Manacapuru – AM',
    text: 'Excelente metodologia de ensino. As aulas são dinâmicas e o material didático é de altíssima qualidade. Recomendo a todos os profissionais da região.',
  },
  {
    img: 'https://i.pravatar.cc/150?img=25',
    name: 'Marcos Oliveira',
    city: 'Coari – AM',
    text: 'A trilha de capacitação do IDASAM me ajudou a estruturar minha carreira. Completei três cursos e cada um complementou o anterior perfeitamente.',
  },
];

function TestimonialsSection() {
  const [startIdx, setStartIdx] = useState(0);
  const [visible, setVisible] = useState(3);
  const reducedMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibleRef = useRef(visible);

  const getVisible = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  useEffect(() => {
    const update = () => {
      const v = getVisible();
      setVisible(v);
      visibleRef.current = v;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    if (reducedMotion) return;
    timerRef.current = setInterval(() => {
      setStartIdx((i) => {
        const maxS = Math.max(0, TESTIMONIALS.length - visibleRef.current);
        return i >= maxS ? 0 : i + 1;
      });
    }, 5000);
  }, [clearTimer, reducedMotion]);

  useEffect(() => {
    resetTimer();
    return clearTimer;
  }, [resetTimer, clearTimer]);

  const maxStart = Math.max(0, TESTIMONIALS.length - visible);

  const prev = useCallback(() => {
    setStartIdx((i) => Math.max(0, i - 1));
    resetTimer();
  }, [resetTimer]);

  const next = useCallback(() => {
    setStartIdx((i) => Math.min(Math.max(0, TESTIMONIALS.length - visibleRef.current), i + 1));
    resetTimer();
  }, [resetTimer]);

  const cardWidthPct = 100 / visible;
  const gapPx = 24;

  return (
    <section className="py-16 px-4 bg-forest/5 border-t border-forest/10">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-10">
          <Star className="w-8 h-8 text-forest mx-auto mb-3 fill-forest/20" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">O que dizem nossos alunos</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Histórias reais de profissionais que transformaram suas carreiras com a capacitação do IDASAM.
          </p>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex"
                style={{
                  gap: `${gapPx}px`,
                  transform: `translateX(calc(-${startIdx * cardWidthPct}% - ${startIdx * gapPx}px))`,
                  transition: reducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {TESTIMONIALS.map((t, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0"
                    style={{ width: `calc(${cardWidthPct}% - ${((visible - 1) * gapPx) / visible}px)` }}
                  >
                    <Card className="h-full border border-forest/15 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-forest/30">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={t.img}
                            alt={t.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-forest/20 transition-transform duration-300 hover:scale-110"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                            <p className="text-xs text-forest flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {t.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex mb-3">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed italic flex-1">"{t.text}"</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={prev}
                disabled={startIdx === 0}
                className="border-forest/30 text-forest hover:bg-forest/10 transition-colors"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </Button>
              <div className="flex gap-1.5">
                {Array.from({ length: maxStart + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setStartIdx(i); resetTimer(); }}
                    className={`rounded-full transition-all duration-300 ${
                      i === startIdx
                        ? 'bg-forest w-4 h-2'
                        : 'bg-forest/25 hover:bg-forest/50 w-2 h-2'
                    }`}
                    aria-label={`Ir para slide ${i + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={next}
                disabled={startIdx >= maxStart}
                className="border-forest/30 text-forest hover:bg-forest/10 transition-colors"
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

const LEARNING_STEPS = [
  {
    stage: '01',
    title: 'Formação Básica',
    icon: BookOpen,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    iconColor: 'text-blue-500',
    dot: 'bg-blue-500',
    courses: ['Transformação Digital', 'Inovação Tecnológica na Indústria'],
    description: 'Fundamentos essenciais para iniciar sua jornada na capacitação profissional IDASAM. Ideal para quem está começando ou quer atualizar seus conhecimentos base.',
  },
  {
    stage: '02',
    title: 'Especialização',
    icon: GraduationCap,
    color: 'bg-forest/10 border-forest/25 text-forest',
    iconColor: 'text-forest',
    dot: 'bg-forest',
    courses: ["Aplicação de IA's em ambientes Industriais", 'Lean Manufacturing aplicada à Indústria 4.0', 'Logística e Cadeia de Suprimentos'],
    description: 'Aprofunde conhecimentos em áreas específicas com metodologias práticas e professores especializados no contexto amazônico e industrial.',
  },
  {
    stage: '03',
    title: 'Certificação Avançada',
    icon: Award,
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    iconColor: 'text-amber-500',
    dot: 'bg-amber-500',
    courses: ['Processos avaliativos da maturidade da Indústria 4.0'],
    description: 'O nível máximo de reconhecimento IDASAM. Demonstre domínio avançado e receba certificação de alto valor para o mercado do Amazonas.',
  },
];

function LearningTrailSection() {
  return (
    <section className="py-16 px-4 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <GraduationCap className="w-8 h-8 text-forest mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Trilha de Aprendizado</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Siga a progressão estruturada do IDASAM para maximizar seu desenvolvimento profissional.
          </p>
        </FadeIn>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gray-200 -translate-x-1/2" />

          <div className="space-y-8">
            {LEARNING_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isRight = i % 2 === 1;
              return (
                <FadeIn key={i} delay={i * 120} direction={isRight ? 'right' : 'left'}>
                  <div className={`relative flex items-start gap-6 md:gap-0 ${isRight ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full items-center justify-center bg-white border-2 border-gray-200 z-10">
                      <div className={`w-4 h-4 rounded-full ${step.dot}`} />
                    </div>

                    <div className={`w-full md:w-5/12 ${isRight ? 'md:pl-12' : 'md:pr-12'}`}>
                      <Card className={`border ${step.color} shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-white/70 transition-transform duration-300 group-hover:scale-110">
                              <Icon className={`w-5 h-5 ${step.iconColor}`} />
                            </div>
                            <div>
                              <span className="text-xs font-semibold opacity-60">Etapa {step.stage}</span>
                              <h3 className="text-base font-bold leading-tight">{step.title}</h3>
                            </div>
                          </div>
                          <p className="text-sm opacity-80 mb-3 leading-relaxed">{step.description}</p>
                          <div className="space-y-1.5">
                            {step.courses.map((c, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm">
                                <CheckCircle className={`w-3.5 h-3.5 ${step.iconColor} flex-shrink-0`} />
                                <span className="opacity-90">{c}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Como faço para me inscrever em um curso?',
    a: 'Basta clicar no botão "Inscrever-se" no card do curso desejado, preencher seus dados (nome, CPF, telefone e e-mail) e confirmar. A inscrição é gratuita e imediata.',
  },
  {
    q: 'Os cursos têm algum custo?',
    a: 'Os cursos do IDASAM são gratuitos para os participantes. Nossa missão é democratizar o acesso à capacitação profissional de qualidade no Amazonas.',
  },
  {
    q: 'Como obtenho meu certificado após concluir o curso?',
    a: 'Após a conclusão do curso e aprovação, o IDASAM emite um certificado digital em PDF. Você pode acessá-lo na página "Meu Certificado" utilizando seu CPF, e-mail ou nome completo.',
  },
  {
    q: 'Os cursos são presenciais ou online?',
    a: 'A maioria dos cursos é presencial em Manaus – AM. Alguns podem ter componentes híbridos. Consulte as informações específicas de cada curso para o formato e local.',
  },
  {
    q: 'Preciso de alguma formação prévia para participar?',
    a: 'Não há pré-requisito de formação acadêmica para a maioria dos cursos. São voltados a profissionais em exercício, empreendedores e estudantes que atuam ou desejam atuar no setor produtivo do Amazonas.',
  },
  {
    q: 'Qual é o material didático fornecido?',
    a: 'Todo o material didático é fornecido gratuitamente pelo IDASAM em formato digital. Os participantes recebem apostilas, apresentações e materiais complementares preparados pelos instrutores.',
  },
  {
    q: 'Como entro em contato para mais informações?',
    a: 'Você pode nos contatar através da página "Proposta" no site, enviando suas dúvidas e informações de contato. Nossa equipe responderá em até 2 dias úteis.',
  },
];

function FAQSection() {
  return (
    <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Perguntas Frequentes</h2>
          <p className="text-gray-600">
            Tire suas dúvidas sobre os cursos e o processo de inscrição do IDASAM.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <Accordion type="single" collapsible className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-0 px-4 transition-colors hover:bg-forest/3">
                <AccordionTrigger className="text-left text-gray-900 font-medium py-4 hover:no-underline hover:text-forest transition-colors">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

function PartnersAndNotificationsSection() {
  const { toast } = useToast();
  const [notified, setNotified] = useState(false);

  const form = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { name: '', email: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: NotificationForm) => apiRequest('POST', '/api/course-notifications', data),
    onSuccess: () => {
      setNotified(true);
      toast({ title: 'Inscrito com sucesso!', description: 'Você receberá notificações sobre novos cursos.' });
      queryClient.invalidateQueries({ queryKey: ['/api/course-notifications'] });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível registrar. Tente novamente.', variant: 'destructive' });
    },
  });

  return (
    <section className="py-16 px-4 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Parceiros e Apoiadores</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            O IDASAM atua em parceria com organizações comprometidas com o desenvolvimento do Amazonas.
          </p>
        </FadeIn>

        <FadeIn delay={100} className="flex justify-center mb-14">
          <div className="flex items-center justify-center w-48 h-28 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <img
              src="https://i.imgur.com/7eGkdW0.png"
              alt="GBR Componentes"
              className="max-w-full max-h-full object-contain p-4"
            />
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="max-w-xl mx-auto bg-forest/5 rounded-2xl border border-forest/15 p-8">
            <div className="text-center mb-6">
              <Bell className="w-8 h-8 text-forest mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">Quero ser notificado</h3>
              <p className="text-gray-600 text-sm">
                Cadastre seu e-mail e seja o primeiro a saber sobre novos cursos e vagas disponíveis.
              </p>
            </div>

            {notified ? (
              <div className="flex flex-col items-center py-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                <p className="font-semibold text-gray-900">Cadastro realizado!</p>
                <p className="text-sm text-gray-600 mt-1">Você receberá nossas próximas novidades por e-mail.</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button
                    type="submit"
                    className="w-full bg-forest hover:bg-forest/90 text-white"
                    disabled={mutation.isPending}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {mutation.isPending ? 'Cadastrando...' : 'Quero ser notificado'}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function CapacitacaoPage() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const form = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { courseId: '', fullName: '', cpf: '', phone: '', email: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: EnrollmentForm) => apiRequest('POST', '/api/enrollments', data),
    onSuccess: () => {
      setEnrolled(true);
      toast({ title: 'Inscrição realizada!', description: 'Sua inscrição foi confirmada com sucesso.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível realizar a inscrição. Tente novamente.', variant: 'destructive' });
    },
  });

  const openEnrollDialog = (course: Course) => {
    setSelectedCourse(course);
    setEnrolled(false);
    form.reset({ courseId: course.id, fullName: '', cpf: '', phone: '', email: '' });
  };

  return (
    <div className="font-inter bg-sand text-gray-800 min-h-screen">
      <FloatingNavbar />

      {/* Hero */}
      <section className="bg-forest text-white pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <Badge className="bg-white/20 text-white border-white/30 mb-4">IDASAM 2026</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Capacitação Profissional</h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Desenvolva competências para atuar no desenvolvimento sustentável da Amazônia.
              Inscreva-se nos nossos cursos de 2026 e avance na sua carreira.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Courses */}
      <section className="py-16 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Cursos Disponíveis — Cronograma 2026
            </h2>
          </FadeIn>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
            </div>
          ) : courses.length === 0 ? (
            <FadeIn delay={100} className="text-center py-16 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Nenhum curso disponível no momento</p>
              <p className="text-sm mt-1">Em breve novos cursos serão publicados.</p>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <FadeIn key={course.id} delay={i * 80} className="h-full">
                  <CourseCard course={course} onEnroll={openEnrollDialog} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Learning Trail */}
      <LearningTrailSection />

      {/* FAQ */}
      <FAQSection />

      {/* Partners & Notifications */}
      <PartnersAndNotificationsSection />

      {/* Enrollment Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-forest">
              {enrolled ? 'Inscrição Confirmada!' : 'Inscrição no Curso'}
            </DialogTitle>
          </DialogHeader>

          {enrolled ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inscrição realizada com sucesso!</h3>
              <p className="text-gray-600 text-sm mb-2">Você está inscrito em:</p>
              <p className="font-medium text-forest mb-4">{selectedCourse?.title}</p>
              <p className="text-sm text-gray-500">
                Após a conclusão do curso, acesse{' '}
                <a href="/meu-certificado" className="text-forest underline">Meu Certificado</a>{' '}
                para baixar seu diploma.
              </p>
              <Button className="mt-6 bg-forest hover:bg-forest/90 text-white" onClick={() => setSelectedCourse(null)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-forest mb-1">{selectedCourse?.title}</p>
                {selectedCourse?.schedule && (
                  <p className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {selectedCourse.schedule}
                  </p>
                )}
                {selectedCourse?.startDate && (
                  <p className="text-xs text-gray-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(selectedCourse.startDate)} a {formatDate(selectedCourse.endDate)}
                  </p>
                )}
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cpf" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl><Input placeholder="(92) 99999-9999" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedCourse(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 bg-forest hover:bg-forest/90 text-white" disabled={mutation.isPending}>
                      {mutation.isPending ? 'Inscrevendo...' : 'Confirmar Inscrição'}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <VerifySection />
      <ShadcnblocksComFooter2 />
    </div>
  );
}
