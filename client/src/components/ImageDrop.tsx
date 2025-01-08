//@ts-nocheck

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const ImageUploader = () => {
  const [initialImage, setInitialImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);

  const onDrop = (acceptedFiles, setImage) => {
    const file = acceptedFiles[0];
    setImage(URL.createObjectURL(file));
  };

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } =
    useDropzone({
      onDrop: (files) => onDrop(files, setInitialImage),
    });

  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } =
    useDropzone({
      onDrop: (files) => onDrop(files, setFinalImage),
    });

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4">
        <div {...getRootProps1()} className="border-dashed border-2 p-4">
          <input {...getInputProps1()} />
          {initialImage ? (
            <img
              src={initialImage}
              alt="Initial"
              className="w-40 h-40 object-cover"
            />
          ) : (
            <p>Drag and drop initial image</p>
          )}
        </div>
        <div {...getRootProps2()} className="border-dashed border-2 p-4">
          <input {...getInputProps2()} />
          {finalImage ? (
            <img
              src={finalImage}
              alt="Final"
              className="w-40 h-40 object-cover"
            />
          ) : (
            <p>Drag and drop final image</p>
          )}
        </div>
      </div>
      <button
        className="btn btn-primary mt-4"
        onClick={() => console.log("Submit")}
      >
        Submit
      </button>
    </div>
  );
};

export default ImageUploader;
