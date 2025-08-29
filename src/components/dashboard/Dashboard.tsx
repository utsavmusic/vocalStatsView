import AudioWaveform from "./AudioWaveform";

interface DashboardProps {
  file: File | null;
}

function Dashboard({ file }: DashboardProps) {
  const styling = {
    container: "container flex flex-col items-center justify-start min-h-screen bg-gray-100",
    header: "text-3xl font-bold mb-4 py-4",
  }

  return (
    <section className={styling.container}>
      {file && (
          <AudioWaveform
            audioFile={file}
            onTimeUpdate={(time) => console.log('Current time:', time)}
            onLoadComplete={(duration) => console.log('Audio loaded, duration:', duration)}
          />
        )}
    </section>
  )
}

export default Dashboard;