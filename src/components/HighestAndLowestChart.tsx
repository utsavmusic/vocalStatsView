import React, { useEffect, useState } from "react";
import { uploadAudioFile } from "../api/uploadApi";

interface Props {
  file: File | null;
}

const HighestAndLowestChart: React.FC<Props> = ({ file }) => {
  const [notes, setNotes] = useState<{
    highestNote: string;
    lowestNote: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPitch = async () => {
      if (!file) return;
      setLoading(true);
      try {
        const data = await uploadAudioFile(file);
        setNotes(data);
      } catch (err) {
        setError("Failed to fetch notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchPitch();
  }, [file]);

  return (
    <div className="card bg-dark text-white mt-3 p-3">
      <h5 className="text-center mb-3">🎯 Highest & Lowest Notes</h5>
      {loading && <div className="text-center">Loading notes...</div>}
      {error && <div className="text-danger text-center">{error}</div>}
      {notes && (
        <div className="d-flex justify-content-around">
          <div className="text-success fw-bold">
            🔼 Highest: <span className="text-white">{notes.highestNote}</span>
          </div>
          <div className="text-warning fw-bold">
            🔽 Lowest: <span className="text-white">{notes.lowestNote}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighestAndLowestChart;
