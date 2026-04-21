import React, { useState } from 'react';
import axios from 'axios';
import './diseaseDetection.css';

const SUPPORTED_DISEASES = {
  "Apple": ["Apple scab", "Black rot", "Cedar apple rust"],
  "Cherry": ["Powdery mildew"],
  "Corn (maize)": ["Cercospora leaf spot / Gray leaf spot", "Common rust", "Northern Leaf Blight"],
  "Grape": ["Black rot", "Esca (Black Measles)", "Leaf blight (Isariopsis Leaf Spot)"],
  "Orange": ["Haunglongbing (Citrus greening)"],
  "Peach": ["Bacterial spot"],
  "Pepper (bell)": ["Bacterial spot"],
  "Potato": ["Early blight", "Late blight"],
  "Squash": ["Powdery mildew"],
  "Strawberry": ["Leaf scorch"],
  "Tomato": [
    "Bacterial spot", "Early blight", "Late blight", "Leaf Mold",
    "Septoria leaf spot", "Spider mites", "Target Spot",
    "Tomato mosaic virus", "Tomato Yellow Leaf Curl Virus"
  ]
};

export default function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showSupported, setShowSupported] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null); // reset previous result
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      
      const res = await axios.post("/disease/scan", formData);
      
      setResult(res.data);
    } catch (err) {
      console.error(err);
      const exactError = err.response?.data?.error || err.message;
      alert(`Error detail: ${exactError}. Please provide a screenshot if it persists!`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="diseaseDetection fadeIn">
      <div className="diseaseWrapper">
        <div className="diseaseHeader">
          <h1 className="diseaseTitle">AI Disease Detection</h1>
          <p className="diseaseSubtitle">
            Instantly diagnose plant health issues. Upload a photo of a sick leaf and let our AI engine analyze it, providing you with targeted treatment recommendations.
          </p>
          <button className="infoBtn" onClick={() => setShowSupported(!showSupported)}>
            <i className={`fas fa-chevron-${showSupported ? 'up' : 'down'}`}></i> 
            {showSupported ? ' Hide' : ' View'} Supported Plants & Diseases
          </button>
        </div>

        {showSupported && (
          <div className="supportedListContainer glass-panel fadeIn">
            <h3>Currently identifiable plants and their diseases</h3>
            <div className="supportedGrid">
               {Object.entries(SUPPORTED_DISEASES).map(([plant, diseases]) => (
                 <div key={plant} className="supportedItem">
                   <h4><i className="fas fa-leaf"></i> {plant}</h4>
                   <ul>
                     {diseases.map(d => <li key={d}>{d}</li>)}
                   </ul>
                 </div>
               ))}
            </div>
          </div>
        )}

        <div className="diseaseContent glass-panel">
          {!result ? (
            <div className="uploadContainer">
              <div 
                className={`dropZone ${preview ? 'hasImage' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="imagePreviewContainer">
                    <img src={preview} alt="Leaf Preview" className="imagePreview" />
                    <button className="removeImageBtn" onClick={handleReset}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      id="fileInput" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="fileInput"
                    />
                    <label htmlFor="fileInput" className="uploadLabel">
                      <div className="uploadIconContainer">
                        <i className="fas fa-leaf uploadIcon"></i>
                        <i className="fas fa-camera uploadIconSecondary"></i>
                      </div>
                      <h3>Drag & Drop or Click to Upload</h3>
                      <p>Supports JPG, PNG, WEBP (Max 5MB)</p>
                    </label>
                  </>
                )}
              </div>

              <div className="actionContainer">
                <button 
                  className={`analyzeBtn ${!selectedFile || analyzing ? 'disabled' : ''}`}
                  onClick={handleAnalyze}
                  disabled={!selectedFile || analyzing}
                >
                  {analyzing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-microscope"></i> Detect Disease
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="resultContainer fadeIn">
              <div className="resultHeader">
                <div className="resultImage">
                  <img src={preview} alt="Analyzed Leaf" />
                  <div className="scanOverlay"></div>
                </div>
                <div className="resultDiagnosis">
                  {result.raw_label !== 'unknown' ? (
                    <span className="diagnosisBadge warning">
                      <i className="fas fa-exclamation-triangle"></i> Disease Detected
                    </span>
                  ) : (
                    <span className="diagnosisBadge" style={{ backgroundColor: "var(--slate-200)", color: "var(--slate-600)" }}>
                      <i className="fas fa-search-minus"></i> Unrecognized
                    </span>
                  )}
                  <h2>{result.disease}</h2>
                  <div className="confidenceMeter">
                    <div className="confidenceFill" style={{ width: result.confidence }}></div>
                    <span>{result.confidence} Match</span>
                  </div>
                </div>
              </div>

              {result.raw_label !== 'unknown' ? (
                <div className="resultDetails">
                  <h3><i className="fas fa-info-circle"></i> Description</h3>
                  <p>{result.description}</p>
                  
                  <h3><i className="fas fa-flask"></i> Recommended Treatment</h3>
                  <ul className="treatmentList">
                    {result.treatment.map((step, index) => (
                      <li key={index}>
                        <i className="fas fa-check-circle"></i>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="resultDetails" style={{ textAlign: "center", padding: "30px 15px" }}>
                  <i className="fas fa-question-circle" style={{ fontSize: "40px", color: "var(--slate-400)", marginBottom: "15px" }}></i>
                  <p style={{ fontSize: "16px", color: "var(--slate-600)" }}>
                    We couldn't confidently recognize this leaf or disease. Please ensure you are uploading a clear, well-lit, and focused image of a plant leaf.
                  </p>
                </div>
              )}

              <div className="resultActions">
                <button className="resetBtn" onClick={handleReset}>
                  <i className="fas fa-redo"></i> Scan Another Plant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
