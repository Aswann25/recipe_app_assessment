import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { addPhoto } from "../db.jsx";

// Component for capturing and saving a photo using the device camera
const CameraCapture = ({ id, photoedTask }) => {
  const webcamRef = useRef(null); // Reference to the Webcam component for taking screenshots
  const [imgSrc, setImgSrc] = useState(null);   // Stores the captured image as a base64 string
  const [imgId, setImgId] = useState(null);      // Stores the ID associated with the saved photo
  const [photoSave, setPhotoSave] = useState(false); // Flag that triggers the post-save callback
  const [camError, setCamError] = useState(false);   // Tracks whether the camera failed to load

  // Notify parent component after a photo has been saved, then reset the flag
  useEffect(() => {
    if (photoSave) {
      photoedTask(imgId);
      setPhotoSave(false);
    }
  }, [photoSave]); 

  // Capture a screenshot from the webcam and store it in state
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  // Persist the photo to the database and trigger the save flow
  const savePhoto = (id, src) => {
    addPhoto(id, src);
    setImgId(id);
    setPhotoSave(true);
  };

  // Discard the current capture so the user can retake
  const cancelPhoto = () => setImgSrc(null);

  // Show an error message if camera access was blocked or unavailable
  if (camError) {
    return <p className="error-text">Camera not available or permission denied.</p>;
  }

  return (
    <div className="camera-wrap">
      {/* Show the live webcam feed before a photo is captured */}
      {!imgSrc && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam-view"
          onUserMediaError={() => setCamError(true)}
        />
      )}

      {/* Show the captured image preview in place of the webcam feed */}
      {imgSrc && <img src={imgSrc} className="webcam-view" alt="captured" />}

      <div className="camera-btns">
        {/* Capture button — visible only when no image has been taken yet */}
        {!imgSrc && (
          <button className="btn btn-primary" onClick={capture}>
            📷 Capture
          </button>
        )}
        {/* Save button — visible only after an image has been captured */}
        {imgSrc && (
          <button className="btn btn-primary" onClick={() => savePhoto(id, imgSrc)}>
            💾 Save Photo
          </button>
        )}
        {/* Retake/Cancel button — label changes based on whether a photo exists */}
        <button className="btn btn-secondary" onClick={cancelPhoto}>
          {imgSrc ? "Retake" : "Cancel"}
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;