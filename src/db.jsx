import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

// Create an IndexedDB database called "recipe-photos" using Dexie
export const db = new Dexie("recipe-photos");

// Define the database schema — "id" is the primary key for the photos store
db.version(1).stores({
  photos: "id",
});

// Save or overwrite a photo for a given recipe ID
async function addPhoto(id, imgSrc) {
  try {
    await db.photos.put({ id, imgSrc }); // put() inserts or replaces the record
    console.log("Photo saved for id:", id);
  } catch (error) {
    console.log("Failed to save photo:", error);
  }
}

// Reactively fetch the photo src for a given recipe ID
// Returns the image src string if found, or null if no photo is saved
function GetPhotoSrc(id) {
  const img = useLiveQuery(
    () => db.photos.where("id").equals(id).toArray(),
    [id] // re-run the query whenever the ID changes
  );
  if (Array.isArray(img) && img.length > 0) return img[0].imgSrc;
  return null;
}

export { addPhoto, GetPhotoSrc };