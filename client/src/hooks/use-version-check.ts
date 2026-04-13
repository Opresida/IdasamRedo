import { useEffect, useRef } from 'react';

/**
 * Verifica periodicamente se o servidor tem uma versão mais nova.
 * Se detectar mudança, limpa caches e recarrega a página automaticamente.
 * Intervalo padrão: 5 minutos.
 */
export function useVersionCheck(intervalMs = 5 * 60 * 1000) {
  const knownVersion = useRef<string | null>(null);

  useEffect(() => {
    async function checkVersion() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();

        if (!knownVersion.current) {
          knownVersion.current = data.version;
          return;
        }

        if (data.version !== knownVersion.current) {
          console.log('[VersionCheck] Nova versão detectada, limpando cache...');

          // Limpa Service Worker caches
          if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
          }

          // Desregistra Service Workers antigos
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(r => r.unregister()));
          }

          // Hard reload
          window.location.reload();
        }
      } catch {
        // silently ignore — server may be restarting
      }
    }

    checkVersion();
    const timer = setInterval(checkVersion, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
}
