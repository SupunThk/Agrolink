import { useState } from "react";
import "./farmImageUpload.css";

/**
 * FarmImageUpload Component
 * Reusable component for uploading farm/paddy field images
 * 
 * Props:
 * - images: Array of Base64 image strings
 * - onChange: Callback function when images change (receives array of Base64 strings)
 * - error: Error message to display
 * - minImages: Minimum number of images required (default: 3)
 * - maxImages: Maximum number of images allowed (default: 10)
 * - disabled: Whether to disable upload/delete (boolean)
 * - preview: Whether to show image previews (default: true)
 */
export default function FarmImageUpload({
  images = [],
  onChange = () => {},
  error = null,
  minImages = 3,
  maxImages = 10,
  disabled = false,
  preview = true
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [inputKey, setInputKey] = useState(0);

  const MAX_SINGLE_IMAGE_BYTES = 2.5 * 1024 * 1024; // ~2.5MB encoded image budget
  const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024; // Keep far below MongoDB 16MB document limit

  const getBase64ByteSize = (dataUrl) => {
    if (typeof dataUrl !== "string") return 0;
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    if (!base64) return 0;
    const padding = (base64.match(/=+$/) || [""])[0].length;
    return Math.ceil((base64.length * 3) / 4) - padding;
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const maxDimension = 1600;
            const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
            const targetWidth = Math.max(1, Math.round(img.width * scale));
            const targetHeight = Math.max(1, Math.round(img.height * scale));

            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Unable to initialize canvas"));
              return;
            }

            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const compressed = canvas.toDataURL("image/jpeg", 0.82);
            resolve(compressed);
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = (error) => reject(error);
        img.src = reader.result;
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const validateImage = (file) => {
    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG, GIF, and WebP images are allowed");
      return false;
    }

    // Check file size (max 5MB per image)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("Image must be less than 5MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = async (files) => {
    setUploadError("");

    if (!files || files.length === 0) return;

    // Check max images limit
    const totalImages = images.length + files.length;
    if (totalImages > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`);
      return;
    }

    try {
      const newImages = [];
      let hasErrors = false;
      let totalBytes = images.reduce((sum, img) => sum + getBase64ByteSize(img), 0);
      
      for (let file of files) {
        if (!validateImage(file)) {
          hasErrors = true;
          continue; // Skip this file and continue with others
        }

        const processed = await compressImage(file);
        const sizeBytes = getBase64ByteSize(processed);

        if (sizeBytes > MAX_SINGLE_IMAGE_BYTES) {
          hasErrors = true;
          setUploadError("One or more images are still too large after optimization. Please use clearer but lower-resolution images.");
          continue;
        }

        if (totalBytes + sizeBytes > MAX_TOTAL_IMAGE_BYTES) {
          hasErrors = true;
          setUploadError("Total image payload is too large. Remove one image or use smaller images.");
          continue;
        }

        totalBytes += sizeBytes;
        newImages.push(processed);
      }
      
      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
      
      if (!hasErrors && newImages.length === files.length) {
        setUploadError(""); // Clear any previous errors
      }
    } catch (err) {
      console.error("Error converting images:", err);
      setUploadError("Failed to process images. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
    // Reset input key to allow selecting the same file again
    setInputKey(prev => prev + 1);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDeleteImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    setUploadError("");
  };

  const isAtMinimum = images.length <= minImages;
  const canAddMore = images.length < maxImages;

  return (
    <div className="farmImageUploadContainer">
      <label className="farmImageLabel">
        Farm & Paddy Field Images
        <span className="farmImageRequired">*</span>
      </label>
      
      <p className="farmImageHelperText">
        Upload at least {minImages} images of your farm or paddy fields for verification
      </p>
      
      <p className="farmImageEditNote">
        <i className="fas fa-pencil-alt"></i>
        You can delete or re-upload images anytime before submitting
      </p>

      {/* Upload Area */}
      {canAddMore && !disabled && (
        <div
          className={`farmImageUploadArea ${isDragging ? "dragging" : ""} ${error || uploadError ? "error" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            key={inputKey}
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled}
            style={{ display: "none" }}
            id="farmImageInput"
          />
          <label htmlFor="farmImageInput" className="farmImageUploadLabel">
            <div className="farmImageUploadIcon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="farmImageUploadText">
              <p className="farmImageUploadMain">
                Drag images here or <span>click to select</span>
              </p>
              <p className="farmImageUploadSub">
                JPG, PNG, GIF or WebP (Max 5MB each)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Error Message */}
      {(error || uploadError) && (
        <div className="farmImageError">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error || uploadError}</span>
        </div>
      )}

      {/* Image Count and Status */}
      <div className="farmImageStats">
        <span className="farmImageCount">
          <i className="fas fa-images"></i>
          <span>
            {images.length} / {maxImages}
          </span>
        </span>
        <span className={`farmImageStatus ${images.length >= minImages ? "ready" : "pending"}`}>
          {images.length >= minImages ? (
            <>
              <i className="fas fa-check-circle"></i>
              Ready for submission
            </>
          ) : (
            <>
              <i className="fas fa-info-circle"></i>
              {minImages - images.length} more required
            </>
          )}
        </span>
      </div>

      {/* Image Previews */}
      {preview && images.length > 0 && (
        <div className="farmImagePreviewContainer">
          {images.map((image, index) => (
            <div key={index} className="farmImagePreview">
              <img src={image} alt={`Farm ${index + 1}`} className="farmImagePreviewImg" />
              <div className="farmImagePreviewOverlay">
                <button
                  type="button"
                  className="farmImageDeleteBtn"
                  onClick={() => handleDeleteImage(index)}
                  disabled={disabled}
                  title="Delete image"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
                <span className="farmImageIndex">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAtMinimum && !canAddMore && (
        <div className="farmImageFullInfo">
          <i className="fas fa-info-circle"></i>
          <span>Maximum images reached</span>
        </div>
      )}
    </div>
  );
}
