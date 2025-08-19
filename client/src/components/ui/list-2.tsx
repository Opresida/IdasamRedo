import {
  ArrowRight,
  Scale,
  FileText,
  Gavel,
  BookOpen,
  Shield,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ListItem {
  icon: React.ReactNode;
  title: string;
  category: string;
  description: string;
  link: string;
}

interface List2Props {
  heading?: string;
  items?: ListItem[];
}

export const List2 = ({
  heading = "Marco Legal e Regulamentações",
  items = [
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Lei Nº 3.095 de 17/11/2006",
      category: "Inovação e Pesquisa",
      description: "Dispõe sobre incentivos à inovação e à pesquisa científica e tecnológica no ambiente produtivo no âmbito do Estado do Amazonas.",
      link: "https://sapl.al.am.leg.br/media/sapl/public/normajuridica/2006/7550/7550_texto_integral.pdf",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Lei Nº 4940 de 04/10/2019",
      category: "Empreendedorismo",
      description: "Dispõe sobre a Política Estadual de Incentivo ao Empreendedorismo e o Desenvolvimento da Indústria 4.0.",
      link: "https://www.legisweb.com.br/legislacao/?id=383247",
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "Lei Estadual Nº 4.985 de 31/10/2019",
      category: "Marco Legal",
      description: "Marco Legal das Startups no Estado do Amazonas.",
      link: "https://sistemas.sefaz.am.gov.br/silt/",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "DOM 3323 03.01.2014",
      category: "Utilidade Pública",
      description: "Considera-se de Utilidade Pública o Instituto de Desenvolvimento Ambiental e Social da Amazônia (Idasam).",
      link: "https://www.idasam.org/_files/ugd/f50247_65431613b72b49988937ccc4091a6e0f.pdf",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "DOE 15.12.2011 LEI 3.686",
      category: "Reconhecimento",
      description: "Considera como utilidade pública a ASSOCIAÇÃO DOS AMIGOS DO PROJETO CULTURAL 'VIDA ABUNDANTE'.",
      link: "https://www.idasam.org/_files/ugd/f50247_4ec4937911964e7382945fd3057ee687.pdf",
    },
  ],
}: List2Props) => {
  return (
    <section id="legislacao" className="py-20 bg-white" data-testid="legal-framework-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="border border-forest/20 py-2 px-6 rounded-full bg-sand/50 backdrop-blur-sm">
              <span className="text-forest font-medium">Marco Legal</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-forest mb-6" data-testid="legal-framework-title">
            {heading}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="legal-framework-description">
            O IDASAM opera em conformidade com as principais legislações que regem a inovação, 
            pesquisa e desenvolvimento sustentável no Estado do Amazonas.
          </p>
        </div>

        <div className="flex flex-col bg-sand/30 rounded-2xl overflow-hidden shadow-lg">
          <Separator className="bg-forest/10" />
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col sm:flex-row items-start p-4 sm:p-6 hover:bg-sand/20 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-forest/10 rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 group-hover:bg-forest/20 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-forest" data-testid={`legal-item-title-${index}`}>
                      {item.title}
                    </h3>
                    <span className="px-2 sm:px-3 py-1 bg-forest/10 text-forest text-xs sm:text-sm rounded-full font-medium w-fit">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3" data-testid={`legal-item-description-${index}`}>
                    {item.description}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-forest hover:text-forest/80 transition-colors text-sm font-medium group"
                    data-testid={`legal-item-link-${index}`}
                  >
                    Ver documento completo
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
              {index < items.length - 1 && <Separator className="bg-forest/10" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};