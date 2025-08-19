
import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

// Definição dos tipos
interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  icon: React.ReactNode;
}

// Ícones SVG personalizados para cada projeto
const ProjectIcons = {
  mandioca: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8C28 8 24 12 24 16V20C24 24 28 28 32 28C36 28 40 24 40 20V16C40 12 36 8 32 8Z" fill="#8B4513"/>
      <path d="M32 28C28 28 24 32 24 36V40C24 44 28 48 32 48C36 48 40 44 40 40V36C40 32 36 28 32 28Z" fill="#CD853F"/>
      <path d="M32 48C28 48 24 52 24 56V60C24 64 28 68 32 68C36 68 40 64 40 60V56C40 52 36 48 32 48Z" fill="#8B4513"/>
    </svg>
  ),
  tapioca: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" fill="#F5DEB3"/>
      <circle cx="28" cy="28" r="3" fill="#DDD"/>
      <circle cx="36" cy="30" r="2" fill="#DDD"/>
      <circle cx="30" cy="36" r="2.5" fill="#DDD"/>
      <circle cx="38" cy="36" r="2" fill="#DDD"/>
      <path d="M45 20C48 18 52 20 54 24C56 28 54 32 50 34" stroke="#228B22" strokeWidth="2" fill="none"/>
    </svg>
  ),
  biofertilizante: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50C20 45 24 40 30 40H34C40 40 44 45 44 50V55H20V50Z" fill="#8B4513"/>
      <path d="M32 40C32 35 28 30 24 28C20 26 16 28 16 32C16 36 20 38 24 40" fill="#228B22"/>
      <path d="M32 40C32 35 36 30 40 28C44 26 48 28 48 32C48 36 44 38 40 40" fill="#228B22"/>
      <path d="M32 25C32 20 30 15 28 12C26 9 24 10 24 14C24 18 26 20 28 22" fill="#32CD32"/>
    </svg>
  ),
  camarao: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 32C10 28 14 24 20 24H44C50 24 54 28 54 32C54 36 50 40 44 40H20C14 40 10 36 10 32Z" fill="#FF6347"/>
      <path d="M44 32L50 28L52 32L50 36L44 32Z" fill="#FF4500"/>
      <circle cx="18" cy="30" r="2" fill="#000"/>
      <path d="M20 28L16 24M20 32L16 32M20 36L16 40" stroke="#FF4500" strokeWidth="2"/>
    </svg>
  ),
  cogumelos: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="30" rx="8" ry="6" fill="#8B4513"/>
      <rect x="16" y="30" width="8" height="15" fill="#F5DEB3"/>
      <ellipse cx="35" cy="25" rx="10" ry="8" fill="#CD853F"/>
      <rect x="28" y="25" width="14" height="20" fill="#F5DEB3"/>
      <ellipse cx="48" cy="35" rx="6" ry="5" fill="#A0522D"/>
      <rect x="42" y="35" width="12" height="12" fill="#F5DEB3"/>
    </svg>
  ),
  cha: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 45C15 40 18 35 22 35H42C46 35 49 40 49 45V50H15V45Z" fill="#FFF"/>
      <path d="M15 50H49V52C49 54 47 56 45 56H19C17 56 15 54 15 52V50Z" fill="#E0E0E0"/>
      <path d="M50 40C52 38 54 40 54 42C54 44 52 46 50 44" stroke="#000" strokeWidth="2" fill="none"/>
      <path d="M25 30C25 25 28 20 32 20C36 20 39 25 39 30" stroke="#228B22" strokeWidth="2" fill="none"/>
      <circle cx="32" cy="25" r="3" fill="#32CD32"/>
    </svg>
  ),
  cesta: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 25L16 50H48L52 25H12Z" fill="#8B4513"/>
      <path d="M15 25H49" stroke="#654321" strokeWidth="2"/>
      <circle cx="25" cy="20" r="4" fill="#FF6347"/>
      <circle cx="35" cy="18" r="3" fill="#32CD32"/>
      <circle cx="42" cy="22" r="3.5" fill="#FFD700"/>
      <path d="M25 16C25 14 26 12 28 12" stroke="#228B22" strokeWidth="2" fill="none"/>
      <path d="M35 15C35 13 36 11 38 11" stroke="#228B22" strokeWidth="2" fill="none"/>
    </svg>
  ),
  ceiba: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="35" r="20" fill="#E0E0E0"/>
      <circle cx="32" cy="35" r="15" fill="#F5F5F5"/>
      <rect x="28" y="20" width="8" height="15" fill="#4169E1"/>
      <rect x="20" y="30" width="24" height="3" fill="#4169E1"/>
      <rect x="20" y="35" width="24" height="3" fill="#4169E1"/>
      <rect x="20" y="40" width="24" height="3" fill="#4169E1"/>
      <path d="M15 55C18 52 22 50 26 50C30 50 34 50 38 50C42 50 46 52 49 55" stroke="#228B22" strokeWidth="3" fill="none"/>
    </svg>
  ),
  drone: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="26" y="26" width="12" height="8" fill="#666"/>
      <circle cx="20" cy="20" r="6" fill="#333"/>
      <circle cx="44" cy="20" r="6" fill="#333"/>
      <circle cx="20" cy="44" r="6" fill="#333"/>
      <circle cx="44" cy="44" r="6" fill="#333"/>
      <line x1="26" y1="30" x2="20" y2="20" stroke="#999" strokeWidth="2"/>
      <line x1="38" y1="30" x2="44" y2="20" stroke="#999" strokeWidth="2"/>
      <line x1="26" y1="34" x2="20" y2="44" stroke="#999" strokeWidth="2"/>
      <line x1="38" y1="34" x2="44" y2="44" stroke="#999" strokeWidth="2"/>
      <rect x="10" y="45" width="44" height="4" fill="#228B22"/>
    </svg>
  ),
  reciclagem: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 15L40 30L24 30Z" fill="#228B22"/>
      <path d="M20 40L35 48L20 56Z" fill="#228B22"/>
      <path d="M44 40L44 56L29 48Z" fill="#228B22"/>
      <circle cx="32" cy="25" r="3" fill="#FFF"/>
      <circle cx="27" cy="45" r="3" fill="#FFF"/>
      <circle cx="37" cy="45" r="3" fill="#FFF"/>
      <path d="M32 35C35 32 40 35 42 40" stroke="#32CD32" strokeWidth="2" fill="none"/>
      <path d="M42 40C45 38 48 42 46 46" stroke="#32CD32" strokeWidth="2" fill="none"/>
    </svg>
  ),
  cidade: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="30" width="8" height="25" fill="#666"/>
      <rect x="20" y="25" width="8" height="30" fill="#888"/>
      <rect x="30" y="20" width="8" height="35" fill="#666"/>
      <rect x="40" y="28" width="8" height="27" fill="#888"/>
      <rect x="50" y="32" width="8" height="23" fill="#666"/>
      <path d="M32 15C35 12 40 15 42 20" stroke="#32CD32" strokeWidth="2" fill="none"/>
      <circle cx="35" cy="12" r="2" fill="#32CD32"/>
      <path d="M5 55H59" stroke="#000" strokeWidth="2"/>
      <circle cx="32" cy="8" r="3" fill="#4169E1"/>
    </svg>
  ),
  satelite: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="26" y="26" width="12" height="8" fill="#666"/>
      <rect x="20" y="22" width="6" height="16" fill="#4169E1"/>
      <rect x="38" y="22" width="6" height="16" fill="#4169E1"/>
      <circle cx="32" cy="30" r="4" fill="#FF0000"/>
      <circle cx="32" cy="30" r="2" fill="#000"/>
      <path d="M32 18L28 14L36 14Z" fill="#FFD700"/>
      <path d="M15 45C18 42 22 40 26 40C30 40 34 40 38 40C42 40 46 42 49 45" stroke="#228B22" strokeWidth="3" fill="none"/>
    </svg>
  ),
  gota: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 10C32 10 20 25 20 35C20 45 25 50 32 50C39 50 44 45 44 35C44 25 32 10 32 10Z" fill="#4169E1"/>
      <path d="M32 15C32 15 25 25 25 32C25 38 28 42 32 42C36 42 39 38 39 32C39 25 32 15 32 15Z" fill="#87CEEB"/>
      <circle cx="30" cy="30" r="2" fill="#FFF"/>
      <rect x="28" y="45" width="8" height="5" fill="#E0E0E0"/>
    </svg>
  ),
  telemedicina: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="15" fill="#FF6347"/>
      <circle cx="25" cy="25" r="10" fill="#FFF"/>
      <path d="M22 22H28M25 19V31" stroke="#FF6347" strokeWidth="2"/>
      <path d="M35 35L45 25" stroke="#666" strokeWidth="2"/>
      <circle cx="45" cy="25" r="3" fill="#666"/>
      <rect x="42" y="22" width="6" height="2" fill="#666"/>
      <rect x="44" y="20" width="2" height="6" fill="#666"/>
    </svg>
  ),
  carreta: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="25" width="40" height="15" fill="#FF6347"/>
      <rect x="15" y="20" width="30" height="5" fill="#FFF"/>
      <circle cx="20" cy="45" r="5" fill="#333"/>
      <circle cx="44" cy="45" r="5" fill="#333"/>
      <path d="M22 22H27M24.5 19V25" stroke="#FF6347" strokeWidth="2"/>
      <rect x="30" y="22" width="8" height="3" fill="#4169E1"/>
    </svg>
  ),
  mulher: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="20" r="8" fill="#FFB6C1"/>
      <path d="M20 35C20 30 25 28 32 28C39 28 44 30 44 35V45H20V35Z" fill="#FF69B4"/>
      <path d="M32 45L35 55L29 55Z" fill="#FF69B4"/>
      <path d="M25 45L20 55L15 50" stroke="#FF69B4" strokeWidth="2" fill="none"/>
      <path d="M39 45L44 55L49 50" stroke="#FF69B4" strokeWidth="2" fill="none"/>
      <path d="M40 15L45 10L50 15" stroke="#32CD32" strokeWidth="2" fill="none"/>
    </svg>
  ),
  jovens: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="18" r="6" fill="#FFB6C1"/>
      <circle cx="32" cy="16" r="6" fill="#FFB6C1"/>
      <circle cx="44" cy="18" r="6" fill="#FFB6C1"/>
      <path d="M14 30C14 26 17 24 20 24C23 24 26 26 26 30V40H14V30Z" fill="#4169E1"/>
      <path d="M26 28C26 24 29 22 32 22C35 22 38 24 38 28V38H26V28Z" fill="#FF6347"/>
      <path d="M38 30C38 26 41 24 44 24C47 24 50 26 50 30V40H38V30Z" fill="#32CD32"/>
      <circle cx="32" cy="50" r="8" fill="#FFA500"/>
    </svg>
  ),
  horta: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="25" r="6" fill="#FFB6C1"/>
      <circle cx="32" cy="23" r="6" fill="#FFB6C1"/>
      <circle cx="44" cy="25" r="6" fill="#FFB6C1"/>
      <path d="M14 35C14 31 17 29 20 29C23 29 26 31 26 35V45H14V35Z" fill="#FF69B4"/>
      <path d="M26 33C26 29 29 27 32 27C35 27 38 29 38 33V43H26V33Z" fill="#FF69B4"/>
      <path d="M38 35C38 31 41 29 44 29C47 29 50 31 50 35V45H38V35Z" fill="#FF69B4"/>
      <rect x="10" y="45" width="44" height="8" fill="#8B4513"/>
      <path d="M15 42C15 40 16 38 18 38C20 38 21 40 21 42" stroke="#228B22" strokeWidth="2" fill="none"/>
      <path d="M31 40C31 38 32 36 34 36C36 36 37 38 37 40" stroke="#228B22" strokeWidth="2" fill="none"/>
      <path d="M43 42C43 40 44 38 46 38C48 38 49 40 49 42" stroke="#228B22" strokeWidth="2" fill="none"/>
    </svg>
  ),
  hospital: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="34" height="30" fill="#FFF"/>
      <rect x="12" y="47" width="40" height="5" fill="#E0E0E0"/>
      <path d="M28 15H36M32 11V19" stroke="#FF6347" strokeWidth="3"/>
      <circle cx="45" cy="25" r="4" fill="#FFB6C1"/>
      <path d="M41 32C41 29 43 27 45 27C47 27 49 29 49 32V38H41V32Z" fill="#4169E1"/>
      <rect x="20" y="25" width="6" height="2" fill="#FF6347"/>
      <rect x="22" y="23" width="2" height="6" fill="#FF6347"/>
      <rect x="36" y="30" width="6" height="2" fill="#4169E1"/>
      <rect x="38" y="28" width="2" height="6" fill="#4169E1"/>
    </svg>
  ),
  formatura: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 30L32 20L48 30L32 40Z" fill="#4169E1"/>
      <path d="M32 40V50" stroke="#4169E1" strokeWidth="2"/>
      <circle cx="32" cy="50" r="3" fill="#4169E1"/>
      <rect x="28" y="45" width="8" height="3" fill="#FFD700"/>
      <circle cx="25" cy="25" r="8" fill="#FFB6C1"/>
      <circle cx="39" cy="25" r="8" fill="#FFB6C1"/>
      <circle cx="32" cy="28" r="8" fill="#FFB6C1"/>
      <path d="M25 32C25 29 27 27 29 27C31 27 33 29 33 32" fill="#4169E1"/>
      <path d="M31 32C31 29 33 27 35 27C37 27 39 29 39 32" fill="#4169E1"/>
    </svg>
  ),
  robo: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="25" width="24" height="20" fill="#666"/>
      <circle cx="28" cy="32" r="3" fill="#4169E1"/>
      <circle cx="36" cy="32" r="3" fill="#4169E1"/>
      <rect x="30" y="38" width="4" height="2" fill="#FFF"/>
      <rect x="18" y="30" width="4" height="8" fill="#888"/>
      <rect x="42" y="30" width="4" height="8" fill="#888"/>
      <rect x="24" y="45" width="6" height="8" fill="#888"/>
      <rect x="34" y="45" width="6" height="8" fill="#888"/>
      <rect x="25" y="15" width="14" height="8" fill="#FFD700"/>
      <rect x="28" y="18" width="8" height="2" fill="#000"/>
      <circle cx="32" cy="22" r="1" fill="#FF0000"/>
    </svg>
  ),
  game: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="25" width="40" height="20" rx="10" fill="#666"/>
      <circle cx="22" cy="35" r="4" fill="#4169E1"/>
      <circle cx="42" cy="32" r="2" fill="#FF6347"/>
      <circle cx="46" cy="35" r="2" fill="#32CD32"/>
      <circle cx="42" cy="38" r="2" fill="#FFD700"/>
      <circle cx="38" cy="35" r="2" fill="#FF69B4"/>
      <rect x="18" y="33" width="8" height="2" fill="#000"/>
      <rect x="21" y="30" width="2" height="8" fill="#000"/>
      <circle cx="32" cy="20" r="6" fill="#888"/>
      <path d="M29 17H35M32 14V23" stroke="#FFF" strokeWidth="2"/>
    </svg>
  )
};

