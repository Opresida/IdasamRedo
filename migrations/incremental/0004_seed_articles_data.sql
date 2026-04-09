-- Migration: Seed article categories and articles from development database
-- Idempotent: uses INSERT ... ON CONFLICT (id) DO NOTHING

-- Insert article categories
INSERT INTO "article_categories" ("id", "name", "slug", "description")
VALUES
  ('86d85f2f-524b-44d3-a84d-1e853117c67e', 'Bioeconomia', 'bioeconomia', 'Projetos de bioeconomia e desenvolvimento sustentável'),
  ('528a959a-30bf-4ee7-b584-1639ade8be0d', $str$Educação$str$, 'educacao', $str$Programas educacionais e capacitação$str$),
  ('89998cde-23cc-4011-ac4a-5b047373af9b', 'Pesquisa', 'pesquisa', $str$Projetos de pesquisa científica$str$),
  ('34b2048a-f2cb-44ec-891f-a47d571af433', 'Sustentabilidade', 'sustentabilidade', $str$Iniciativas sustentáveis e meio ambiente$str$),
  ('c5acef52-a778-49aa-b19c-cf9d506d869f', 'Tecnologia', 'tecnologia', $str$Inovação e tecnologia verde$str$)
ON CONFLICT (id) DO NOTHING;

-- Article 1
DO $article1$
DECLARE
  v_content text;
BEGIN
  v_content := $content$O Instituto de Desenvolvimento Sustentável da Amazônia (IDASAM) anunciou o lançamento de seu mais ambicioso projeto: a implementação de um sistema de bioeconomia circular que transformará resíduos florestais em produtos de alto valor agregado.

O projeto, desenvolvido em parceria com universidades nacionais e internacionais, utilizará tecnologias avançadas de biotecnologia para converter biomassa residual da floresta amazônica em bioprodutos como bioplásticos, cosméticos naturais e compostos farmacêuticos.

"Esta iniciativa representa um marco na nossa missão de conciliar conservação ambiental com desenvolvimento econômico", explicou a Dra. Maria Silva, diretora científica do IDASAM. "Estamos criando uma nova economia baseada na floresta em pé."

O projeto beneficiará diretamente mais de 500 famílias em 12 comunidades ribeirinhas, oferecendo capacitação técnica e oportunidades de trabalho sustentável.$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    'a47f84cc-3f34-43b9-af18-895623e95712',
    $t$IDASAM Lança Revolucionário Projeto de Bioeconomia Circular na Amazônia$t$,
    $t$Iniciativa inovadora promove transformação de resíduos florestais em produtos de alto valor agregado, gerando renda sustentável para comunidades tradicionais.$t$,
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2071&q=80',
    '86d85f2f-524b-44d3-a84d-1e853117c67e',
    'Dr. Maria Silva',
    ARRAY['bioeconomia','sustentabilidade', $t$amazônia$t$,'comunidades'],
    'true', 'true', 2, 5,
    v_content,
    '2026-03-24 18:58:10.759009+00',
    '2026-03-24 18:58:10.759009+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article1$;

-- Article 2
DO $article2$
DECLARE
  v_content text;
BEGIN
  v_content := $content$O programa "Jovens Amazônicos do Futuro", desenvolvido pelo IDASAM, celebra a formatura de sua terceira turma, totalizando 150 jovens capacitados em tecnologias sustentáveis e empreendedorismo verde nos últimos 18 meses.

O programa oferece formação técnica em áreas como aquicultura sustentável, manejo florestal, energias renováveis e biotecnologia aplicada.

"Ver esses jovens desenvolvendo projetos inovadores e criando suas próprias empresas sustentáveis é extremamente gratificante", comenta Ana Costa, coordenadora do programa.

A taxa de empregabilidade dos egressos supera 85%.$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    'df0ae0d0-8ab4-4455-8bc2-09aef1e8a5e2',
    $t$Educação Transformadora: Programa de Capacitação Técnica Forma 150 Jovens$t$,
    $t$Iniciativa do IDASAM capacita jovens amazônicos em tecnologias sustentáveis e empreendedorismo verde.$t$,
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2070&q=80',
    '528a959a-30bf-4ee7-b584-1639ade8be0d',
    'Ana Costa',
    ARRAY[$t$educação$t$,'jovens',$t$capacitação$t$,'sustentabilidade'],
    'true', 'false', 1, 3,
    v_content,
    '2026-03-24 18:58:10.903901+00',
    '2026-03-24 18:58:10.903901+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article2$;

