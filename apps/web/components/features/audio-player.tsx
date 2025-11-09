'use client';

import * as React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  src: string;
  duration?: number;
  coverArt?: string;
}

export interface AudioPlayerProps {
  track: AudioTrack;
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function AudioPlayer({
  track,
  autoPlay = false,
  onEnded,
  onError,
  className,
}: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleError = () => {
      onError?.(new Error('Failed to load audio'));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (autoPlay) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [track.src, autoPlay, onEnded, onError]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('p-4', className)}>
      <audio ref={audioRef} src={track.src} />

      <div className="flex items-center gap-4">
        {track.coverArt && (
          <img
            src={track.coverArt}
            alt={track.title}
            className="w-16 h-16 rounded object-cover"
          />
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{track.title}</h4>
          {track.artist && (
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        <Button
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          className="h-10 w-10"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <div className="w-28" /> {/* Spacer for symmetry */}
      </div>
    </Card>
  );
}

// Playlist audio player
export function PlaylistAudioPlayer({
  tracks,
  autoPlay = false,
  className,
}: {
  tracks: AudioTrack[];
  autoPlay?: boolean;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState(false);

  const currentTrack = tracks[currentIndex];

  const handleNext = () => {
    if (shuffle) {
      setCurrentIndex(Math.floor(Math.random() * tracks.length));
    } else {
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleEnded = () => {
    if (repeat) {
      return; // Audio will replay automatically
    }
    handleNext();
  };

  return (
    <Card className={cn('p-6', className)}>
      <AudioPlayer
        track={currentTrack}
        autoPlay={autoPlay}
        onEnded={handleEnded}
      />

      <div className="mt-4 flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShuffle(!shuffle)}
          className={cn(shuffle && 'text-primary')}
        >
          <Shuffle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleNext}>
          <SkipForward className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRepeat(!repeat)}
          className={cn(repeat && 'text-primary')}
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>

      {/* Playlist */}
      <div className="mt-6 space-y-2 max-h-60 overflow-y-auto">
        {tracks.map((track, index) => (
          <button
            key={track.id}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-full text-left p-3 rounded-lg transition-colors hover:bg-accent',
              index === currentIndex && 'bg-accent'
            )}
          >
            <p className="font-medium text-sm truncate">{track.title}</p>
            {track.artist && (
              <p className="text-xs text-muted-foreground truncate">
                {track.artist}
              </p>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

// Mini audio player
export function MiniAudioPlayer({
  track,
  className,
}: {
  track: AudioTrack;
  className?: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-muted', className)}>
      <audio ref={audioRef} src={track.src} />

      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        className="h-8 w-8 flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{track.title}</p>
        {track.artist && (
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        )}
      </div>
    </div>
  );
}

// Audio waveform visualizer (simplified)
export function AudioWaveform({
  audioSrc,
  className,
}: {
  audioSrc: string;
  className?: string;
}) {
  const bars = 50;

  return (
    <div className={cn('flex items-center gap-1 h-20', className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-primary rounded-full transition-all"
          style={{
            height: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.7,
          }}
        />
      ))}
    </div>
  );
}

// Notification sound player
export function useNotificationSound(soundUrl: string) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    audioRef.current = new Audio(soundUrl);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl]);

  const play = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  return { play };
}

// Audio feedback for interactions
export function useAudioFeedback() {
  const playClick = useNotificationSound('/sounds/click.mp3');
  const playSuccess = useNotificationSound('/sounds/success.mp3');
  const playError = useNotificationSound('/sounds/error.mp3');

  return {
    playClick: playClick.play,
    playSuccess: playSuccess.play,
    playError: playError.play,
  };
}

