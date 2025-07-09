import React from "react";

interface WaveformChartProps {
  data: number[];
}

const WaveformChart: React.FC<WaveformChartProps> = ({ data }) => {
  return (
    <div className="card bg-dark text-white mt-4 p-3">
      <h5 className="card-title text-center mb-3">📈 Waveform</h5>
      <div className="position-relative" style={{ height: "100px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${data.length} 100`}
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="#00FF99"
            strokeWidth="0.5"
            points={data
              .map((amp, i) => `${i},${50 - amp * 40}`) // Normalize to SVG 100px height
              .join(" ")}
          />
        </svg>
      </div>
    </div>
  );
};

export default WaveformChart;
