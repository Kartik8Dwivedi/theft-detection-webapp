

export const handleSubmit = async () => {
  const formData = new FormData();
  formData.append("initialImage", initialImage);
  formData.append("finalImage", finalImage);

  const response = await axios.post("/api/detect-papers", formData);
  setResult(response.data); // Store results for rendering
};