-- Article 3
DO $article3$
DECLARE
  v_content text;
BEGIN
  v_content := $content$MANAUS (AM) – Em um movimento que promete fortalecer o ecossistema tecnológico e sustentável da região, o Instituto de Desenvolvimento Social e Ambiental da Amazônia (IDASAM) e a GBR Componentes oficializaram uma parceria estratégica para o biênio 2025-2026. A união tem como objetivo central a execução de um robusto projeto de Pesquisa, Desenvolvimento e Inovação (PD&I).

O acordo une a expertise técnica da GBR, referência no setor de componentes, à missão institucional do IDASAM de promover o desenvolvimento socioambiental por meio da ciência e tecnologia. Juntas, as organizações buscam não apenas o avanço técnico, mas a criação de soluções que gerem impacto positivo direto na preservação da Amazônia e no bem-estar social das comunidades locais.

Um Passo Rumo ao Futuro Sustentável

A parceria foi selada em um encontro que contou com a presença do Presidente da GBR Componentes e do Diretor Institucional do IDASAM, Leonardo Câmara. Para Câmara, essa colaboração representa um marco para a inovação regional.

"Unir forças com a GBR nos permite escalar nossa capacidade de gerar inovação aplicada. Nosso foco para os próximos dois anos é converter pesquisa em resultados tangíveis que respeitem a biodiversidade e impulsionem a economia verde", destacou o diretor.

O Projeto de PD&I

Embora os detalhes específicos dos produtos em desenvolvimento sejam mantidos sob critérios de inovação industrial, o projeto foca em:

Desenvolvimento Tecnológico: Criação de componentes e soluções adaptadas às necessidades regionais.

Sustentabilidade: Processos de fabricação e descarte alinhados às metas ESG (Environmental, Social, and Governance).

Capacitação e Conhecimento: Estímulo à formação de mão de obra qualificada e retenção de talentos na região.

Sobre as Instituições

IDASAM: Instituto dedicado à conservação ambiental e ao desenvolvimento social, utilizando a inovação como ferramenta para enfrentar os desafios do território amazônico.

GBR Componentes: Empresa líder em seu segmento, focada em alta tecnologia e excelência produtiva, agora expandindo sua atuação em projetos de impacto sustentável.

A expectativa é que os primeiros resultados dessa cooperação sejam apresentados ainda no primeiro semestre de 2025, estabelecendo um novo padrão para parcerias público-privadas e institucionais no Norte do Brasil.

Foto: Registro do aperto de mãos entre o Presidente da GBR Componentes e o Diretor Institucional do IDASAM, Leonardo Câmara, marcando o início da jornada.$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    'e6b36627-fe07-41d6-ad8a-f255851286ad',
    $t$Inovação na Amazônia: IDASAM e GBR Componentes Firmam Aliança Estratégica para PD&I$t$,
    $t$O IDASAM e a GBR Componentes anunciam uma parceria de Pesquisa, Desenvolvimento e Inovação (PD&I) para o biênio 2025-2026, focada em soluções tecnológicas sustentáveis para a região amazônica.$t$,
    'https://i.imgur.com/Tsr3lmd.jpeg',
    'c5acef52-a778-49aa-b19c-cf9d506d869f',
    'admin@idasam.org',
    ARRAY['PD&i'],
    'true', 'true', 1, 5,
    v_content,
    '2026-03-24 20:17:22.076437+00',
    '2026-03-24 20:24:21.416+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article3$;

-- Article 4
DO $article4$
DECLARE
  v_content text;
BEGIN
  v_content := $content$MANAUS (AM) – O Instituto de Desenvolvimento Social e Ambiental da Amazônia (IDASAM) deu um passo decisivo para o fortalecimento do Polo Industrial de Manaus ao oficializar o início de uma nova fase estratégica: o kick-off do projeto de Pesquisa, Desenvolvimento e Inovação (PD&I) 2026, em parceria com a Audax (Bike Norte).

A reunião de alinhamento, realizada na sede da indústria, estabeleceu as diretrizes fundamentais para o avanço técnico-científico que norteará o biênio. O objetivo central é o desenvolvimento de sistemas inteligentes e novos produtos voltados para o setor de duas rodas, consolidando a competitividade da Amazônia Ocidental no cenário tecnológico nacional.

