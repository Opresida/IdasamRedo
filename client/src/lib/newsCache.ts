
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface NewsCache {
  articles: CacheItem<any[]> | null;
  articleStats: Record<string, CacheItem<any>>;
  comments: Record<string, CacheItem<any[]>>;
}

class NewsCacheManager {
  private cache: NewsCache = {
    articles: null,
    articleStats: {},
    comments: {}
  };

  private readonly DEFAULT_TTL = 3 * 60 * 1000; // 3 minutos
  private readonly STATS_TTL = 1 * 60 * 1000; // 1 minuto
  private readonly COMMENTS_TTL = 2 * 60 * 1000; // 2 minutos

  // Verificar se item do cache está expirado
  private isExpired<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Limpar cache expirado
  private cleanExpiredCache(): void {
    // Limpar artigos expirados
    if (this.cache.articles && this.isExpired(this.cache.articles)) {
      this.cache.articles = null;
    }

    // Limpar estatísticas expiradas
    Object.keys(this.cache.articleStats).forEach(key => {
      if (this.isExpired(this.cache.articleStats[key])) {
        delete this.cache.articleStats[key];
      }
    });

    // Limpar comentários expirados
    Object.keys(this.cache.comments).forEach(key => {
      if (this.isExpired(this.cache.comments[key])) {
        delete this.cache.comments[key];
      }
    });
  }

  // Cache de artigos
  setArticles(articles: any[]): void {
    this.cache.articles = {
      data: articles,
      timestamp: Date.now(),
      ttl: this.DEFAULT_TTL
    };
  }

  getArticles(): any[] | null {
    this.cleanExpiredCache();
    
    if (!this.cache.articles || this.isExpired(this.cache.articles)) {
      return null;
    }
    
    return this.cache.articles.data;
  }

  // Cache de estatísticas de artigo
  setArticleStats(articleId: string, stats: any): void {
    this.cache.articleStats[articleId] = {
      data: stats,
      timestamp: Date.now(),
      ttl: this.STATS_TTL
    };
  }

  getArticleStats(articleId: string): any | null {
    this.cleanExpiredCache();
    
    const cached = this.cache.articleStats[articleId];
    if (!cached || this.isExpired(cached)) {
      return null;
    }
    
    return cached.data;
  }

  // Cache de comentários
  setComments(articleId: string, comments: any[]): void {
    this.cache.comments[articleId] = {
      data: comments,
      timestamp: Date.now(),
      ttl: this.COMMENTS_TTL
    };
  }

  getComments(articleId: string): any[] | null {
    this.cleanExpiredCache();
    
    const cached = this.cache.comments[articleId];
    if (!cached || this.isExpired(cached)) {
      return null;
    }
    
    return cached.data;
  }

  // Invalidar cache específico
  invalidateArticleStats(articleId: string): void {
    delete this.cache.articleStats[articleId];
  }

  invalidateComments(articleId: string): void {
    delete this.cache.comments[articleId];
  }

  invalidateArticles(): void {
    this.cache.articles = null;
  }

  // Limpar todo o cache
  clearAll(): void {
    this.cache = {
      articles: null,
      articleStats: {},
      comments: {}
    };
  }

  // Obter informações do cache
  getCacheInfo(): { 
    articlesCount: number;
    statsCount: number;
    commentsCount: number;
    totalMemoryUsage: string;
  } {
    this.cleanExpiredCache();
    
    const articlesCount = this.cache.articles ? 1 : 0;
    const statsCount = Object.keys(this.cache.articleStats).length;
    const commentsCount = Object.keys(this.cache.comments).length;
    
    // Estimativa simples do uso de memória
    const totalItems = articlesCount + statsCount + commentsCount;
    const estimatedMemory = totalItems * 10; // KB estimado
    
    return {
      articlesCount,
      statsCount,
      commentsCount,
      totalMemoryUsage: `${estimatedMemory}KB`
    };
  }
}

// Instância singleton do cache
export const newsCache = new NewsCacheManager();

// Funções auxiliares para facilitar o uso
export const cacheHelpers = {
  // Função para buscar ou executar se não estiver em cache
  async getOrFetch<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    cacheGetter: (key: string) => T | null,
    cacheSetter: (key: string, data: T) => void
  ): Promise<T> {
    // Tentar buscar do cache primeiro
    const cached = cacheGetter(cacheKey);
    if (cached !== null) {
      console.log(`📦 Cache hit para: ${cacheKey}`);
      return cached;
    }

    // Se não estiver em cache, buscar e cachear
    console.log(`🌐 Cache miss para: ${cacheKey} - Buscando...`);
    const data = await fetchFunction();
    cacheSetter(cacheKey, data);
    
    return data;
  },

  // Log de estatísticas do cache
  logCacheStats(): void {
    const stats = newsCache.getCacheInfo();
    console.log('📊 Cache Stats:', stats);
  }
};
