'use client';

import * as React from 'react';
import {
  Circle,
  Square,
  Pause,
  Download,
  Monitor,
  Video,
  Mic,
  MicOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export interface ScreenRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  includeAudio?: boolean;
  className?: string;
}

export function ScreenRecorder({
  onRecordingComplete,
  includeAudio = false,
  className,
}: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      setError(null);

      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any,
        audio: includeAudio,
      });

      setStream(displayStream);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType: 'video/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingComplete?.(blob);
        chunksRef.current = [];
      };

      // Handle stream ending (user stops sharing)
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start recording'
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Screen Recorder
            </h3>
            {isRecording && (
              <Badge
                variant="destructive"
                className="mt-2 animate-pulse"
              >
                <Circle className="h-3 w-3 mr-1 fill-current" />
                {isPaused ? 'Paused' : 'Recording'}
              </Badge>
            )}
          </div>

          {isRecording && (
            <div className="text-2xl font-mono font-bold">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button onClick={startRecording} className="flex-1">
              <Circle className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  className="flex-1"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={resumeRecording}
                  variant="outline"
                  className="flex-1"
                >
                  <Circle className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              )}
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// Screen recorder with preview
export function ScreenRecorderWithPreview({
  onSave,
  className,
}: {
  onSave: (blob: Blob) => void;
  className?: string;
}) {
  const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `screen-recording-${Date.now()}.webm`;
    a.click();
  };

  const handleSave = () => {
    if (recordedBlob) {
      onSave(recordedBlob);
      setRecordedBlob(null);
      setVideoUrl(null);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <ScreenRecorder onRecordingComplete={handleRecordingComplete} />

      {videoUrl && (
        <Card className="p-4">
          <div className="space-y-4">
            <Label>Recording Preview</Label>
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg bg-black"
            />
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Recording
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Simple audio recorder
export function AudioRecorder({
  onRecordingComplete,
  className,
}: {
  onRecordingComplete?: (blob: Blob) => void;
  className?: string;
}) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete?.(blob);
        chunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Audio Recorder
          </Label>
          {isRecording && (
            <span className="text-lg font-mono font-bold">
              {formatTime(recordingTime)}
            </span>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!isRecording ? (
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="w-full"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
      </div>
    </Card>
  );
}

// Recording list with playback
export function RecordingsList({
  recordings,
  onDelete,
  className,
}: {
  recordings: Array<{
    id: string;
    name: string;
    url: string;
    duration: number;
    date: Date;
    type: 'video' | 'audio';
  }>;
  onDelete: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {recordings.map((recording) => (
        <Card key={recording.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {recording.type === 'video' ? (
                <Video className="h-8 w-8 text-primary" />
              ) : (
                <Mic className="h-8 w-8 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{recording.name}</h4>
              <p className="text-sm text-muted-foreground">
                {recording.date.toLocaleString()} • {recording.duration}s
              </p>

              {recording.type === 'video' ? (
                <video
                  src={recording.url}
                  controls
                  className="w-full mt-2 rounded"
                />
              ) : (
                <audio
                  src={recording.url}
                  controls
                  className="w-full mt-2"
                />
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(recording.id)}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Recording indicator
export function RecordingIndicator({
  isRecording,
  className,
}: {
  isRecording: boolean;
  className?: string;
}) {
  if (!isRecording) return null;

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50',
        className
      )}
    >
      <Badge variant="destructive" className="animate-pulse">
        <Circle className="h-3 w-3 mr-2 fill-current" />
        Recording in progress
      </Badge>
    </div>
  );
}

