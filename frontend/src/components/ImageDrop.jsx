import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [initialImage, setInitialImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e, setImage) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("initialImage", initialImage);
    formData.append("finalImage", finalImage);

    try {
      const response = await axios.post(
        import.meta.env.VITE_REACT_APP_API_URL,
        formData
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  return (
    <div className="p-4 pt-2 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4"></h1>
      <div className="flex flex-col gap-6 ">
        <div className="flex justify-between gap-6">
          {/* Initial Image Upload Box */}
          <div className="relative w-1/2 aspect-square border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 transition">
            {initialImage ? (
              <img
                src={URL.createObjectURL(initialImage)}
                alt="Initial"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                <span className="text-gray-400 text-lg font-medium">
                  + Upload Initial Image
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setInitialImage)}
                />
              </label>
            )}
          </div>

          {/* Final Image Upload Box */}
          <div className="relative w-1/2 aspect-square border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 transition">
            {finalImage ? (
              <img
                src={URL.createObjectURL(finalImage)}
                alt="Final"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                <span className="text-gray-400 text-lg font-medium">
                  + Upload Final Image
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setFinalImage)}
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary w-full py-3 text-lg font-bold"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Detection Results:</h2>
          <div className="flex gap-4">
            <div>
              <h3 className="font-bold mb-2">Initial Image:</h3>
              <img
                src={`data:image/png;base64,${result.initial_image}`}
                alt="Initial Image"
                className="border rounded w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-bold mb-2">Final Image:</h3>
              <img
                src={`data:image/png;base64,${result.final_image}`}
                alt="Final Image"
                className="border rounded w-full h-full object-cover"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mt-8">
            Conclusion:{" "}
            {result.initial_papers.some((p) => p.status === "mishandled") ||
            result.final_papers.some((p) => p.status === "mishandled")
              ? "One or more papers have been mishandled."
              : "No papers have been mishandled."}
          </h3>
        </div>
      )}
    </div>
  );
};

export default App;
