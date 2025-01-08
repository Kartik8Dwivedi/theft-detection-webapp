//@ts-nocheck
"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [initialImage, setInitialImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [result, setResult] = useState(null);

  const onDrop = (acceptedFiles, setImage) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(file); // Save the file object
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } =
    useDropzone({
      onDrop: (files) => onDrop(files, setInitialImage),
    });

  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } =
    useDropzone({
      onDrop: (files) => onDrop(files, setFinalImage),
    });

  const handleSubmit = async () => {
    console.log("Here")
    alert("Here")
    if (!initialImage || !finalImage) {
      alert("Please provide both images!");
      return;
    }

    const formData = new FormData();
    formData.append("initialImage", initialImage);
    formData.append("finalImage", finalImage);

    try {
      const response = await fetch("/api/data", {
        method: "POST",
        body: formData,
      });

      // if (!response.ok) {
      //   throw new Error("Failed to process images");
      // }

      const data = await response.json();
      console.log("response", data);

      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing images. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-2xl font-bold">Paper Detection App</h1>
      <div className="flex justify-center gap-4 mt-4">
        <div
          {...getRootProps1()}
          className="w-64 h-64 border-2 border-dashed flex items-center justify-center cursor-pointer"
        >
          <input {...getInputProps1()} />
          {initialImage ? (
            <p className="text-center">{initialImage.name}</p>
          ) : (
            <p className="text-center">Drop Initial Image Here</p>
          )}
        </div>
        <div
          {...getRootProps2()}
          className="w-64 h-64 border-2 border-dashed flex items-center justify-center cursor-pointer"
        >
          <input {...getInputProps2()} />
          {finalImage ? (
            <p className="text-center">{finalImage.name}</p>
          ) : (
            <p className="text-center">Drop Final Image Here</p>
          )}
        </div>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleSubmit}
      >
        Submit
      </button>
      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
