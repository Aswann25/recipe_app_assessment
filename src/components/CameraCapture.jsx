import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { addPhoto } from "../db.jsx";

const CameraCapture = ({ id, photoedTask }) => {
  const webcamRef = useRef(null); 
  const [imgSrc, setImgSrc] = useState(null);
  const [imgId, setImgId] = useState(null);
  const [photoSave, setPhotoSave] = useState(false);
  const [camError, setCamError] = useState(false);

  useEffect(() => {
    if (photoSave) {
      photoedTask(imgId);
      setPhotoSave(false);
    }
  }, [photoSave]); 

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const savePhoto = (id, src) => {
    addPhoto(id, src);
    setImgId(id);
    setPhotoSave(true);
  };

  const cancelPhoto = () => setImgSrc(null);

  if (camError) {
    return <p className="error-text">Camera not available or permission denied.</p>;
  }

  return (
    <div className="camera-wrap">
      {!imgSrc && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam-view"
          onUserMediaError={() => setCamError(true)}
        />
      )}

      {imgSrc && <img src={imgSrc} className="webcam-view" alt="captured" />}

      <div className="camera-btns">
        {!imgSrc && (
          <button className="btn btn-primary" onClick={capture}>
            📷 Capture
          </button>
        )}
        {imgSrc && (
          <button className="btn btn-primary" onClick={() => savePhoto(id, imgSrc)}>
            💾 Save Photo
          </button>
        )}
        <button className="btn btn-secondary" onClick={cancelPhoto}>
          {imgSrc ? "Retake" : "Cancel"}
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
