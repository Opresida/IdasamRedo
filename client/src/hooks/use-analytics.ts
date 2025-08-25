
import { useEffect, useRef } from 'react';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  articleId?: string;
  metadata?: Record<string, any>;
}

interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics(): void {
    // Registrar início da sessão
    this.track({
      event: 'session_start',
      category: 'engagement',
      action: 'session_start',
      metadata: {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    });

    // Rastrear tempo na página
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.startTime;
      this.track({
        event: 'session_end',
        category: 'engagement',
        action: 'session_end',
        value: Math.round(sessionDuration / 1000), // em segundos
        metadata: {
          sessionId: this.sessionId,
          duration: sessionDuration
        }
      });
    });
  }

  track(event: AnalyticsEvent): void {
    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      referrer: document.referrer
    };

    this.events.push(enrichedEvent);
    
    // Log no console para desenvolvimento
    console.log('📊 Analytics Event:', enrichedEvent);

    // Em produção, aqui você enviaria para seu serviço de analytics
    this.sendToAnalyticsService(enrichedEvent);
  }

  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // Exemplo: enviar para Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          custom_parameters: event.metadata
        });
      }

      // Exemplo: enviar para seu próprio backend/Supabase
      // await supabase.from('analytics_events').insert(event);
      
    } catch (error) {
      console.warn('⚠️ Erro ao enviar evento de analytics:', error);
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  trackPageView(page: string, title?: string): void {
    this.track({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: page,
      metadata: {
        page,
        title: title || document.title
      }
    });
  }

  trackArticleView(articleId: string, title: string): void {
    this.track({
      event: 'article_view',
      category: 'content',
      action: 'view_article',
      label: title,
      articleId,
      metadata: {
        articleId,
        title
      }
    });
  }

  trackArticleLike(articleId: string, title: string, liked: boolean): void {
    this.track({
      event: 'article_like',
      category: 'engagement',
      action: liked ? 'like_article' : 'unlike_article',
      label: title,
      articleId,
      value: liked ? 1 : 0,
      metadata: {
        articleId,
        title,
        liked
      }
    });
  }

  trackComment(articleId: string, commentText: string): void {
    this.track({
      event: 'comment_added',
      category: 'engagement',
      action: 'add_comment',
      articleId,
      value: commentText.length,
      metadata: {
        articleId,
        commentLength: commentText.length,
        wordCount: commentText.split(' ').length
      }
    });
  }

  trackShare(articleId: string, platform: string, title: string): void {
    this.track({
      event: 'article_share',
      category: 'social',
      action: 'share_article',
      label: platform,
      articleId,
      metadata: {
        articleId,
        platform,
        title
      }
    });
  }

  trackSearch(query: string, results: number): void {
    this.track({
      event: 'search',
      category: 'search',
      action: 'perform_search',
      label: query,
      value: results,
      metadata: {
        query,
        resultsCount: results
      }
    });
  }

  trackNewsletterSignup(email: string): void {
    this.track({
      event: 'newsletter_signup',
      category: 'conversion',
      action: 'newsletter_subscribe',
      metadata: {
        emailDomain: email.split('@')[1]
      }
    });
  }

  trackError(error: string, context?: string): void {
    this.track({
      event: 'error',
      category: 'technical',
      action: 'error_occurred',
      label: error,
      metadata: {
        error,
        context,
        userAgent: navigator.userAgent
      }
    });
  }

  // Obter estatísticas da sessão
  getSessionStats(): {
    sessionId: string;
    duration: number;
    eventsCount: number;
    pageViews: number;
    interactions: number;
  } {
    const duration = Date.now() - this.startTime;
    const pageViews = this.events.filter(e => e.event === 'page_view').length;
    const interactions = this.events.filter(e => 
      ['article_like', 'comment_added', 'article_share'].includes(e.event)
    ).length;

    return {
      sessionId: this.sessionId,
      duration,
      eventsCount: this.events.length,
      pageViews,
      interactions
    };
  }
}

