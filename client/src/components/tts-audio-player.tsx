
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface TTSAudioPlayerProps {
  text: string;
  title?: string;
  className?: string;
}

export default function TTSAudioPlayer({ text, title, className = '' }: TTSAudioPlayerProps) {
  const {
    isPlaying,
    isPaused,
    isSupported,
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
  } = useTextToSpeech();

  const [showSettings, setShowSettings] = useState(false);

  // Filtrar vozes em português
  const portugueseVoices = voices.filter(voice => 
    voice.lang.startsWith('pt') || 
    voice.name.toLowerCase().includes('portuguese') ||
    voice.name.toLowerCase().includes('brasil')
  );

  const availableVoices = portugueseVoices.length > 0 ? portugueseVoices : voices;

  const handlePlayPause = () => {
    if (isPlaying) {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className={`bg-gray-100 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <Volume2 className="w-5 h-5" />
          <span className="text-sm">
            🔊 Text-to-Speech não é suportado neste navegador
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">
            🎧 Áudio do Artigo
          </h4>
          {title && (
            <p className="text-xs text-gray-500 truncate">{title}</p>
          )}
        </div>
        
        {/* Configurações */}
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Voz</label>
                <Select value={selectedVoice?.name || ''} onValueChange={(value) => {
                  const voice = voices.find(v => v.name === value);
                  if (voice) setVoice(voice);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma voz" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Velocidade: {rate.toFixed(1)}x
                </label>
                <Slider
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Controles de Reprodução */}
      <div className="flex items-center gap-3">
        {/* Botão Play/Pause */}
        <Button
          onClick={handlePlayPause}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!text.trim()}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        {/* Botão Stop */}
        <Button
          onClick={handleStop}
          size="sm"
          variant="outline"
          disabled={!isPlaying && !isPaused}
        >
          <Square className="w-4 h-4" />
        </Button>

        {/* Barra de Progresso */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 min-w-[40px]">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status */}
      {(isPlaying || isPaused) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span>
            {isPlaying ? '🎵 Reproduzindo...' : '⏸️ Pausado'}
          </span>
          {selectedVoice && (
            <span className="text-gray-400">
              • {selectedVoice.name.split(' ')[0]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
