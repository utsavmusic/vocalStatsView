import { useState } from "react";
import FileInput from "./FileInput/FileInput";
import ProgressCard from "./ProgressCard/ProgressCard";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  onAudioFileUpload: (file: File) => void;
}

function LandingPage({onAudioFileUpload}: LandingPageProps) {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');

  const styling = {
    container: "container flex flex-col items-center justify-start min-h-screen bg-gray-100",
    header: "text-3xl font-bold mb-4 py-4",
  }

  // Function to handle file processing with progress updates
  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Step 1: File validation/preparation
      setProcessStatus('Preparing file...');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
      
      // Step 2: Upload file
      setProcessStatus('Uploading file...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Process audio
      setProcessStatus('Analyzing audio...');
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setProgress(75);
      
      // Step 4: Generate visualization
      setProcessStatus('Generating visualization...');
      await new Promise(resolve => setTimeout(resolve, 2500));
      setProgress(90);
      
      // Step 5: Complete
      setProcessStatus('Complete!');
      setProgress(100);
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessStatus('Processing failed');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };


  const captureFileCallback = (file: File) => {
    setFile(file);
    onAudioFileUpload(file);
    processFile(file);
  }

  const visualizeBtnClickHandler = () => {
    console.log('Here!');
    navigate('/dashboard');
  }

  return (
    <section className={styling.container}>      
      <header className={styling.header}>
        <h1>
          <span className="material-symbols-outlined large">ear_sound</span>
          AudioLens..!
        </h1>
      </header>

      <FileInput captureFileCallback={captureFileCallback} disabled={file ? true : false} />

      {
        file && 
        <div style={{ width: '50%', maxWidth: '600px', marginTop: '2rem' }}>
          <ProgressCard progress={progress} file={file} status={processStatus} />
        </div>
      }
      
      {progress === 100 && <div>
        <button className="btn btn-primary right my-8" onClick={visualizeBtnClickHandler}>
          <i className='material-symbols-outlined'>play_arrow</i>
          <span className="text-lg">Visualize</span>
        </button>
      </div>}
    </section>
  )
}

export default LandingPage;