// SEO Manager
class SEOManager {
  updateSEO(seoData: SEOData): void {
    // Atualizar título
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Atualizar ou criar meta tags
    this.updateMetaTag('description', seoData.description);
    
    if (seoData.keywords && seoData.keywords.length > 0) {
      this.updateMetaTag('keywords', seoData.keywords.join(', '));
    }

    // Open Graph tags
    this.updateMetaTag('og:title', seoData.title, 'property');
    this.updateMetaTag('og:description', seoData.description, 'property');
    this.updateMetaTag('og:type', seoData.type || 'article', 'property');
    
    if (seoData.image) {
      this.updateMetaTag('og:image', seoData.image, 'property');
    }
    
    if (seoData.url) {
      this.updateMetaTag('og:url', seoData.url, 'property');
    }

    // Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image', 'name');
    this.updateMetaTag('twitter:title', seoData.title, 'name');
    this.updateMetaTag('twitter:description', seoData.description, 'name');
    
    if (seoData.image) {
      this.updateMetaTag('twitter:image', seoData.image, 'name');
    }

    console.log('🔍 SEO atualizado:', seoData);
  }

  private updateMetaTag(name: string, content: string, attribute: string = 'name'): void {
    let tag = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
  }

  generateStructuredData(type: 'article' | 'website', data: any): void {
    const existingScript = document.querySelector('#structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    
    let structuredData;
    
    if (type === 'article') {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        author: {
          '@type': 'Organization',
          name: 'IDASAM'
        },
        publisher: {
          '@type': 'Organization',
          name: 'IDASAM',
          logo: {
            '@type': 'ImageObject',
            url: 'https://idasam.org/logo.png'
          }
        },
        datePublished: data.publishDate,
        dateModified: data.modifiedDate || data.publishDate
      };
    } else {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.title,
        description: data.description,
        url: data.url
      };
    }

    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}

// Instâncias singleton
const analyticsManager = new AnalyticsManager();
const seoManager = new SEOManager();

// Hook principal
export const useAnalytics = () => {
  const trackingRef = useRef<Set<string>>(new Set());

  const track = (event: AnalyticsEvent) => {
    analyticsManager.track(event);
  };

  const trackPageView = (page: string, title?: string) => {
    // Evitar tracking duplicado da mesma página
    const pageKey = `${page}_${title}`;
    if (trackingRef.current.has(pageKey)) return;
    
    trackingRef.current.add(pageKey);
    analyticsManager.trackPageView(page, title);
  };

  const trackArticleView = (articleId: string, title: string) => {
    // Rastrear apenas uma vez por sessão por artigo
    const articleKey = `article_${articleId}`;
    if (trackingRef.current.has(articleKey)) return;
    
    trackingRef.current.add(articleKey);
    analyticsManager.trackArticleView(articleId, title);
  };

  return {
    track,
    trackPageView,
    trackArticleView,
    trackArticleLike: analyticsManager.trackArticleLike.bind(analyticsManager),
    trackComment: analyticsManager.trackComment.bind(analyticsManager),
    trackShare: analyticsManager.trackShare.bind(analyticsManager),
    trackSearch: analyticsManager.trackSearch.bind(analyticsManager),
    trackNewsletterSignup: analyticsManager.trackNewsletterSignup.bind(analyticsManager),
    trackError: analyticsManager.trackError.bind(analyticsManager),
    getSessionStats: analyticsManager.getSessionStats.bind(analyticsManager)
  };
};

// Hook para SEO
export const useSEO = () => {
  const updateSEO = (seoData: SEOData) => {
    seoManager.updateSEO(seoData);
  };

  const updateArticleSEO = (article: any) => {
    const seoData: SEOData = {
      title: `${article.title} | IDASAM Notícias`,
      description: article.excerpt,
      keywords: ['IDASAM', 'Amazônia', 'sustentabilidade', ...article.tags],
      image: article.image,
      url: `${window.location.origin}/noticias#${article.id}`,
      type: 'article'
    };

    updateSEO(seoData);
    seoManager.generateStructuredData('article', {
      title: article.title,
      description: article.excerpt,
      image: article.image,
      publishDate: article.publishDate,
      modifiedDate: article.publishDate
    });
  };

  return {
    updateSEO,
    updateArticleSEO,
    generateStructuredData: seoManager.generateStructuredData.bind(seoManager)
  };
};

// Hook combinado para conveniência
export const useAnalyticsAndSEO = () => {
  const analytics = useAnalytics();
  const seo = useSEO();

  return {
    ...analytics,
    ...seo
  };
};
