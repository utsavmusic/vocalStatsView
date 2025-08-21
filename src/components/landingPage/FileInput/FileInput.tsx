import DragNDrop from './DragNDrop/DragNDrop';
import FileUpload from './FileUpload';

export default function FileInput(props: {
  captureFileCallback: (file: File) => void,
  disabled?: boolean
}) {
  return (
    <div className="card flex flex-col items-center justify-center">
      <DragNDrop captureFileCallback={props.captureFileCallback} disabled={props?.disabled ?? false} />
       {/* File Input Component */}
      <FileUpload captureFileCallback={props.captureFileCallback} disabled={props?.disabled ?? false} />
    </div>
  )
}