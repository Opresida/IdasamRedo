import { Helmet } from 'react-helmet-async';

/**
 * Configuração central de SEO do site.
 * ⚠️ Domínio de produção: se o site for publicado em outro endereço,
 * altere APENAS `SITE.url` aqui — todo o SEO (canonical, Open Graph,
 * sitemap gerado, JSON-LD) deriva desta constante.
 */
export const SITE = {
  url: 'https://www.idasam.org',
  name: 'IDASAM',
  fullName: 'Instituto de Desenvolvimento Ambiental e Social da Amazônia',
  defaultTitle: 'IDASAM — Instituto de Desenvolvimento Ambiental e Social da Amazônia',
  defaultDescription:
    'Organização sem fins lucrativos fundada em 1996 em Manaus (AM). O IDASAM promove bioeconomia, desenvolvimento sustentável, capacitação e inovação tecnológica para a Amazônia.',
  ogImage: 'https://www.idasam.org/og-image.png',
  locale: 'pt_BR',
  twitter: '@idasam',
} as const;

interface SEOProps {
  /** Título específico da página. Renderizado como "Título | IDASAM". Omita na home. */
  title?: string;
  /** Meta description (~150–160 caracteres). */
  description?: string;
  /** Caminho da rota (ex.: '/projetos'). Gera canonical e og:url absolutos. */
  path?: string;
  /** Imagem de compartilhamento (URL absoluta ou caminho iniciado por '/'). */
  image?: string;
  /** Tipo Open Graph. */
  type?: 'website' | 'article';
  /** Impede indexação (páginas administrativas, autenticadas ou transacionais). */
  noindex?: boolean;
  /** Palavras-chave adicionais (separadas por vírgula). */
  keywords?: string;
  /** Dados estruturados Schema.org adicionais desta página. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE.url}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export default function SEO({
  title,
  description = SITE.defaultDescription,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  keywords,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE.name}` : SITE.defaultTitle;
  const canonical = absolute(path);
  const ogImage = image ? absolute(image) : SITE.ogImage;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLdArray.map((data, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
