import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import ProgressBar from '../landingPage/ProgressCard/ProgressBar';

interface AudioWaveformProps {
  audioFile: File | null;
  onTimeUpdate?: (time: number) => void;
  onLoadComplete?: (duration: number) => void;
  className?: string;
}

const AudioWaveform = ({ 
  audioFile, 
  onTimeUpdate = () => {},
  onLoadComplete = () => {},
  className = ""
}: AudioWaveformProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Generate waveform data from audio file
  const generateWaveform = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || window.AudioContext)();
      audioContextRef.current = audioContext;
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      const samples = 200;
      const blockSize = Math.floor(channelData.length / samples);
      const waveform = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j] || 0);
        }
        waveform.push(sum / blockSize);
      }
      
      const maxVal = Math.max(...waveform);
      const normalizedWaveform = waveform.map(val => val / maxVal);
      
      setWaveformData(normalizedWaveform);
      setDuration(audioBuffer.duration);
      onLoadComplete(audioBuffer.duration);
    } catch (error) {
      console.error('Error generating waveform:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onLoadComplete]);

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = width / waveformData.length;
    const progressWidth = (currentTime / duration) * width;
    
    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.85;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      const isPlayed = x < progressWidth;
      ctx.fillStyle = isPlayed ? '#7c3aed' : '#3d3d5c';
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });
    
    if (progressWidth > 0) {
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressWidth, 0);
      ctx.lineTo(progressWidth, height);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration]);

  // Handle canvas click
  const handleCanvasClick: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    if (!audioRef.current || !duration) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = (clickX / canvas.width) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    const shouldPlay = audioRef.current.paused;
    setIsPlaying(shouldPlay);

    if (shouldPlay) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.AudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      try {
        await audioRef.current.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audioRef.current.pause();
    }
  };

  const handleVolumeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newVolume = parseFloat(e.target.value) ?? -1;
    if (newVolume < 0) return;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Effects
  useEffect(() => {
    if (audioFile) {
      generateWaveform(audioFile);
      const audio = new Audio(URL.createObjectURL(audioFile));
      audio.preload = 'auto';
      audio.addEventListener('canplaythrough', () => (audioRef.current = audio));
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      };
    }
  }, [audioFile, generateWaveform]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    const animate = () => {
      drawWaveform();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    if (isPlaying) animate();
    else if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, drawWaveform]);

  return (
    <div className={`card ${className}`} style={{
      fontFamily: 'var(--space-grotesk-font)',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-6)'
    }}>
      {audioFile && (
        <audio
          ref={audioRef}
          src={URL.createObjectURL(audioFile)}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
              onTimeUpdate(audioRef.current.currentTime);
            }
          }}
          preload="metadata"
        />
      )}
      
      {/* Waveform */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {isLoading ? (
          <div>Analyzing audio...</div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={128}
            style={{
              width: '100%',
              height: '8rem',
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              border: '1px solid var(--color-border-subtle)'
            }}
            onClick={handleCanvasClick}
          />
        )}
      </div>
      
      {/* Time */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)'
      }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      {/* 🔥 Reusable ProgressBar */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <ProgressBar
          progress={duration ? (currentTime / duration) * 100 : 0}
          label="Playback"
          size="large"
          variant="primary"
          showPercentage={false}
        />
      </div>

      {/* Controls (same as before) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button onClick={() => skip(-10)}><SkipBack size={20} /></button>
          <button onClick={togglePlay}>{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>
          <button onClick={() => skip(10)}><SkipForward size={20} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button onClick={toggleMute}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
          <input type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume} onChange={handleVolumeChange} />
        </div>
      </div>
    </div>
  );
};

export default AudioWaveform;
