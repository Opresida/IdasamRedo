import { Link } from "wouter";
import { Compass, Home, Newspaper, GraduationCap } from "lucide-react";
import SEO from "@/components/seo";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-sand px-4 font-inter">
      <SEO
        title="Página não encontrada (404)"
        path="/404"
        noindex
        description="A página que você procura não existe ou foi movida. Volte ao início do IDASAM."
      />

      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-forest/10">
          <Compass className="h-10 w-10 text-forest" />
        </div>

        <p className="text-6xl font-extrabold text-forest">404</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Página não encontrada
        </h1>
        <p className="mt-3 text-gray-600 leading-relaxed">
          O endereço que você acessou não existe mais ou foi movido. Se você veio de
          um link antigo, ele pode ter mudado. Vamos te levar de volta ao caminho certo.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest/90"
        >
          <Home className="h-5 w-5" />
          Voltar ao início
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/projetos" className="inline-flex items-center gap-1.5 text-forest hover:underline">
            <Compass className="h-4 w-4" /> Projetos
          </Link>
          <Link href="/noticias" className="inline-flex items-center gap-1.5 text-forest hover:underline">
            <Newspaper className="h-4 w-4" /> Notícias
          </Link>
          <Link href="/capacitacao" className="inline-flex items-center gap-1.5 text-forest hover:underline">
            <GraduationCap className="h-4 w-4" /> Capacitação
          </Link>
        </div>
      </div>
    </div>
  );
}