Integração entre Ciência e Indústria

A iniciativa destaca-se pela união entre o rigor acadêmico e a visão de mercado. O projeto é conduzido pelo Coordenador Técnico e Pesquisador, Prof. Sandro Breval, referência na área, acompanhado de perto pelo Presidente do IDASAM, Saulo Araujo.

Para Araujo, essa colaboração é um reflexo da maturidade do ecossistema de inovação regional. "Nossa missão é integrar tecnologia de ponta com o desenvolvimento regional. Ao unirmos a competência técnica do IDASAM com a estrutura produtiva da Audax, geramos valor real não apenas para a indústria, mas para toda a sociedade amazonense", afirmou o presidente.

Foco em Resultados e Tecnologia

O cronograma de PD&I 2026 prevê uma série de etapas voltadas para:

Desenvolvimento de Novos Sistemas: Implementação de tecnologias que otimizem a performance e a eficiência dos produtos do setor.

Avanço Técnico-Científico: Pesquisa aplicada para solucionar desafios logísticos e produtivos específicos da região.

Valorização do Polo Industrial: Reforço da marca "Produzido no Polo Industrial de Manaus" através de inovação original e sustentável.

Sobre as Organizações

IDASAM: Instituição focada em unir desenvolvimento socioambiental e soluções tecnológicas, atuando como ponte entre a pesquisa científica e a aplicação prática no mercado.

Audax (Bike Norte): Empresa de destaque no setor de mobilidade e ciclismo, investindo continuamente em infraestrutura e tecnologia para liderar o segmento na região Norte.

A expectativa é que a parceria resulte em patentes e soluções disruptivas que elevem o patamar técnico da indústria local nos próximos anos.

Foto: Registro do encontro estratégico na sede da Audax, com a presença do Prof. Sandro Breval e do Presidente Saulo Araujo.$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    '056b99af-e096-4bb5-b865-2750bd36ff4e',
    $t$Inovação em Duas Rodas: IDASAM e Audax Iniciam Projeto Estratégico de PD&I 2026$t$,
    $t$O IDASAM e a Audax (Bike Norte) realizaram o kick-off de um projeto de Pesquisa, Desenvolvimento e Inovação focado na Amazônia Ocidental, visando a criação de novos sistemas e produtos para o setor.$t$,
    'https://i.imgur.com/0TUd60K.jpeg',
    'c5acef52-a778-49aa-b19c-cf9d506d869f',
    'admin@idasam.org',
    ARRAY['PD&i'],
    'true', 'true', 2, 5,
    v_content,
    '2026-03-24 20:34:19.294934+00',
    '2026-03-24 20:34:19.294934+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article4$;

-- Article 5
DO $article5$
DECLARE
  v_content text;
BEGIN
  v_content := $content$MANAUS (AM) – Em uma decisão estratégica para o fortalecimento da ciência e tecnologia na região Norte, o Comitê das Atividades de Pesquisa e Desenvolvimento na Amazônia (Capda) oficializou o credenciamento do Instituto de Desenvolvimento Social e Ambiental da Amazônia (IDASAM). O reconhecimento, anunciado durante reunião na sede da Suframa, habilita a entidade a gerir e executar projetos de Pesquisa, Desenvolvimento e Inovação (PD&I) de grande escala.

Com o novo status, o IDASAM projeta o aporte de R$ 19,2 milhões nos próximos dois anos, destinados a três eixos fundamentais: Sustentabilidade, Bioeconomia e Tecnologias Emergentes.

Pilares de Investimento e Impacto Social

O plano de ação do Instituto para o biênio é ambicioso e busca equilibrar a preservação ambiental com o avanço tecnológico urbano. Entre as iniciativas confirmadas, destacam-se:

Bioeconomia e Cadeias Produtivas: Apoio técnico e tecnológico à cadeia da goma de mandioca, visando agregar valor aos produtos da biodiversidade local.

Cidades Inteligentes: Desenvolvimento de soluções urbanas que utilizem conectividade e dados para melhorar a qualidade de vida nas capitais amazônicas.

Inteligência Artificial (IA): Programas de imersão e desenvolvimento de ferramentas de IA aplicadas aos desafios da região.

Contexto Institucional e Regional

