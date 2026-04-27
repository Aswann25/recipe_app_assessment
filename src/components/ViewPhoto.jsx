import { GetPhotoSrc } from "../db.jsx";

// Displays the saved photo for a recipe, or a fallback message if none exists
const ViewPhoto = ({ id, name }) => {
  // Fetch the photo source URL (or null) from the database using the recipe ID
  const photoSrc = GetPhotoSrc(id); 

  return (
    <div className="view-photo-wrap">
      {/* Recipe name heading */}
      <h3>{name}</h3>

      {/* Show the photo if one exists, otherwise show a placeholder message */}
      {photoSrc ? (
        <img src={photoSrc} alt={name} className="saved-photo" />
      ) : (
        <p className="muted-text">No photo saved yet for this recipe.</p>
      )}
    </div>
  );
};

export default ViewPhoto;