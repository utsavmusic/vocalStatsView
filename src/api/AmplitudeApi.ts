// src/api/uploadApi.ts
export async function uploadAndGetAmplitudeAudio(file: File) {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch("http://localhost:9090/api/amplitude_time_series", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to provide amplitude of audio");
  }

  return await response.json();
}
