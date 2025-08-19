
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
              <div className="grid items-center gap-6 px-6 py-8 md:grid-cols-4 hover:bg-white/50 transition-colors">
                <div className="order-2 flex items-center gap-4 md:order-none">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                    {item.icon}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-forest text-lg">{item.title}</h3>
                    <p className="text-sm font-medium text-teal">
                      {item.category}
                    </p>
                  </div>
                </div>
                <p className="order-1 text-lg text-gray-700 leading-relaxed md:order-none md:col-span-2">
                  {item.description}
                </p>
                <Button 
                  variant="outline" 
                  asChild
                  className="order-3 ml-auto w-fit gap-2 md:order-none border-forest text-forest hover:bg-forest hover:text-white transition-colors"
                >
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`legal-link-${index}`}
                  >
                    <span>Ler na íntegra</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              {index < items.length - 1 && <Separator className="bg-forest/10" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
