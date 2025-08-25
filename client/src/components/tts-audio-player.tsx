
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
