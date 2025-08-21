import ProgressBar from "./ProgressBar"

export default function ProgressCard(props: {file: File, progress: number, status: string}) {  
  const file = props.file;

  const truncatedFileName = 
      file.name.length > 25 ? file.name.substring(0, 25) + '...' : file.name;
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  const fileType = file.type || 'Unknown';

  return (
    <section className="card flex flex-col items-start justify-center">
      <div className="text-lg">
        <p>
          <i className='material-symbols-outlined'>check_circle</i>
          File Captured.
        </p>
        <hr></hr>
        <div className="text-secondary font-semibold py-4">
          <p>{truncatedFileName} | {fileType} | {fileSizeInMB}</p>
        </div>
      </div>

      <div className='w-full my-8'>
        <ProgressBar progress={props.progress} showPercentage={false} label={props.status} />
      </div>
    </section>
  )
}
