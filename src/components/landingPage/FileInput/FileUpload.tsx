import { useRef } from 'react';
import { processFile } from './utils';

export default function FileUpload(props: {
  captureFileCallback?: (file: File) => void,
  disabled?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const fileInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      processFile(files[0], props.captureFileCallback);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow-sm'>
      <button
        type='button'
        onClick={handleButtonClick}
        className='btn btn-primary'
      >
        <i className='material-symbols-outlined'>audio_file</i>
        Choose File
      </button>
      <input
        type='file'
        accept='audio/*'
        ref={fileInputRef}
        className='input hidden'
        onChange={fileInputHandler}
        disabled={props?.disabled ?? false}
      />
    </div>
  );
}
