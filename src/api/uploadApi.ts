// src/api/uploadApi.ts
export async function uploadAudioFile(file: File) {
  const formData = new FormData();
  formData.append("audio", file);

  const response = await fetch("http://localhost:9090/api/notes", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload audio");
  }

  return await response.json();
}
