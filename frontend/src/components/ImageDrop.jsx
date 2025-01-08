import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [initialImage, setInitialImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [result, setResult] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleImageUpload = (e, setImage) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("initialImage", initialImage);
    formData.append("finalImage", finalImage);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/detect-papers",
        formData
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const renderBoundingBoxes = (image, papers, imageType) => {
    const handleImageLoad = (e) => {
      setImageDimensions({
        width: e.target.naturalWidth,
        height: e.target.naturalHeight,
      });
    };

    return (
      <div className="relative" style={{ width: "400px", height: "300px" }}>
        <img
          src={URL.createObjectURL(image)}
          alt={imageType}
          className="border rounded w-full h-full object-cover"
          onLoad={handleImageLoad}
        />
        {papers.map((paper, idx) => {
          const [x1, y1, x2, y2] = paper.coordinates;

          // Calculate scale for bounding boxes
          const scaleX = 400 / imageDimensions.width;
          const scaleY = 300 / imageDimensions.height;

          const boxStyle = {
            position: "absolute",
            top: `${y1 * scaleY}px`,
            left: `${x1 * scaleX}px`,
            width: `${(x2 - x1) * scaleX}px`,
            height: `${(y2 - y1) * scaleY}px`,
            border: "2px solid",
            borderColor: paper.status === "unchanged" ? "green" : "red",
          };

          return <div key={`${imageType}-${idx}`} style={boxStyle} />;
        })}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paper Location Detection</h1>
      <div className="flex flex-col gap-4">
        <div className="card bordered">
          <label className="btn">
            Upload Initial Image
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setInitialImage)}
            />
          </label>
        </div>

        <div className="card bordered">
          <label className="btn">
            Upload Final Image
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setFinalImage)}
            />
          </label>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Detection Results:</h2>
          <div className="flex gap-4">
            <div>
              <h3 className="font-bold mb-2">Initial Image:</h3>
              {renderBoundingBoxes(initialImage, result.papers, "initial")}
            </div>

            <div>
              <h3 className="font-bold mb-2">Final Image:</h3>
              {renderBoundingBoxes(finalImage, result.papers, "final")}
            </div>
          </div>

          <h3 className="text-xl font-bold mt-4">
            Conclusion:{" "}
            {result.papers.some((p) => p.status === "mishandled")
              ? "One or more papers have been mishandled."
              : "No papers have been mishandled."}
          </h3>
        </div>
      )}
    </div>
  );
};

export default App;
