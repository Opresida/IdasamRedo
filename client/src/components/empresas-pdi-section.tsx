import { ArrowRight, Lightbulb } from 'lucide-react';

interface Empresa {
  id: string;
  name: string;
  logo: string;
  description: string;
}

const empresas: Empresa[] = [
  {
    id: "audax",
    name: "Audax",
    logo: "https://i.imgur.com/A0LdbeZ.png",
    description: "A Audax é uma das principais marcas de bicicletas premium do Brasil. Ela faz parte do Grupo Claudino, um conglomerado empresarial gigante sediado em Teresina (Piauí), que também é dono da marca Houston (focada em bikes de entrada).",
  },
  {
    id: "gbr-componentes",
    name: "GBR Componentes",
    logo: "https://i.imgur.com/7eGkdW0.png",
    description: "A GBR Componentes (oficialmente GBR Componentes da Amazônia) é o braço industrial do Grupo Claudino responsável pela fabricação de peças e partes para as bicicletas das marcas Audax e Houston.",
  },
];

export default function EmpresasPdiSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden" data-testid="empresas-pdi-section">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A5B46]/5 via-transparent to-[#4E8D7C]/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#2A5B46]/10 text-[#2A5B46] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Lightbulb className="w-4 h-4" />
            Pesquisa, Desenvolvimento & Inovação
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2A5B46] mb-4" data-testid="pdi-title">
            Empresas atendidas pelo PD&I
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conheça as empresas que confiam no IDASAM para impulsionar inovação e competitividade na região amazônica.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {empresas.map((empresa) => (
            <div
              key={empresa.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-[#4E8D7C]/20 transition-all duration-300 overflow-hidden group"
              data-testid={`empresa-card-${empresa.id}`}
            >
              <div className="flex items-center justify-center bg-gray-50 p-8 border-b border-gray-100 group-hover:bg-[#2A5B46]/5 transition-colors duration-300">
                <img
                  src={empresa.logo}
                  alt={`Logo ${empresa.name}`}
                  className="max-h-24 max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6 lg:p-8">
                <h3 className="text-2xl font-bold text-[#2A5B46] mb-3">{empresa.name}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{empresa.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#2A5B46] to-[#4E8D7C] rounded-2xl p-8 md:p-12 text-center shadow-xl" data-testid="pdi-cta">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Seja você nosso próximo projeto PD&I
          </h3>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Transforme sua empresa com soluções de pesquisa, desenvolvimento e inovação sob medida para a realidade amazônica.
          </p>
          <a
            href="#contato"
            className="inline-flex items-center gap-2 bg-white text-[#2A5B46] font-bold py-4 px-8 rounded-xl text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            data-testid="pdi-cta-button"
          >
            Saber Mais
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
