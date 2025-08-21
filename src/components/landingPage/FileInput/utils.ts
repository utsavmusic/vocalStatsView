export const processFile = (file: File, callback?: (file: File) => void) => {
  // Check file type
  if (!file.type.startsWith('audio/')) {
    alert('Please upload an audio file');
    return;
  }
  
  // Check file size (e.g., 10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    alert('File too large');
    return;
  }
  
  // setFile(file);
  callback?.(file);
};