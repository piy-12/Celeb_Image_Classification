import React, { useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import sharapova from "./assets/sharapova1.jpg";
import messi from "./assets/messi.png";
import virat from './assets/virat.jpg';
import serena from './assets/serena.jpg';
import roger from './assets/roger.jpg';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Celebrity images - replace these URLs with your actual celebrity images
  const celebrities = [
    { name: "Celebrity 1", image: sharapova},
    { name: "Celebrity 2", image: messi },
    { name: "Celebrity 3", image: virat },
    { name: "Celebrity 4", image: serena },
    { name: "Celebrity 5", image: roger },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const classifyImage = async () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      const formData = new FormData();
      formData.append("image_data", base64Image);

      const response = await fetch("http://127.0.0.1:5000/classify_image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        setError("No face with 2 eyes detected in the image");
        return;
      }

      const prediction = data[0];
      setResult({
        className: prediction.class,
        probabilities: prediction.class_probability[0],
        classDict: prediction.class_dictionary,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error while classifying image. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Celebrity Image Boxes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Supported Celebrities</h2>
          <div className="grid grid-cols-5 gap-4">
            {celebrities.map((celeb, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="aspect-square bg-gray-200">
                  <img 
                    src={celeb.image} 
                    alt={celeb.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 text-center">
                  <p className="text-sm font-medium text-gray-700">{celeb.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Classification Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Celebrity Image Classifier
            </h1>
            <p className="text-gray-600">Upload an image to identify the celebrity</p>
          </div>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-80 mx-auto rounded-lg shadow-md object-contain"
                />
                <p className="text-sm text-gray-600">Click or drag to upload a different image</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports JPG, PNG, WEBP (max 10MB)
                  </p>
                </div>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Classify Button */}
          <button
            onClick={classifyImage}
            disabled={!image || loading}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Classify Image
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Prediction: {result.className}
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Confidence Scores:</h3>
                {Object.entries(result.classDict)
                  .sort((a, b) => result.probabilities[b[1]] - result.probabilities[a[1]])
                  .map(([name, index]) => {
                    const probability = result.probabilities[index];
                    return (
                      <div key={name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">{name}</span>
                          <span className="text-gray-600 font-semibold">{probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gray-700 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${probability}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;