import { useState, useRef } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import CameraCapture from "./CameraCapture.jsx";
import ViewPhoto from "./ViewPhoto.jsx";

export default function SavedRecipeItem({
  item, onDelete, onEdit, onViewDetail, onViewCustom, photoedTask
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName]     = useState(item.name);
  const editBtnRef                = useRef(null);

  function handleEdit(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    onEdit(item.id, newName.trim());
    setIsEditing(false);
  }

  return (
    <li className="saved-item">
      {isEditing ? (
        <form className="edit-form" onSubmit={handleEdit}>
          <input
            className="edit-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button className="btn btn-primary" type="submit">Save</button>
          <button className="btn btn-secondary" type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <div className="saved-item-info">
            {item.image ? (
              <img className="saved-item-thumb" src={item.image} alt={item.name} />
            ) : item.isCustom ? (
              <div className="saved-item-thumb custom-thumb">✍️</div>
            ) : null}

            <div className="saved-item-text">
              <span className="saved-item-name">
                {item.name}
                {item.isCustom && <span className="custom-badge-inline">Your recipe</span>}
              </span>

              {item.isCustom && (item.cuisine || item.difficulty) && (
                <span className="saved-item-meta">
                  {[item.cuisine, item.difficulty].filter(Boolean).join(" · ")}
                  {item.readyInMinutes ? ` · ${item.readyInMinutes} min` : ""}
                </span>
              )}

              <span className="saved-item-coords">
                {item.location?.latitude !== "##"
                  ? `📍 ${parseFloat(item.location.latitude).toFixed(4)}, ${parseFloat(item.location.longitude).toFixed(4)}`
                  : "📍 Location not captured"}
              </span>

              <span className="saved-item-links">
                <a href={item.location?.mapURL || "#"} target="_blank" rel="noreferrer">(map)</a>
                {" | "}
                <a href={item.location?.smsURL || "#"}>(sms)</a>
              </span>

              {item.photo && <span className="photo-badge">📷 Photo saved</span>}
            </div>
          </div>

          <div className="saved-item-actions">
            {item.isCustom ? (
              <button className="btn btn-sm" onClick={() => onViewCustom(item)}>
                View Recipe
              </button>
            ) : (
              <button className="btn btn-sm" onClick={() => onViewDetail(item.spoonacularId)}>
                Details
              </button>
            )}

            <button
              className="btn btn-sm"
              ref={editBtnRef}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>

            <Popup trigger={<button className="btn btn-sm">📷 Photo</button>} modal>
              <CameraCapture id={item.id} photoedTask={photoedTask} />
            </Popup>

            <Popup trigger={<button className="btn btn-sm">🖼 View</button>} modal>
              <ViewPhoto id={item.id} name={item.name} />
            </Popup>

            <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}
