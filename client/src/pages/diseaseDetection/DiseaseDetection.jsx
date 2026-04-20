import React, { useState } from 'react';
import axios from 'axios';
import './diseaseDetection.css';

export default function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

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
        </div>

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
                  <span className="diagnosisBadge warning">
                    <i className="fas fa-exclamation-triangle"></i> Disease Detected
                  </span>
                  <h2>{result.disease}</h2>
                  <div className="confidenceMeter">
                    <div className="confidenceFill" style={{ width: result.confidence }}></div>
                    <span>{result.confidence} Match</span>
                  </div>
                </div>
              </div>

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

              <div className="resultActions">
                <button className="resetBtn" onClick={handleReset}>
                  <i className="fas fa-redo"></i> Scan Another Plant
                </button>
                <button className="expertBtn">
                  <i className="fas fa-user-md"></i> Ask an Expert
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
