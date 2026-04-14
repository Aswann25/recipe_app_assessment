import { GetPhotoSrc } from "../db.jsx";

const ViewPhoto = ({ id, name }) => {
  const photoSrc = GetPhotoSrc(id); 

  return (
    <div className="view-photo-wrap">
      <h3>{name}</h3>
      {photoSrc ? (
        <img src={photoSrc} alt={name} className="saved-photo" />
      ) : (
        <p className="muted-text">No photo saved yet for this recipe.</p>
      )}
    </div>
  );
};

export default ViewPhoto;