A reunião foi conduzida pela coordenadora do Capda, Cristiane Rauen, e contou com a presença do superintendente-adjunto de Desenvolvimento e Inovação Tecnológica da Suframa, Waldenir Vieira. O evento ocorreu simultaneamente à abertura do II Encontro do Ecossistema de Inovação da Amazônia Ocidental e Amapá, reforçando o papel do comitê na interiorização dos investimentos.

"O Capda tem sido fundamental para interiorizar os investimentos e fortalecer o ecossistema de ciência e tecnologia na Amazônia, com mais de R$ 100 milhões aplicados fora de Manaus nos últimos dois anos", ressaltou Waldenir Vieira durante o encontro.

Formação de Capital Humano

Além dos projetos diretos do IDASAM, a reunião destacou os planos do Programa Prioritário de Formação de Recursos Humanos (PPFRH). O programa prevê um investimento massivo de R$ 108 milhões até 2030, com a meta de qualificar mais de 7 mil pessoas, garantindo que o avanço tecnológico seja acompanhado por mão de obra local especializada.

Com este credenciamento, o IDASAM consolida-se como um dos principais braços executores de inovação no ecossistema amazônico, transformando recursos de PD&I em benefícios socioambientais concretos.

Foto: Autoridades da Suframa e membros do Capda durante a reunião que selou o credenciamento do IDASAM e a apresentação dos resultados de PD&I.$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    '9f818e95-eaf4-4fe7-ac49-bd156e910b10',
    $t$R$ 19,2 Milhões em Inovação: IDASAM é Credenciado pelo Capda para Liderar Projetos de Bioeconomia e IA$t$,
    $t$Após credenciamento oficial pelo Capda, o IDASAM anuncia um plano de investimento de R$ 19,2 milhões para o próximo biênio, abrangendo projetos em bioeconomia, cidades inteligentes e inteligência artificial na Amazônia.$t$,
    'https://i.imgur.com/adpWXiQ.jpeg',
    '86d85f2f-524b-44d3-a84d-1e853117c67e',
    'admin@idasam.org',
    ARRAY['PD&i'],
    'true', 'false', 2, 5,
    v_content,
    '2026-03-24 20:37:27.797584+00',
    '2026-03-24 20:37:27.797584+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article5$;

-- Article 6
DO $article6$
DECLARE
  v_content text;
BEGIN
  v_content := $content$MANAUS (AM) – A ciência produzida no coração da Amazônia acaba de conquistar um novo e importante patamar de reconhecimento global. O Prof. Orlem Pinheiro de Lima foi oficialmente nomeado como Lifetime Member (Membro Vitalício) do World Research Council (WRC), uma das mais respeitadas organizações de fomento à pesquisa no mundo.

A honraria é concedida em parceria com a International Society for Scientific Network Awards e celebra pesquisadores que demonstram excelência contínua, impacto social relevante e uma trajetória acadêmica dedicada ao avanço do conhecimento.

Um Legado de Impacto e Inovação

Para o Instituto de Desenvolvimento Social e Ambiental da Amazônia (IDASAM), o reconhecimento do Prof. Orlem não é apenas uma conquista individual, mas um marco para a instituição e para a educação regional. O título de Membro Vitalício é reservado a personalidades que transformam a teoria científica em benefícios tangíveis para a sociedade.

Em nota oficial, o IDASAM celebrou o feito:

"Esta conquista honra a ciência e a educação que defendemos. É o reconhecimento de uma trajetória que transforma conhecimento em legado, provando que o Amazonas é um polo de excelência e reconhecimento global."

A Força da Pesquisa Regional

O reconhecimento internacional do Prof. Orlem Pinheiro de Lima destaca pontos cruciais para o ecossistema de inovação local:

Visibilidade Internacional: Coloca a produção científica amazonense no radar de grandes redes globais de pesquisa.

Referência Educacional: Serve como inspiração para novos pesquisadores e estudantes da região.

Soberania Científica: Reafirma a capacidade técnica da Amazônia de produzir soluções e estudos de alto nível para desafios globais.

Sobre o Prof. Orlem Pinheiro de Lima

Com uma carreira pautada pela dedicação ao ensino e à pesquisa, o Prof. Orlem tem se destacado pela liderança em projetos que unem inovação tecnológica e responsabilidade socioambiental. Sua integração ao World Research Council permite uma maior ponte entre os desafios locais da Amazônia e as soluções discutidas em fóruns internacionais.

