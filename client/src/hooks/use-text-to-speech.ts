
import { useState, useEffect, useCallback, useRef } from 'react';

export interface TTSSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  language: string;
}

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_SETTINGS: TTSSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
  language: 'pt-BR'
};

export const useTextToSpeech = () => {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentPosition: 0,
    duration: 0,
    isLoading: false,
    error: null
  });

  const [settings, setSettings] = useState<TTSSettings>(() => {
    // Carregar configurações do localStorage
    const savedSettings = localStorage.getItem('tts-settings');
    return savedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) } : DEFAULT_SETTINGS;
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>('');
  const wordsRef = useRef<string[]>([]);
  const currentWordIndexRef = useRef<number>(0);

  // Verificar suporte do browser
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Carregar vozes disponíveis
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Se não há voz selecionada, selecionar a primeira voz em português
      if (!settings.voice && voices.length > 0) {
        const ptVoice = voices.find(voice => 
          voice.lang.startsWith('pt') || voice.lang.includes('Portuguese')
        ) || voices[0];
        
        setSettings(prev => ({ ...prev, voice: ptVoice }));
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('tts-settings', JSON.stringify(settings));
  }, [settings]);

  // Função para dividir texto em palavras
  const prepareText = useCallback((text: string) => {
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remover HTML tags
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();
    
    const words = cleanText.split(' ');
    wordsRef.current = words;
    textRef.current = cleanText;
    
    setState(prev => ({
      ...prev,
      duration: words.length,
      currentPosition: 0
    }));
    
    return cleanText;
  }, []);

  // Função para criar utterance
  const createUtterance = useCallback((text: string) => {
    if (!isSupported) return null;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = settings.language;
    
    if (settings.voice) {
      utterance.voice = settings.voice;
    }

    // Event listeners
    utterance.onstart = () => {
      setState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        isLoading: false,
        error: null
      }));
    };

    utterance.onend = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentPosition: 0
      }));
      currentWordIndexRef.current = 0;
    };

    utterance.onpause = () => {
      setState(prev => ({
        ...prev,
        isPaused: true,
        isPlaying: false
      }));
    };

    utterance.onresume = () => {
      setState(prev => ({
        ...prev,
        isPaused: false,
        isPlaying: true
      }));
    };

    utterance.onerror = (event) => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        isLoading: false,
        error: `Erro na síntese de voz: ${event.error}`
      }));
    };

    // Evento de boundary para tracking de progresso
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        currentWordIndexRef.current++;
        setState(prev => ({
          ...prev,
          currentPosition: currentWordIndexRef.current
        }));
      }
    };

    return utterance;
  }, [settings, isSupported]);

  // Função para iniciar reprodução
  const speak = useCallback((text: string) => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Text-to-Speech não é suportado neste navegador'
      }));
      return;
    }

    // Parar qualquer reprodução anterior
    speechSynthesis.cancel();
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    const cleanText = prepareText(text);
    const utterance = createUtterance(cleanText);
    
    if (utterance) {
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  }, [isSupported, prepareText, createUtterance]);

  // Função para pausar
  const pause = useCallback(() => {
    if (speechSynthesis.speaking) {
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
    currentWordIndexRef.current = 0;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentPosition: 0
    }));
  }, []);

  // Função para toggle play/pause
  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else if (state.isPaused) {
      resume();
    }
  }, [state.isPlaying, state.isPaused, pause, resume]);

  // Atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return {
    // Estado
    state,
    settings,
    availableVoices,
    isSupported,
    
    // Funções de controle
    speak,
    pause,
    resume,
    stop,
    toggle,
    
    // Configurações
    updateSettings,
    
    // Utilitários
    currentWord: wordsRef.current[currentWordIndexRef.current] || '',
    progress: state.duration > 0 ? (state.currentPosition / state.duration) * 100 : 0
  };
};
