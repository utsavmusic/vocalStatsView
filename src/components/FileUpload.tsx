import React, { useState } from "react";
import { uploadAndGetAmplitudeAudio } from "../api/AmplitudeApi";
import Loader from "./Loader";
import WaveformChart from "./WaveformChart";
import HighestAndLowestChart from "./HighestAndLowestChart";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [waveformData, setWaveformData] = useState<number[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setWaveformData(null);

    try {
      const result = await uploadAndGetAmplitudeAudio(file);
      setWaveformData(result.amplitude_time_series);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-dark text-white">
      <div
        className="card bg-secondary text-white p-4 w-100"
        style={{ maxWidth: "500px" }}
      >
        <h3 className="text-center mb-4">🎵 Upload Audio File</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="audioFile" className="form-label">
              Select an audio file:
            </label>
            <input
              id="audioFile"
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="form-control"
            />
          </div>
          <div className="d-grid">
            <button
              type="submit"
              disabled={!file || loading}
              className="btn btn-light fw-bold"
            >
              {loading ? "Uploading..." : "🚀 Submit"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center mt-3">
            <Loader />
          </div>
        )}

        {waveformData && (
          <>
            <WaveformChart data={waveformData} />
            <HighestAndLowestChart file={file} />
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
