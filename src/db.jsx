import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

//create IndexedDB database
export const db = new Dexie("recipe-photos");

db.version(1).stores({
  photos: "id",
});

async function addPhoto(id, imgSrc) {
  try {
    await db.photos.put({ id, imgSrc });
    console.log("Photo saved for id:", id);
  } catch (error) {
    console.log("Failed to save photo:", error);
  }
}

function GetPhotoSrc(id) {
  const img = useLiveQuery(
    () => db.photos.where("id").equals(id).toArray(),
    [id]
  );
  if (Array.isArray(img) && img.length > 0) return img[0].imgSrc;
  return null;
}

export { addPhoto, GetPhotoSrc };
