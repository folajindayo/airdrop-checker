'use client';

import * as React from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  className,
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = React.useState(muted);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [playbackRate, setPlaybackRate] = React.useState(1);

  let hideControlsTimeout: NodeJS.Timeout;

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate?.(time);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    const time = value[0];
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const vol = value[0];
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative group bg-black rounded-lg overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onClick={togglePlay}
        className="w-full h-full"
      />

      {/* Play overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Button
            size="lg"
            variant="default"
            className="h-16 w-16 rounded-full"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8 fill-current" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="mb-4"
        />

        <div className="flex items-center justify-between gap-4">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => skip(-10)}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => skip(10)}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:text-white hover:bg-white/20"
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
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Playback Speed</p>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.playbackRate = rate;
                          setPlaybackRate(rate);
                        }
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded text-sm hover:bg-accent',
                        playbackRate === rate && 'bg-accent'
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple video embed
export function VideoEmbed({
  src,
  title = 'Video',
  className,
}: {
  src: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn('aspect-video rounded-lg overflow-hidden', className)}>
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

// YouTube embed
export function YouTubeEmbed({
  videoId,
  autoplay = false,
  className,
}: {
  videoId: string;
  autoplay?: boolean;
  className?: string;
}) {
  const src = `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;

  return <VideoEmbed src={src} title="YouTube video" className={className} />;
}

// Tutorial video with chapters
export function TutorialVideo({
  src,
  chapters,
  className,
}: {
  src: string;
  chapters: Array<{ time: number; title: string }>;
  className?: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const jumpToChapter = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <VideoPlayer src={src} />
      <div className="space-y-2">
        <h3 className="font-semibold">Chapters</h3>
        <div className="space-y-1">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => jumpToChapter(chapter.time)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
            >
              {Math.floor(chapter.time / 60)}:{(chapter.time % 60).toString().padStart(2, '0')} - {chapter.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

