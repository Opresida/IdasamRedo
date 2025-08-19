
import React, { useState } from 'react';
import { X } from 'lucide-react';

// Dados dos projetos organizados por categoria
const projectsData = {
  bioeconomia: [
    {
      id: 1,
      title: "Projeto Curupira (Fecularia de Mandioca)",
      shortDescription: "Implantar uma fecularia de mandioca em municípios remotos do Amazonas para promover a agricultura familiar e a sustentabilidade.",
      fullDescription: "Implantar uma fecularia de mandioca em municípios remotos do Amazonas para promover a agricultura familiar e a sustentabilidade. A iniciativa visa reduzir a dependência de fécula de outras regiões, fomentando a produção local de fécula de mandioca, goma de tapioca, tucupi e farinha. Utiliza práticas ecológicas como energia solar, captação de água da chuva e reciclagem de resíduos para adubo e ração.",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <path d="M32 8c-8 0-16 4-20 12-2 4-2 8 0 12 4 8 12 12 20 12s16-4 20-12c2-4 2-8 0-12-4-8-12-12-20-12z" fill="#4E8D7C"/>
          <path d="M28 20c-2 0-4 2-4 4v16c0 2 2 4 4 4h8c2 0 4-2 4-4V24c0-2-2-4-4-4h-8z" fill="#2A5B46"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Goma Sustentável: Produção em Roraima",
      shortDescription: "Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores e comunidades.",
      fullDescription: "Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores e comunidades em práticas de cultivo e processamento que aumentem a produtividade e a qualidade, preservando os recursos naturais. O projeto visa fortalecer a economia local, agregar valor com certificações e integrar comunidades rurais e indígenas.",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="20" fill="#4E8D7C"/>
          <path d="M32 20l8 8-8 8-8-8z" fill="#2A5B46"/>
          <path d="M24 32c0-4 4-8 8-8s8 4 8 8" stroke="#FBBF24" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 3,
      title: "Produção de Biofertilizantes e Insumos",
      shortDescription: "Produzir biofertilizantes e insumos agropecuários a partir de resíduos sólidos orgânicos.",
      fullDescription: "Produzir biofertilizantes e insumos agropecuários a partir de resíduos sólidos orgânicos para mitigar impactos ambientais. A indústria será instalada em parceria com o IDASAM, respeitando as características ambientais e socioculturais da região, com foco em sustentabilidade e segurança alimentar.",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <path d="M32 8l-8 16h16l-8-16z" fill="#4E8D7C"/>
          <ellipse cx="32" cy="40" rx="16" ry="8" fill="#2A5B46"/>
          <path d="M28 32c0-2 2-4 4-4s4 2 4 4v8h-8v-8z" fill="#FBBF24"/>
        </svg>
      )
    },
    {
      id: 4,
      title: "Produção de Camarão Amazônico e Obtenção de Quitosana",
      shortDescription: "Criar um módulo sustentável para a produção de camarão amazônico e extração de quitosana.",
      fullDescription: "Criar um módulo sustentável para a produção de camarão amazônico e extração de quitosana (substância com aplicações farmacêuticas e industriais) na região de Parintins. O projeto promove o desenvolvimento econômico e social via cooperativas, garantindo a preservação ambiental, com foco na qualidade da água e no habitat natural do camarão.",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <path d="M16 32c0-8 8-16 16-16s16 8 16 16c0 4-2 8-4 10l-12 4-12-4c-2-2-4-6-4-10z" fill="#4E8D7C"/>
          <circle cx="28" cy="28" r="2" fill="#2A5B46"/>
          <circle cx="36" cy="28" r="2" fill="#2A5B46"/>
          <path d="M24 40l8-4 8 4" stroke="#FBBF24" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 5,
      title: "Biossíntese de Cogumelos Amazônicos",
      shortDescription: "Promover a produção sustentável de cogumelos comestíveis na região amazônica.",
      fullDescription: "Promover a produção sustentável de cogumelos comestíveis na região amazônica. A iniciativa envolve a melhoria de laboratórios e a capacitação de recursos humanos para desenvolver uma cadeia produtiva sustentável, gerando impactos econômicos, ambientais e sociais positivos para as comunidades locais através de cooperativas.",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <ellipse cx="20" cy="40" rx="8" ry="12" fill="#4E8D7C"/>
          <ellipse cx="32" cy="36" rx="6" ry="10" fill="#4E8D7C"/>
          <ellipse cx="44" cy="42" rx="7" ry="11" fill="#4E8D7C"/>
          <rect x="18" y="52" width="4" height="8" fill="#2A5B46"/>
          <rect x="30" y="46" width="4" height="8" fill="#2A5B46"/>
          <rect x="42" y="53" width="4" height="8" fill="#2A5B46"/>
        </svg>
      )
    },
    {
      id: 6,
      title: "Chás Medicinais Amazônicos Liofilizados",
      shortDescription: "Desenvolver um modelo de produção sustentável de chás medicinais amazônicos liofilizados.",
      fullDescription: "Desenvolver um modelo de produção sustentável e geração de renda a partir de chás medicinais amazônicos liofilizados. O projeto busca melhorar a renda de comunidades ribeirinhas e povos primitivos, manter a 'floresta em pé' e contribuir para a fixação de habitantes no interior da Amazônia.",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="40" rx="16" ry="8" fill="#4E8D7C"/>
          <rect x="28" y="24" width="8" height="16" fill="#2A5B46"/>
          <path d="M20 24c0-4 4-8 8-8h8c4 0 8 4 8 8" stroke="#FBBF24" strokeWidth="2" fill="none"/>
          <path d="M24 20l4-4 4 4 4-4" stroke="#FBBF24" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 7,
      title: "Cesta Verde (Reaproveitamento de Alimentos)",
      shortDescription: "Reduzir o desperdício de alimentos na região amazônica através da coleta e reaproveitamento.",
      fullDescription: "Reduzir o desperdício de alimentos na região amazônica através da coleta e reaproveitamento de frutas e vegetais descartados em feiras e mercados. O projeto visa gerar emprego, renda e contribuir para a segurança alimentar, alinhado com os Objetivos de Desenvolvimento Sustentável (ODS).",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <path d="M16 24h32l-4 24H20l-4-24z" fill="#4E8D7C"/>
          <circle cx="24" cy="32" r="3" fill="#FBBF24"/>
          <circle cx="32" cy="28" r="3" fill="#2A5B46"/>
          <circle cx="40" cy="34" r="3" fill="#FBBF24"/>
          <path d="M20 24c0-4 4-8 8-8h8c4 0 8 4 8 8" stroke="#2A5B46" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 8,
      title: "CEIBA: Centro de Inovação e Biotecnologia da Amazônia",
      shortDescription: "Criar uma infraestrutura de ponta para promover a formação de profissionais qualificados.",
      fullDescription: "Criar uma infraestrutura de ponta para promover a formação de profissionais qualificados e apoiar a produção nas áreas de Bioeconomia e Biotecnologia. O centro será construído seguindo altos padrões ambientais, com uso de energia renovável e minimização de resíduos, fomentando o desenvolvimento regional.",
      category: "Bioeconomia",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="20" fill="#4E8D7C"/>
          <rect x="24" y="24" width="16" height="16" rx="2" fill="#2A5B46"/>
          <rect x="28" y="28" width="8" height="8" fill="#FBBF24"/>
          <path d="M16 32c8-8 8-8 16 0s8 8 16 0" stroke="#FBBF24" strokeWidth="2" fill="none"/>
        </svg>
      )
    }
  ],
  sustentabilidade: [
    {
      id: 9,
      title: "Projeto Plantio Sustentável",
      shortDescription: "Capacitar pequenos agricultores em práticas de plantio sustentável usando tecnologia.",
      fullDescription: "Capacitar pequenos agricultores, comunidades indígenas e assentamentos rurais em Roraima em práticas de plantio sustentável. O objetivo é aumentar a produtividade agrícola com menor impacto ambiental, promovendo a preservação dos recursos naturais e a geração de renda local através de técnicas de manejo de solos, insumos orgânicos e conservação de água.",
      category: "Sustentabilidade",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <rect x="24" y="40" width="16" height="8" fill="#4E8D7C"/>
          <path d="M28 16l4 8 4-8M32 24v16" stroke="#2A5B46" strokeWidth="2"/>
          <circle cx="32" cy="16" r="4" fill="#FBBF24"/>
          <path d="M16 32l8-4 8 4 8-4 8 4" stroke="#4E8D7C" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 10,
      title: "Tratamento de Resíduos Sólidos",
      shortDescription: "Implementar soluções para o tratamento de resíduos sólidos nos municípios da Amazônia.",
      fullDescription: "Implementar soluções para o tratamento de resíduos sólidos nos municípios da Amazônia, com foco na sustentabilidade. A proposta visa cessar a poluição dos lençóis freáticos e revitalizar áreas degradadas, transformando-as em parques. Utiliza tecnologia inovadora para a produção de hidrogênio verde.",
      category: "Sustentabilidade",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <path d="M32 8l8 8v8l-8 8-8-8v-8z" fill="#4E8D7C"/>
          <path d="M24 32l8-8 8 8v8l-8 8-8-8z" fill="#2A5B46"/>
          <path d="M32 40l0 8M28 44l8 0M30 46l4 0" stroke="#FBBF24" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 11,
      title: "Smart Amazônia: Cidades Inteligentes e Sustentáveis",
      shortDescription: "Transformar municípios da Amazônia em cidades inteligentes com tecnologia avançada.",
      fullDescription: "Transformar municípios da Amazônia em cidades inteligentes, integrando tecnologia avançada, sustentabilidade e inovação. A iniciativa busca modernizar a infraestrutura urbana, promovendo energias renováveis, sistemas inteligentes de transporte e gestão eficiente de recursos naturais através de plataformas digitais (IoT).",
      category: "Sustentabilidade",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <rect x="16" y="32" width="8" height="16" fill="#4E8D7C"/>
          <rect x="28" y="24" width="8" height="24" fill="#4E8D7C"/>
          <rect x="40" y="28" width="8" height="20" fill="#4E8D7C"/>
          <path d="M32 16c4 0 8 4 8 8M32 16c-4 0-8 4-8 8M32 16v-4" stroke="#FBBF24" strokeWidth="2" fill="none"/>
          <path d="M24 20l4-4 4 4 4-4 4 4" stroke="#2A5B46" strokeWidth="1" fill="none"/>
        </svg>
      )
    },
    {
      id: 12,
      title: "Projeto Míraia – Sentinela Viva da Amazônia",
      shortDescription: "Solução tecnológica com IA para monitoramento e combate a queimadas na Amazônia.",
      fullDescription: "Solução tecnológica e territorial que utiliza Inteligência Artificial (IA) para monitoramento, prevenção e combate inteligente a queimadas na Amazônia Legal. Combina satélites, sensores IoT, drones e IA com a força de brigadas indígenas e comunitárias para promover proteção ambiental e resposta rápida.",
      category: "Sustentabilidade",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="16" fill="#4E8D7C"/>
          <circle cx="32" cy="32" r="8" fill="#2A5B46"/>
          <circle cx="32" cy="32" r="4" fill="#FBBF24"/>
          <path d="M32 16v-8M48 32h8M32 48v8M16 32h-8" stroke="#2A5B46" strokeWidth="2"/>
          <path d="M24 40l-4 4M40 40l4 4M40 24l4-4M24 24l-4-4" stroke="#4E8D7C" strokeWidth="1"/>
        </svg>
      )
    }
  ],
  saude: [
    {
      id: 13,
      title: "Projeto SALTA-Z (Filtragem de Água)",
      shortDescription: "Atender comunidades na Amazônia com sistema de filtragem de água usando zeólita.",
      fullDescription: "Atender comunidades na Amazônia com dificuldades de acesso à água potável, utilizando a zeólita como meio filtrante. O sistema oferece uma solução sustentável para a remoção de metais pesados, amônia e outras impurezas da água de poços e mananciais, melhorando a qualidade de vida e a saúde pública.",
      category: "Saúde e Social",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <path d="M32 8c-4 0-8 4-8 8v8c0 4 4 8 8 8s8-4 8-8v-8c0-4-4-8-8-8z" fill="#4E8D7C"/>
          <circle cx="32" cy="40" r="8" fill="#2A5B46"/>
          <path d="M28 20h8M28 24h8M28 28h8" stroke="#FBBF24" strokeWidth="1"/>
          <path d="M32 32v8" stroke="#FBBF24" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 14,
      title: "Saúde Digital para os Povos Originários da Amazônia",
      shortDescription: "Levar atendimento médico especializado a comunidades indígenas remotas via telemedicina.",
      fullDescription: "Levar atendimento médico especializado a comunidades indígenas remotas da Amazônia utilizando telemedicina. A iniciativa inclui a instalação de internet via satélite, fornecimento de dispositivos para consultas virtuais e capacitação de agentes comunitários de saúde para melhorar o acesso à saúde e reduzir deslocamentos.",
      category: "Saúde e Social",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <rect x="16" y="24" width="32" height="20" rx="4" fill="#4E8D7C"/>
          <rect x="20" y="28" width="24" height="12" fill="#2A5B46"/>
          <path d="M28 34h8M32 30v8" stroke="#FBBF24" strokeWidth="3"/>
          <circle cx="24" cy="20" r="4" fill="#4E8D7C"/>
          <path d="M28 16l4 4" stroke="#2A5B46" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 15,
      title: "Carreta da Saúde – Saúde Itinerante",
      shortDescription: "Levar atendimento médico a comunidades rurais usando uma carreta adaptada.",
      fullDescription: "Levar atendimento médico a comunidades rurais e áreas isoladas de Roraima. A iniciativa utiliza uma carreta adaptada com consultórios médicos, oftalmológicos e odontológicos para oferecer atendimento completo, com capacidade para atender até 3.000 pessoas por mês, melhorando o acesso à saúde para populações que enfrentam barreiras geográficas.",
      category: "Saúde e Social",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="32" width="40" height="16" rx="2" fill="#4E8D7C"/>
          <circle cx="20" cy="52" r="4" fill="#2A5B46"/>
          <circle cx="44" cy="52" r="4" fill="#2A5B46"/>
          <path d="M28 36h8M32 32v8" stroke="#FBBF24" strokeWidth="3"/>
          <rect x="16" y="24" width="8" height="8" fill="#2A5B46"/>
        </svg>
      )
    },
    {
      id: 16,
      title: "Renova Mulher: Caminhos para a Independência",
      shortDescription: "Empoderar mulheres em vulnerabilidade com atendimento psicológico e capacitação profissional.",
      fullDescription: "Empoderar mulheres em condições de vulnerabilidade familiar e vítimas de violência doméstica, oferecendo atendimento psicológico, capacitação profissional e apoio para alcançar a independência financeira. O projeto visa criar uma rede de apoio comunitário para oferecer oportunidades de emprego e incentivar o empreendedorismo feminino.",
      category: "Saúde e Social",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="24" r="8" fill="#4E8D7C"/>
          <path d="M20 40c0-8 4-12 12-12s12 4 12 12v8H20v-8z" fill="#2A5B46"/>
          <path d="M28 16l8 8 8-8" stroke="#FBBF24" strokeWidth="2" fill="none"/>
          <circle cx="32" cy="20" r="2" fill="#FBBF24"/>
        </svg>
      )
    },
    {
      id: 17,
      title: "Juventude em Ação",
      shortDescription: "Promover a inclusão social de jovens em vulnerabilidade através de práticas esportivas.",
      fullDescription: "Promover a inclusão social de jovens em situação de vulnerabilidade por meio de práticas esportivas, prevenindo o envolvimento com o crime e o uso de drogas. O projeto oferece atividades regulares, desenvolve habilidades sociais e emocionais (trabalho em equipe, disciplina) e cria um ambiente de apoio e mentoria.",
      category: "Saúde e Social",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <circle cx="20" cy="20" r="6" fill="#4E8D7C"/>
          <circle cx="32" cy="16" r="6" fill="#4E8D7C"/>
          <circle cx="44" cy="20" r="6" fill="#4E8D7C"/>
          <path d="M20 26v12M32 22v12M44 26v12" stroke="#2A5B46" strokeWidth="3"/>
          <circle cx="32" cy="44" r="8" fill="#FBBF24"/>
        </svg>
      )
    },
    {
      id: 18,
      title: "Mulheres do Campo - Quintais Produtivos em Roraima",
      shortDescription: "Promover o empoderamento econômico de mulheres rurais através de quintais produtivos.",
      fullDescription: "Promover o empoderamento econômico e social de mulheres rurais na comunidade PA Nova Amazônia, em Boa Vista. Com foco na implementação de quintais produtivos sustentáveis, o projeto capacita as participantes em técnicas de agroecologia, manejo sustentável e empreendedorismo, fortalecendo redes de apoio.",
      category: "Saúde e Social",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <circle cx="20" cy="16" r="4" fill="#4E8D7C"/>
          <circle cx="32" cy="16" r="4" fill="#4E8D7C"/>
          <circle cx="44" cy="16" r="4" fill="#4E8D7C"/>
          <rect x="12" y="32" width="40" height="16" rx="4" fill="#2A5B46"/>
          <path d="M20 20v12M32 20v12M44 20v12" stroke="#FBBF24" strokeWidth="2"/>
          <path d="M16 36h32M16 40h32M16 44h32" stroke="#FBBF24" strokeWidth="1"/>
        </svg>
      )
    },
    {
      id: 19,
      title: "HTI | Hospital da Terceira Idade",
      shortDescription: "Hospital inteligente e conectado exclusivamente voltado à saúde do idoso.",
      fullDescription: "Projeto pioneiro para a criação de um hospital inteligente, conectado e inclusivo, exclusivamente voltado à saúde do idoso. Utiliza tecnologias como dispositivos wearable, IA para antecipar riscos, telemedicina para conectar especialistas, robôs assistivos e Big Data para integrar históricos de saúde, criando um hub de inovação para a longevidade.",
      category: "Saúde e Social",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <rect x="16" y="20" width="32" height="28" rx="4" fill="#4E8D7C"/>
          <path d="M28 32h8M32 28v8" stroke="#FBBF24" strokeWidth="3"/>
          <circle cx="24" cy="16" r="4" fill="#2A5B46"/>
          <path d="M20 16h8" stroke="#2A5B46" strokeWidth="2"/>
          <rect x="20" y="36" width="4" height="4" fill="#FBBF24"/>
          <rect x="40" y="36" width="4" height="4" fill="#FBBF24"/>
        </svg>
      )
    }
  ],
  capacitacao: [
    {
      id: 20,
      title: "MPBiot (Mestrado Profissional em Biotecnologia)",
      shortDescription: "Oferecer formação continuada para graduados em Biotecnologia e Bioeconomia.",
      fullDescription: "Oferecer oportunidades de formação continuada para graduados de Parintins e regiões adjacentes, fortalecendo os setores de Biotecnologia e Bioeconomia. O projeto visa formar recursos humanos altamente qualificados, promover o desenvolvimento econômico regional e conectar a pesquisa científica com a economia.",
      category: "Capacitação",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <path d="M32 8l-12 8v16l12 8 12-8V16z" fill="#4E8D7C"/>
          <circle cx="32" cy="20" r="6" fill="#2A5B46"/>
          <path d="M26 26h12M26 30h12" stroke="#FBBF24" strokeWidth="2"/>
          <circle cx="32" cy="44" r="4" fill="#FBBF24"/>
        </svg>
      )
    },
    {
      id: 21,
      title: "Letramento Digital e Robótica no Ensino",
      shortDescription: "Implementar programas de educação digital e ensino de robótica em 10 municípios.",
      fullDescription: "Implementar programas de educação digital e ensino de robótica em 10 municípios, com foco em aprimorar o ensino público. A iniciativa pretende melhorar a qualidade do ensino, aumentar o interesse dos alunos e promover o engajamento dos professores, oferecendo novas oportunidades de aprendizado e introdução à robótica.",
      category: "Capacitação",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <rect x="20" y="16" width="24" height="16" rx="4" fill="#4E8D7C"/>
          <circle cx="26" cy="24" r="2" fill="#FBBF24"/>
          <circle cx="38" cy="24" r="2" fill="#FBBF24"/>
          <rect x="30" y="28" width="4" height="2" fill="#2A5B46"/>
          <rect x="24" y="36" width="16" height="8" rx="2" fill="#2A5B46"/>
          <rect x="28" y="44" width="8" height="4" fill="#FBBF24"/>
        </svg>
      )
    },
    {
      id: 22,
      title: "Capacity Gaming (Indústria 4.0)",
      shortDescription: "Solução gamificada para capacitação e transformação digital de empresas.",
      fullDescription: "Solução tecnológica gamificada para capacitação e transformação digital de empresas, com foco na Indústria 4.0. Propõe uma abordagem educacional através de um jogo interativo onde os usuários podem simular e aplicar boas práticas de gestão, produtividade e inovação digital em um ambiente virtual.",
      category: "Capacitação",
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
          <rect x="16" y="24" width="32" height="20" rx="4" fill="#4E8D7C"/>
          <circle cx="24" cy="32" r="3" fill="#FBBF24"/>
          <circle cx="40" cy="32" r="3" fill="#FBBF24"/>
          <rect x="28" y="36" width="8" height="4" rx="1" fill="#FBBF24"/>
          <circle cx="32" cy="32" r="6" fill="#2A5B46"/>
          <path d="M30 30h4M30 34h4" stroke="#FBBF24" strokeWidth="1"/>
        </svg>
      )
    }
  ]
};