// Dados dos projetos
const projects: Project[] = [
  // Bioeconomia
  {
    id: 'curupira',
    title: 'Projeto Curupira (Fecularia de Mandioca)',
    shortDescription: 'Implantar uma fecularia de mandioca em municípios remotos do Amazonas para promover a agricultura familiar e sustentabilidade.',
    fullDescription: 'Implantar uma fecularia de mandioca em municípios remotos do Amazonas para promover a agricultura familiar e a sustentabilidade. A iniciativa visa reduzir a dependência de fécula de outras regiões, fomentando a produção local de fécula de mandioca, goma de tapioca, tucupi e farinha. Utiliza práticas ecológicas como energia solar, captação de água da chuva e reciclagem de resíduos para adubo e ração.',
    category: 'Bioeconomia',
    icon: ProjectIcons.mandioca
  },
  {
    id: 'goma-sustentavel',
    title: 'Goma Sustentável: Produção em Roraima',
    shortDescription: 'Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores em práticas de cultivo.',
    fullDescription: 'Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores e comunidades em práticas de cultivo e processamento que aumentem a produtividade e a qualidade, preservando os recursos naturais. O projeto visa fortalecer a economia local, agregar valor com certificações e integrar comunidades rurais e indígenas.',
    category: 'Bioeconomia',
    icon: ProjectIcons.tapioca
  },
  {
    id: 'biofertilizantes',
    title: 'Produção de Biofertilizantes e Insumos',
    shortDescription: 'Produzir biofertilizantes a partir de resíduos sólidos orgânicos para mitigar impactos ambientais.',
    fullDescription: 'Produzir biofertilizantes e insumos agropecuários a partir de resíduos sólidos orgânicos para mitigar impactos ambientais. A indústria será instalada em parceria com o IDASAM, respeitando as características ambientais e socioculturais da região, com foco em sustentabilidade e segurança alimentar.',
    category: 'Bioeconomia',
    icon: ProjectIcons.biofertilizante
  },
  {
    id: 'camarao-quitosana',
    title: 'Produção de Camarão Amazônico e Obtenção de Quitosana',
    shortDescription: 'Criar um módulo sustentável para produção de camarão amazônico e extração de quitosana em Parintins.',
    fullDescription: 'Criar um módulo sustentável para a produção de camarão amazônico e extração de quitosana (substância com aplicações farmacêuticas e industriais) na região de Parintins. O projeto promove o desenvolvimento econômico e social via cooperativas, garantindo a preservação ambiental, com foco na qualidade da água e no habitat natural do camarão.',
    category: 'Bioeconomia',
    icon: ProjectIcons.camarao
  },
  {
    id: 'cogumelos-amazonicos',
    title: 'Biossíntese de Cogumelos Amazônicos',
    shortDescription: 'Promover a produção sustentável de cogumelos comestíveis na região amazônica.',
    fullDescription: 'Promover a produção sustentável de cogumelos comestíveis na região amazônica. A iniciativa envolve a melhoria de laboratórios e a capacitação de recursos humanos para desenvolver uma cadeia produtiva sustentável, gerando impactos econômicos, ambientais e sociais positivos para as comunidades locais através de cooperativas.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cogumelos
  },
  {
    id: 'chas-medicinais',
    title: 'Chás Medicinais Amazônicos Liofilizados',
    shortDescription: 'Desenvolver modelo de produção sustentável de chás medicinais amazônicos liofilizados.',
    fullDescription: 'Desenvolver um modelo de produção sustentável e geração de renda a partir de chás medicinais amazônicos liofilizados. O projeto busca melhorar a renda de comunidades ribeirinhas e povos primitivos, manter a "floresta em pé" e contribuir para a fixação de habitantes no interior da Amazônia.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cha
  },
  {
    id: 'cesta-verde',
    title: 'Cesta Verde (Reaproveitamento de Alimentos)',
    shortDescription: 'Reduzir o desperdício de alimentos através da coleta e reaproveitamento de frutas e vegetais.',
    fullDescription: 'Reduzir o desperdício de alimentos na região amazônica através da coleta e reaproveitamento de frutas e vegetais descartados em feiras e mercados. O projeto visa gerar emprego, renda e contribuir para a segurança alimentar, alinhado com os Objetivos de Desenvolvimento Sustentável (ODS).',
    category: 'Bioeconomia',
    icon: ProjectIcons.cesta
  },
  {
    id: 'ceiba',
    title: 'CEIBA: Centro de Inovação e Biotecnologia da Amazônia',
    shortDescription: 'Criar infraestrutura de ponta para promover formação profissional em Bioeconomia e Biotecnologia.',
    fullDescription: 'Criar uma infraestrutura de ponta para promover a formação de profissionais qualificados e apoiar a produção nas áreas de Bioeconomia e Biotecnologia. O centro será construído seguindo altos padrões ambientais, com uso de energia renovável e minimização de resíduos, fomentando o desenvolvimento regional.',
    category: 'Bioeconomia',
    icon: ProjectIcons.ceiba
  },
  // Sustentabilidade
  {
    id: 'plantio-sustentavel',
    title: 'Projeto Plantio Sustentável',
    shortDescription: 'Capacitar pequenos agricultores em práticas de plantio sustentável em Roraima.',
    fullDescription: 'Capacitar pequenos agricultores, comunidades indígenas e assentamentos rurais em Roraima em práticas de plantio sustentável. O objetivo é aumentar a produtividade agrícola com menor impacto ambiental, promovendo a preservação dos recursos naturais e a geração de renda local através de técnicas de manejo de solos, insumos orgânicos e conservação de água.',
    category: 'Sustentabilidade',
    icon: ProjectIcons.drone
  },
  {
    id: 'residuos-solidos',
    title: 'Tratamento de Resíduos Sólidos',
    shortDescription: 'Implementar soluções para tratamento de resíduos sólidos nos municípios da Amazônia.',
    fullDescription: 'Implementar soluções para o tratamento de resíduos sólidos nos municípios da Amazônia, com foco na sustentabilidade. A proposta visa cessar a poluição dos lençóis freáticos e revitalizar áreas degradadas, transformando-as em parques. Utiliza tecnologia inovadora para a produção de hidrogênio verde.',
    category: 'Sustentabilidade',
    icon: ProjectIcons.reciclagem
  },
  {
    id: 'smart-amazonia',
    title: 'Smart Amazônia: Cidades Inteligentes e Sustentáveis',
    shortDescription: 'Transformar municípios da Amazônia em cidades inteligentes com tecnologia avançada.',
    fullDescription: 'Transformar municípios da Amazônia em cidades inteligentes, integrando tecnologia avançada, sustentabilidade e inovação. A iniciativa busca modernizar a infraestrutura urbana, promovendo energias renováveis, sistemas inteligentes de transporte e gestão eficiente de recursos naturais através de plataformas digitais (IoT).',
    category: 'Sustentabilidade',
    icon: ProjectIcons.cidade
  },
  {
    id: 'miraia',
    title: 'Projeto Míraia – Sentinela Viva da Amazônia',
    shortDescription: 'Solução tecnológica com IA para monitoramento e combate a queimadas na Amazônia.',
    fullDescription: 'Solução tecnológica e territorial que utiliza Inteligência Artificial (IA) para monitoramento, prevenção e combate inteligente a queimadas na Amazônia Legal. Combina satélites, sensores IoT, drones e IA com a força de brigadas indígenas e comunitárias para promover proteção ambiental e resposta rápida.',
    category: 'Sustentabilidade',
    icon: ProjectIcons.satelite
  },
  // Saúde e Social
  {
    id: 'salta-z',
    title: 'Projeto SALTA-Z (Filtragem de Água)',
    shortDescription: 'Atender comunidades na Amazônia com sistema de filtragem de água usando zeólita.',
    fullDescription: 'Atender comunidades na Amazônia com dificuldades de acesso à água potável, utilizando a zeólita como meio filtrante. O sistema oferece uma solução sustentável para a remoção de metais pesados, amônia e outras impurezas da água de poços e mananciais, melhorando a qualidade de vida e a saúde pública.',
    category: 'Saúde e Social',
    icon: ProjectIcons.gota
  },
  {
    id: 'saude-digital',
    title: 'Saúde Digital para os Povos Originários da Amazônia',
    shortDescription: 'Levar atendimento médico especializado a comunidades indígenas através de telemedicina.',
    fullDescription: 'Levar atendimento médico especializado a comunidades indígenas remotas da Amazônia utilizando telemedicina. A iniciativa inclui a instalação de internet via satélite, fornecimento de dispositivos para consultas virtuais e capacitação de agentes comunitários de saúde para melhorar o acesso à saúde e reduzir deslocamentos.',
    category: 'Saúde e Social',
    icon: ProjectIcons.telemedicina
  },
  {
    id: 'carreta-saude',
    title: 'Carreta da Saúde – Saúde Itinerante',
    shortDescription: 'Levar atendimento médico a comunidades rurais através de carreta adaptada.',
    fullDescription: 'Levar atendimento médico a comunidades rurais e áreas isoladas de Roraima. A iniciativa utiliza uma carreta adaptada com consultórios médicos, oftalmológicos e odontológicos para oferecer atendimento completo, com capacidade para atender até 3.000 pessoas por mês, melhorando o acesso à saúde para populações que enfrentam barreiras geográficas.',
    category: 'Saúde e Social',
    icon: ProjectIcons.carreta
  },
  {
    id: 'renova-mulher',
    title: 'Renova Mulher: Caminhos para a Independência',
    shortDescription: 'Empoderar mulheres em vulnerabilidade através de capacitação e apoio psicológico.',
    fullDescription: 'Empoderar mulheres em condições de vulnerabilidade familiar e vítimas de violência doméstica, oferecendo atendimento psicológico, capacitação profissional e apoio para alcançar a independência financeira. O projeto visa criar uma rede de apoio comunitário para oferecer oportunidades de emprego e incentivar o empreendedorismo feminino.',
    category: 'Saúde e Social',
    icon: ProjectIcons.mulher
  },
  {
    id: 'juventude-acao',
    title: 'Juventude em Ação',
    shortDescription: 'Promover inclusão social de jovens através de práticas esportivas.',
    fullDescription: 'Promover a inclusão social de jovens em situação de vulnerabilidade por meio de práticas esportivas, prevenindo o envolvimento com o crime e o uso de drogas. O projeto oferece atividades regulares, desenvolve habilidades sociais e emocionais (trabalho em equipe, disciplina) e cria um ambiente de apoio e mentoria.',
    category: 'Saúde e Social',
    icon: ProjectIcons.jovens
  },
  {
    id: 'mulheres-campo',
    title: 'Mulheres do Campo - Quintais Produtivos em Roraima',
    shortDescription: 'Promover empoderamento de mulheres rurais através de quintais produtivos sustentáveis.',
    fullDescription: 'Promover o empoderamento econômico e social de mulheres rurais na comunidade PA Nova Amazônia, em Boa Vista. Com foco na implementação de quintais produtivos sustentáveis, o projeto capacita as participantes em técnicas de agroecologia, manejo sustentável e empreendedorismo, fortalecendo redes de apoio.',
    category: 'Saúde e Social',
    icon: ProjectIcons.horta
  },
  {
    id: 'hti',
    title: 'HTI | Hospital da Terceira Idade',
    shortDescription: 'Projeto pioneiro para criação de hospital inteligente voltado à saúde do idoso.',
    fullDescription: 'Projeto pioneiro para a criação de um hospital inteligente, conectado e inclusivo, exclusivamente voltado à saúde do idoso. Utiliza tecnologias como dispositivos wearable, IA para antecipar riscos, telemedicina para conectar especialistas, robôs assistivos e Big Data para integrar históricos de saúde, criando um hub de inovação para a longevidade.',
    category: 'Saúde e Social',
    icon: ProjectIcons.hospital
  },
  // Capacitação
  {
    id: 'mpbiot',
    title: 'MPBiot (Mestrado Profissional em Biotecnologia)',
    shortDescription: 'Oferecer formação continuada em Biotecnologia e Bioeconomia para graduados de Parintins.',
    fullDescription: 'Oferecer oportunidades de formação continuada para graduados de Parintins e regiões adjacentes, fortalecendo os setores de Biotecnologia e Bioeconomia. O projeto visa formar recursos humanos altamente qualificados, promover o desenvolvimento econômico regional e conectar a pesquisa científica com a economia.',
    category: 'Capacitação',
    icon: ProjectIcons.formatura
  },
  {
    id: 'letramento-digital',
    title: 'Letramento Digital e Robótica no Ensino',
    shortDescription: 'Implementar programas de educação digital e robótica em municípios da região.',
    fullDescription: 'Implementar programas de educação digital e ensino de robótica em 10 municípios, com foco em aprimorar o ensino público. A iniciativa pretende melhorar a qualidade do ensino, aumentar o interesse dos alunos e promover o engajamento dos professores, oferecendo novas oportunidades de aprendizado e introdução à robótica.',
    category: 'Capacitação',
    icon: ProjectIcons.robo
  },
  {
    id: 'capacity-gaming',
    title: 'Capacity Gaming (Indústria 4.0)',
    shortDescription: 'Solução gamificada para capacitação e transformação digital de empresas.',
    fullDescription: 'Solução tecnológica gamificada para capacitação e transformação digital de empresas, com foco na Indústria 4.0. Propõe uma abordagem educacional através de um jogo interativo onde os usuários podem simular e aplicar boas práticas de gestão, produtividade e inovação digital em um ambiente virtual.',
    category: 'Capacitação',
    icon: ProjectIcons.game
  }
];

