import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

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
      
      // Sample the audio data to create waveform
      const samples = 200; // Number of bars in waveform
      const blockSize = Math.floor(channelData.length / samples);
      const waveform = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j] || 0);
        }
        waveform.push(sum / blockSize);
      }
      
      // Normalize waveform data
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
    
    // Clear canvas
    ctx?.clearRect(0, 0, width, height);
    
    const barWidth = width / waveformData.length;
    const progressWidth = (currentTime / duration) * width;
    
    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.85;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      
      // Color bars based on playback progress
      const isPlayed = x < progressWidth;
      ctx.fillStyle = isPlayed 
        ? '#7c3aed' // Purple accent for played portion
        : '#3d3d5c'; // Border color for unplayed portion
      
      ctx?.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });
    
    // Draw playback indicator line
    if (progressWidth > 0) {
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressWidth, 0);
      ctx.lineTo(progressWidth, height);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration]);

  // Handle canvas click for seeking
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

  // Audio event handlers
  // const handleTimeUpdate = () => {
  //   if (audioRef.current) {
  //     const time = audioRef.current.currentTime;
  //     setCurrentTime(time);
  //     onTimeUpdate(time);
  //   }
  // };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Control functions
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      console.log('Playing');
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(!audioRef.current.paused);
  };

  const handleVolumeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const inputElement = e.target as HTMLInputElement;
    const newVolume = parseFloat(inputElement?.value) ?? -1;
    if (newVolume < 0) return;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
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
    
    if (audioRef.current?.paused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      drawWaveform();
    } else {
      animate();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
      {/* Audio element */}
      {audioFile && (
        <audio
          ref={audioRef}
          src={URL.createObjectURL(audioFile)}
          // onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="metadata"
        />
      )}
      
      {/* Waveform Display */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {isLoading ? (
          <div style={{
            height: '8rem',
            backgroundColor: 'var(--color-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--color-border-subtle)',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '2px solid var(--color-border)',
              borderTop: '2px solid var(--color-accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ 
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)'
            }}>
              Analyzing audio...
            </span>
          </div>
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
              border: '1px solid var(--color-border-subtle)',
              transition: 'border-color var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              const eventTarget = e.target as HTMLCanvasElement;
              eventTarget.style.borderColor = 'var(--color-border)';
            }}
            onMouseLeave={(e) => {
              const eventTarget = e.target as HTMLCanvasElement;
              eventTarget.style.borderColor = 'var(--color-border-subtle)';
            }}
            onClick={handleCanvasClick}
          />
        )}
      </div>
      
      {/* Time Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        fontWeight: 'var(--font-medium)'
      }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--color-surface-elevated)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--color-border-subtle)'
        }}>
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--color-accent-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width var(--transition-fast)',
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              position: 'relative'
            }}
          >
            {/* Subtle glow effect */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--color-accent-primary)',
              borderRadius: '50%',
              boxShadow: '0 0 8px var(--color-accent-primary)',
              opacity: duration && currentTime > 0 ? 1 : 0,
              transition: 'opacity var(--transition-base)'
            }} />
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Playback Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)'
        }}>
          <button
            onClick={() => skip(-10)}
            disabled={!audioFile}
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: audioFile ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-base)',
              opacity: audioFile ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              const eventTarget = e.target as HTMLButtonElement;
              if (audioFile) {
                eventTarget.style.backgroundColor = 'var(--color-surface-elevated)';
                eventTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              const eventTarget = e.target as HTMLButtonElement;
              eventTarget.style.backgroundColor = 'transparent';
              eventTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={togglePlay}
            disabled={!audioFile || isLoading}
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-white)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: (audioFile && !isLoading) ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-base)',
              opacity: (audioFile && !isLoading) ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (audioFile && !isLoading) {
                const eventTarget = e.target as HTMLButtonElement;
                eventTarget.style.backgroundColor = 'var(--color-accent-primary-hover)';
                eventTarget.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              const eventTarget = e.target as HTMLButtonElement;
              eventTarget.style.backgroundColor = 'var(--color-accent-primary)';
              eventTarget.style.boxShadow = '0 0 0 0 rgba(124, 58, 237, 0.4)';
            }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={() => skip(10)}
            disabled={!audioFile}
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: audioFile ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-base)',
              opacity: audioFile ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (audioFile) {
                const eventTarget = e.target as HTMLButtonElement;
                eventTarget.style.backgroundColor = 'var(--color-surface-elevated)';
                eventTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              const eventTarget = e.target as HTMLButtonElement;
              eventTarget.style.backgroundColor = 'transparent';
              eventTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        {/* Volume Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          <button
            onClick={toggleMute}
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              const eventTarget = e.target as HTMLButtonElement;
              eventTarget.style.backgroundColor = 'var(--color-surface-elevated)';
              eventTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              const eventTarget = e.target as HTMLButtonElement;
              eventTarget.style.backgroundColor = 'transparent';
              eventTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{
              width: '5rem',
              height: '4px',
              background: `linear-gradient(to right, var(--color-accent-primary) 0%, var(--color-accent-primary) ${(isMuted ? 0 : volume) * 100}%, var(--color-surface-elevated) ${(isMuted ? 0 : volume) * 100}%, var(--color-surface-elevated) 100%)`,
              borderRadius: 'var(--radius-full)',
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
        </div>
      </div>
      
      {/* File Info */}
      {audioFile && (
        <div style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            <span style={{ 
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-medium)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '60%'
            }}>
              {audioFile.name}
            </span>
            <span>
              {(audioFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
      )}
      
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-accent-primary);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.3);
          transition: all var(--transition-base);
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.5);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-accent-primary);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.3);
          transition: all var(--transition-base);
        }
        
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AudioWaveform;