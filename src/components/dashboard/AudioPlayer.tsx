import { useState } from "react";
import AudioWaveform from "./AudioWaveform";

const AudioPlayer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const eventTarget = e.target as HTMLInputElement;
    const file = eventTarget.files && eventTarget.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid audio file');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      fontFamily: 'var(--space-grotesk-font)',
      padding: 'var(--space-8)'
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Header matching your design */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h1 style={{
            fontSize: 'var(--text-5xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
            background: 'linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent-primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎵 AudioLens..!
          </h1>
        </div>
        
        {/* File Upload Card */}
        {!selectedFile && (
          <div className="card" style={{
            backgroundColor: 'var(--color-surface)',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
            transition: 'all var(--transition-base)'
          }}>
            <div style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-6)'
            }}>
              📤 Pull up the audio sample you want to visualize...
            </div>
            <label style={{
              display: 'inline-block',
              padding: 'var(--space-3) var(--space-8)',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              fontWeight: 'var(--font-medium)',
              transition: 'all var(--transition-base)',
              border: 'none',
              fontSize: 'var(--text-base)'
            }}>
              📁 Choose File
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}
        
        {/* Waveform Player */}
        {selectedFile && (
          <AudioWaveform
            audioFile={selectedFile}
            onTimeUpdate={(time) => console.log('Current time:', time)}
            onLoadComplete={(duration) => console.log('Audio loaded, duration:', duration)}
          />
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;