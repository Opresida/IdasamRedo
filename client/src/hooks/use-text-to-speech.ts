
import { useState, useEffect, useRef, useCallback } from 'react';

interface Voice {
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

interface UseTextToSpeechReturn {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  voices: Voice[];
  selectedVoice: Voice | null;
  rate: number;
  volume: number;
  progress: number;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: Voice) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar suporte e carregar vozes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices().map(voice => ({
          name: voice.name,
          lang: voice.lang,
          default: voice.default,
          localService: voice.localService
        }));

        setVoices(availableVoices);

        // Selecionar voz padrão (preferencialmente em português)
        if (availableVoices.length > 0 && !selectedVoice) {
          const portugueseVoice = availableVoices.find(voice => 
            voice.lang.startsWith('pt') || 
            voice.name.toLowerCase().includes('portuguese') ||
            voice.name.toLowerCase().includes('brasil')
          );
          
          setSelectedVoice(portugueseVoice || availableVoices[0]);
        }
      };

      // Carregar vozes imediatamente
      loadVoices();

      // Alguns navegadores carregam vozes assincronamente
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [selectedVoice]);

  // Função para calcular progresso
  const updateProgress = useCallback(() => {
    if (!utteranceRef.current || !textRef.current) return;

    const now = Date.now();
    const elapsed = (now - startTimeRef.current - pausedTimeRef.current) / 1000;
    
    // Estimar duração baseada no texto (aproximadamente 150 palavras por minuto)
    const words = textRef.current.split(' ').length;
    const estimatedDuration = (words / 150) * 60 / rate; // segundos
    
    const calculatedProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
    setProgress(calculatedProgress);

    if (calculatedProgress >= 100) {
      clearProgressInterval();
    }
  }, [rate]);

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    clearProgressInterval();
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    
    progressIntervalRef.current = setInterval(updateProgress, 100);
  }, [updateProgress, clearProgressInterval]);

  // Função para falar texto
  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // Parar qualquer fala anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    textRef.current = text;
    
    // Configurar voz se disponível
    if (selectedVoice) {
      const voice = speechSynthesis.getVoices().find(v => v.name === selectedVoice.name);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.rate = rate;
    utterance.volume = volume;
    utterance.pitch = 1;

    // Event listeners
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setProgress(0);
      startProgressTracking();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      clearProgressInterval();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      clearProgressInterval();
    };

    utterance.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
      clearProgressInterval();
    };

    utterance.onresume = () => {
      setIsPaused(false);
      setIsPlaying(true);
      startProgressTracking();
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, rate, volume, startProgressTracking, clearProgressInterval]);

  // Função para pausar
  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  // Função para retomar
  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  // Função para parar
  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    clearProgressInterval();
  }, [clearProgressInterval]);

  // Função para definir voz
  const setVoice = useCallback((voice: Voice) => {
    setSelectedVoice(voice);
  }, []);

  // Limpar interval quando componente for desmontado
  useEffect(() => {
    return () => {
      clearProgressInterval();
      speechSynthesis.cancel();
    };
  }, [clearProgressInterval]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    rate,
    volume,
    progress,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setVolume
  };
}