// Categorias para filtros
const categories = ['Todos', 'Bioeconomia', 'Sustentabilidade', 'Saúde e Social', 'Capacitação'];

export default function ProjetosPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filtrar projetos por categoria
  const filteredProjects = selectedCategory === 'Todos' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  // Função para obter cor da categoria
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Bioeconomia':
        return 'bg-idasam-green-medium text-white';
      case 'Sustentabilidade':
        return 'bg-idasam-yellow-accent text-idasam-text-main';
      case 'Saúde e Social':
        return 'bg-red-500 text-white';
      case 'Capacitação':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-idasam-bg font-inter">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://i.imgur.com/01OfFEi.png" 
              alt="Logomarca IDASAM" 
              className="w-16 h-14 object-contain mr-3"
            />
            <span className="text-xl font-bold text-idasam-green-dark">IDASAM</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-idasam-gray-text hover:text-idasam-green-dark transition-colors">Início</a>
            <a href="#sobre" className="text-idasam-gray-text hover:text-idasam-green-dark transition-colors">Sobre</a>
            <span className="text-idasam-green-dark font-semibold border-b-2 border-idasam-green-dark">Projetos</span>
          </nav>
        </div>
      </header>

      {/* Seção de Título e Filtros */}
      <section className="bg-idasam-green-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-montserrat">
            Nossos Projetos para 2025
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Inovação, sustentabilidade e impacto social para transformar a Amazônia.
          </p>
          
          {/* Barra de Filtros */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-idasam-yellow-accent text-idasam-text-main'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grade de Projetos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                {/* Ícone do Projeto */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-idasam-green-dark/10 rounded-xl flex items-center justify-center">
                    {project.icon}
                  </div>
                </div>
                
                {/* Título */}
                <h3 className="text-xl font-bold text-idasam-text-main mb-3 text-center">
                  {project.title}
                </h3>
                
                {/* Descrição Curta */}
                <p className="text-idasam-gray-text text-sm leading-relaxed mb-4">
                  {project.shortDescription}
                </p>
                
                {/* Tag de Categoria */}
                <div className="flex justify-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}>
                    {project.category}
                  </span>
                </div>
                
                {/* Botão */}
                <div className="flex justify-center">
                  <button className="inline-flex items-center gap-2 bg-idasam-green-dark text-white px-4 py-2 rounded-lg hover:bg-idasam-green-medium transition-colors">
                    Ver Detalhes
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de Detalhes */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-idasam-green-dark/10 rounded-xl flex items-center justify-center">
                    {selectedProject.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-idasam-text-main">
                      {selectedProject.title}
                    </h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getCategoryColor(selectedProject.category)}`}>
                      {selectedProject.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Descrição Completa */}
              <div className="prose prose-lg max-w-none">
                <p className="text-idasam-gray-text leading-relaxed">
                  {selectedProject.fullDescription}
                </p>
              </div>
              
              {/* Botões do Modal */}
              <div className="flex gap-3 mt-8">
                <button className="flex-1 bg-idasam-green-dark text-white py-3 px-6 rounded-lg hover:bg-idasam-green-medium transition-colors">
                  Participar do Projeto
                </button>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