A nomeação reforça o compromisso do IDASAM em não apenas promover o desenvolvimento sustentável, mas também em valorizar o capital humano que sustenta a evolução técnico-científica da região.

Foto: Registro da parabenização oficial do IDASAM ao Prof. Orlem Pinheiro de Lima por sua nomeação como Lifetime Member do World Research Council.$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    'cd730bc8-e402-462b-b4b6-7988bad115f8',
    $t$Ciência da Amazônia para o Mundo: Prof. Orlem Pinheiro de Lima recebe Honraria Internacional$t$,
    $t$O Prof. Orlem Pinheiro de Lima, do IDASAM, é agraciado com o título de "Lifetime Member" do World Research Council, consolidando a excelência da pesquisa científica produzida na região amazônica.$t$,
    'https://i.imgur.com/JIGmps0.jpeg',
    '528a959a-30bf-4ee7-b584-1639ade8be0d',
    'admin@idasam.org',
    ARRAY['Ciência', $t$Educação$t$],
    'true', 'false', 0, 5,
    v_content,
    '2026-03-24 20:40:42.550531+00',
    '2026-03-24 20:40:42.550531+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article6$;

-- Article 7
DO $article7$
DECLARE
  v_content text;
BEGIN
  v_content := $content$BRASÍLIA (DF) – Em busca de fortalecer a conexão entre as demandas do território amazônico e o cenário legislativo nacional, o Instituto de Desenvolvimento Social e Ambiental da Amazônia (IDASAM) realizou uma visita institucional ao gabinete do Senador Plínio Valério, no Senado Federal. O encontro teve como objetivo central a apresentação das linhas de atuação do instituto e a discussão de parcerias para projetos voltados ao desenvolvimento sustentável da região.

Durante a reunião, o IDASAM apresentou um portfólio de iniciativas que priorizam o uso racional de recursos naturais e a geração de emprego por meio da bioindústria. O senador Plínio Valério, reconhecido por sua atuação em defesa do estado do Amazonas, demonstrou entusiasmo com as propostas, sinalizando uma forte convergência entre o trabalho técnico do instituto e as pautas conduzidas em Brasília.

Uma Agenda de Convergência Regional

A parceria proposta busca criar "pontes" eficazes que permitam transformar o debate legislativo em ações práticas com impacto mensurável nas comunidades locais. Os principais pilares discutidos para a agenda conjunta incluem:

Bioindústria e Inovação: Fomento a tecnologias que permitam o aproveitamento econômico da biodiversidade de forma soberana.

Uso Racional de Recursos: Alinhamento de pautas legislativas que protejam o bioma enquanto promovem o crescimento econômico.

Desenvolvimento Socioeconômico: Foco na criação de ecossistemas produtivos que gerem renda e dignidade para o povo amazônida.

Rumo ao Protagonismo Amazônico

Para a diretoria do IDASAM, a articulação política é fundamental para que a Amazônia deixe de ser apenas um tema de debate e passe a ser a protagonista de sua própria história de inovação.

"Acreditamos que essa parceria pode fortalecer uma nova narrativa para a região — de protagonismo, inovação e desenvolvimento soberano. Nosso objetivo é transformar ideias em ações práticas que impactem positivamente a vida de quem vive na Amazônia", destacou o instituto em comunicado.

Próximos Passos

O IDASAM já está estruturando agendas específicas voltadas para a bioeconomia e a formação de ecossistemas produtivos sustentáveis, onde o apoio do Senador Plínio Valério será peça-chave. A expectativa é que essas iniciativas conjuntas resultem em avanços significativos na legislação e na implementação de projetos de campo já nos próximos meses.

A união de esforços entre a competência técnica do terceiro setor e a influência legislativa em Brasília reafirma o compromisso mútuo com um futuro onde a tecnologia e a floresta caminhem lado a lado.

Foto: Representantes do IDASAM durante audiência com o Senador Plínio Valério em seu gabinete em Brasília, marcando o início da cooperação institucional.$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    'e97f0939-fae3-406c-bb82-fcf8b71fe6c5',
    $t$Fortalecendo a Amazônia em Brasília: IDASAM e Senador Plínio Valério Alinham Pautas de Desenvolvimento$t$,
    $t$Representantes do IDASAM reuniram-se com o senador Plínio Valério, em Brasília, para apresentar projetos de bioeconomia e inovação, buscando convergir esforços legislativos em prol do protagonismo amazônida.$t$,
    'https://i.imgur.com/AnCebUY.jpeg',
    '34b2048a-f2cb-44ec-891f-a47d571af433',
    'admin@idasam.org',
    ARRAY['Politica'],
    'true', 'false', 0, 5,
    v_content,
    '2026-03-24 20:46:15.175089+00',
    '2026-03-24 20:46:15.175089+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article7$;

