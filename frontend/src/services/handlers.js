const handleSubmit = async () => {
  const formData = new FormData();
  formData.append("initialImage", initialImageFile);
  formData.append("finalImage", finalImageFile);

  try {
    const response = await axios.post("/api/detect-papers", formData);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

export { handleSubmit };