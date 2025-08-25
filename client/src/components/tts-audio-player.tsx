
import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, Settings, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface TTSAudioPlayerProps {
  text: string;
  title?: string;
  className?: string;
}

const speedOptions = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' }
];

export default function TTSAudioPlayer({ text, title = 'Artigo', className = '' }: TTSAudioPlayerProps) {
  const {
    state,
    settings,
    availableVoices,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    toggle,
    updateSettings,
    progress,
    currentWord
  } = useTextToSpeech();

  const [showSettings, setShowSettings] = useState(false);

  // Filtrar vozes em português
  const portugueseVoices = availableVoices.filter(voice => 
    voice.lang.startsWith('pt') || voice.lang.includes('Portuguese')
  );

  const allVoices = portugueseVoices.length > 0 ? portugueseVoices : availableVoices;

  if (!isSupported) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">
            Text-to-Speech não é suportado neste navegador
          </span>
        </div>
      </div>
    );
  }

  const handlePlay = () => {
    if (!state.isPlaying && !state.isPaused) {
      speak(text);
    } else {
      toggle();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-idasam-green-dark" />
          <h3 className="font-medium text-gray-900">
            Ouvir {title}
          </h3>
        </div>
        
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Áudio</h4>
              
              {/* Velocidade */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Velocidade</label>
                <div className="flex gap-1">
                  {speedOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.rate === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ rate: option.value })}
                      className="h-8 px-2 text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Voz */}
              {allVoices.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voz</label>
                  <Select
                    value={settings.voice?.name || ''}
                    onValueChange={(value) => {
                      const voice = allVoices.find(v => v.name === value);
                      updateSettings({ voice });
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar voz" />
                    </SelectTrigger>
                    <SelectContent>
                      {allVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          <div className="flex flex-col">
                            <span>{voice.name}</span>
                            <span className="text-xs text-gray-500">
                              {voice.lang}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Volume */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Volume ({Math.round(settings.volume * 100)}%)
                </label>
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => updateSettings({ volume: value })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Controles Principais */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          onClick={handlePlay}
          disabled={state.isLoading}
          className="h-12 w-12 rounded-full bg-idasam-green-dark hover:bg-idasam-green-medium"
        >
          {state.isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : state.isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <Button
          onClick={stop}
          variant="outline"
          size="sm"
          disabled={!state.isPlaying && !state.isPaused}
          className="h-9"
        >
          <Square className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Badge variant="outline" className="text-xs">
            {settings.rate}x
          </Badge>
          {state.isPlaying && currentWord && (
            <span className="font-medium">
              "{currentWord}"
            </span>
          )}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-idasam-green-dark h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {state.currentPosition} / {state.duration} palavras
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Estado de Erro */}
      {state.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{state.error}</span>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          {state.isLoading && 'Preparando áudio...'}
          {state.isPlaying && 'Reproduzindo'}
          {state.isPaused && 'Pausado'}
          {!state.isPlaying && !state.isPaused && !state.isLoading && 'Pronto para reproduzir'}
        </span>
        
        <span>Web Speech API</span>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Settings,
  Headphones
} from 'lucide-react';

interface TTSAudioPlayerProps {
  text: string;
  title?: string;
  compact?: boolean;
}

export default function TTSAudioPlayer({ text, title = "Artigo", compact = false }: TTSAudioPlayerProps) {
  const {
    isPlaying,
    isPaused,
    isSupported,
    availableVoices,
    settings,
    speak,
    pause,
    resume,
    stop,
    updateSettings
  } = useTextToSpeech();

  const [showSettings, setShowSettings] = useState(false);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
        <Headphones className="w-4 h-4" />
        <span>Áudio não suportado neste navegador</span>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  };

  const handleStop = () => {
    stop();
  };

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
  ];

  const currentSpeedLabel = speedOptions.find(s => s.value === settings.rate)?.label || '1x';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePlayPause}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {isPlaying && !isPaused ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isPlaying && !isPaused ? 'Pausar' : 'Ouvir'}
          </span>
        </Button>
        
        {isPlaying && (
          <Button onClick={handleStop} size="sm" variant="outline">
            <Square className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">Ouvir {title}</span>
        </div>
        
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Velocidade: {currentSpeedLabel}</label>
                <div className="flex gap-1 mt-2">
                  {speedOptions.map((speed) => (
                    <Button
                      key={speed.value}
                      size="sm"
                      variant={settings.rate === speed.value ? "default" : "outline"}
                      onClick={() => updateSettings({ rate: speed.value })}
                      className="text-xs"
                    >
                      {speed.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Volume</label>
                <Slider
                  value={[settings.volume * 100]}
                  onValueChange={(value) => updateSettings({ volume: value[0] / 100 })}
                  max={100}
                  step={10}
                  className="mt-2"
                />
              </div>

              {availableVoices.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Voz</label>
                  <Select
                    value={settings.voice?.name || ''}
                    onValueChange={(voiceName) => {
                      const voice = availableVoices.find(v => v.name === voiceName);
                      if (voice) updateSettings({ voice });
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione uma voz" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices
                        .filter(voice => voice.lang.startsWith('pt') || voice.lang.startsWith('en'))
                        .map((voice) => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handlePlayPause}
          className="flex items-center gap-2"
        >
          {isPlaying && !isPaused ? (
            <>
              <Pause className="w-4 h-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {isPaused ? 'Continuar' : 'Reproduzir'}
            </>
          )}
        </Button>

        {isPlaying && (
          <Button onClick={handleStop} variant="outline">
            <Square className="w-4 h-4 mr-2" />
            Parar
          </Button>
        )}

        <div className="flex-1 text-center">
          <span className="text-sm text-gray-600">
            Velocidade: {currentSpeedLabel}
          </span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Reproduzindo...</span>
          </div>
        )}
      </div>
    </div>
  );
}