-- Article 8
DO $article8$
DECLARE
  v_content text;
BEGIN
  v_content := $content$Aqui está uma estrutura de conteúdo para blog, com um tom mais aprofundado e profissional, ideal para demonstrar autoridade e os benefícios reais da parceria.

Inovação e Gestão: Parceria Estratégica em PD&I Impulsiona o Futuro de Manacapuru
A inovação tecnológica deixou de ser uma promessa para o futuro e se tornou uma ferramenta essencial de gestão no presente. É com essa visão que recebemos, nesta semana, a visita institucional da prefeita de Manacapuru, Valcileia Maciel, para consolidar e fortalecer os laços de cooperação técnica voltados ao desenvolvimento regional.

O Poder da Cooperação Técnica
O cerne deste encontro foi o Acordo de Cooperação Técnica em Pesquisa, Desenvolvimento e Inovação (PD&I). Mas, na prática, o que isso significa para a população e para a administração pública?

Significa a união entre a inteligência acadêmica/técnica e as necessidades reais do município. Quando integramos tecnologia de ponta à gestão pública, conseguimos:

Otimizar processos administrativos;

Criar soluções inteligentes para infraestrutura e serviços;

Fomentar a economia local através da ciência e do conhecimento.

"Unir tecnologia e gestão é o caminho mais curto para transformar realidades e gerar progresso sustentável."

Compromisso com o Desenvolvimento Regional
A presença da prefeita Valcileia Maciel reafirma o compromisso mútuo em transformar Manacapuru em um polo de referência em inovação no estado. Durante a visita, discutimos como os projetos de PD&I podem ser aplicados para resolver desafios específicos da região, garantindo que a ciência não fique apenas no papel, mas chegue à ponta, melhorando a vida do cidadão.

Olhando para o Futuro
Seguimos avançando com a convicção de que parcerias sólidas são a base para grandes conquistas. O progresso de Manacapuru é uma prioridade, e o uso estratégico da tecnologia é a engrenagem que acelera esse movimento.

A ciência e a inovação são, hoje, os principais motores de transformação social. E nós estamos orgulhosos de fazer parte dessa história ao lado de lideranças que acreditam no potencial do nosso povo e da nossa tecnologia.

Gostou de saber mais sobre nossos projetos de inovação?
Assine nossa newsletter para acompanhar os próximos passos desta e de outras parcerias que estão transformando a nossa região!

#Inovação #Manacapuru #PDI #Tecnologia #GestãoPública #DesenvolvimentoRegional$content$;

  INSERT INTO "articles" (
    "id", "title", "excerpt", "image", "category_id", "author_name", "tags",
    "published", "featured", "views", "reading_time", "content", "created_at", "updated_at"
  ) VALUES (
    '624c8a00-116c-4da4-aa25-738e4cf48e3c',
    $t$Aliança Estratégica: Parceria em PD&I entre Manacapuru e Setor Tecnológico impulsiona o Desenvolvimento Regional$t$,
    $t$A inovação em Manacapuru ganha um novo capítulo com a visita institucional da prefeita Valcileia Maciel. O encontro fortaleceu o Acordo de Cooperação Técnica em Pesquisa, Desenvolvimento e Inovação (PD&I), focado em integrar soluções tecnológicas de ponta à gestão pública. A iniciativa visa transformar a realidade local, unindo ciência e estratégia para acelerar o progresso socioeconômico e consolidar o município como um polo de modernização regional.$t$,
    'https://i.imgur.com/ZNRCDZc.jpeg',
    '89998cde-23cc-4011-ac4a-5b047373af9b',
    'admin@idasam.org',
    ARRAY['PD&i'],
    'true', 'true', 24, 5,
    v_content,
    '2026-04-01 18:12:00.704215+00',
    '2026-04-01 18:32:27.716+00'
  )
  ON CONFLICT (id) DO NOTHING;
END
$article8$;