const ProjectCard = ({ project, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100"
    onClick={() => onClick(project)}
  >
    <div className="flex justify-center mb-4">
      {project.icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3 font-montserrat">{project.title}</h3>
    <p className="text-gray-600 mb-4 font-inter leading-relaxed">{project.shortDescription}</p>
    <div className="flex justify-between items-center">
      <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
        {project.category}
      </span>
      <button className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors">
        Ver Detalhes →
      </button>
    </div>
  </div>
);

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              {project.icon}
              <h2 className="text-2xl font-bold text-gray-800 font-montserrat">{project.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-4">
            <span className="inline-block bg-teal-100 text-teal-800 px-3 py-2 rounded-full text-sm font-medium">
              {project.category}
            </span>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed font-inter text-lg">
              {project.fullDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProjetosPage() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedProject, setSelectedProject] = useState(null);

  const categories = [
    { key: 'todos', label: 'Todos' },
    { key: 'bioeconomia', label: 'Bioeconomia' },
    { key: 'sustentabilidade', label: 'Sustentabilidade' },
    { key: 'saude', label: 'Saúde e Social' },
    { key: 'capacitacao', label: 'Capacitação' }
  ];

  const getFilteredProjects = () => {
    if (activeFilter === 'todos') {
      return Object.values(projectsData).flat();
    }
    return projectsData[activeFilter] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-teal-700">IDASAM</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-teal-700 transition-colors">Início</a>
              <a href="/sobre" className="text-gray-600 hover:text-teal-700 transition-colors">Sobre</a>
              <a href="/projetos" className="text-teal-700 font-semibold border-b-2 border-teal-700">Projetos</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
            Nossos Projetos para 2025
          </h1>
          <p className="text-xl md:text-2xl text-teal-100 font-inter">
            Inovação, sustentabilidade e impacto social para transformar a Amazônia.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeFilter === category.key
                    ? 'bg-yellow-400 text-gray-800 shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {getFilteredProjects().map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={setSelectedProject}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
}
