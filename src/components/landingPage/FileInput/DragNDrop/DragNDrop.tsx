import { useState, type DragEventHandler } from 'react';
import './DragNDrop.css';
import { processFile } from '../utils';

function DragNDrop(props: {
  captureFileCallback: (file: File) => void,
  disabled?: boolean 
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop: DragEventHandler = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files?.[0]) {
      processFile(files[0], props.captureFileCallback);
    }
  };

  const handleDragEnter = () => {
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const divClass = props?.disabled ? 'upload-zone disabled' : 'upload-zone';
  const draggingClass = isDragging ? 'dragging' : '';

  return (
    <div 
      className={divClass + draggingClass}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <p>
        <span> 
          <span className='material-symbols-outlined'>upload</span>
          <span className='text-lg'>Pull up the audio sample you want to visualize...</span>
        </span>
      </p>      
    </div>
  )
}

export default DragNDrop;
