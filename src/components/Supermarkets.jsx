import { useState } from "react";

// Single compact query — one union for nodes, one for ways.
// Using "shop" tag only (the most reliable OSM tag for retail stores).
// Ways use "out center" so we get a lat/lon for building-footprint entries.
function buildOverpassQuery(lat, lon, radius) {
  const around = `(around:${radius},${lat},${lon})`;
  const shopTypes = `["shop"~"supermarket|convenience|grocery|food|general"]`;
  return `
    [out:json][timeout:25];
    (
      node${shopTypes}${around};
      way${shopTypes}${around};
    );
    out center;
  `;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const RADIUS_OPTIONS = [
  { label: "500 m", value: 500 },
  { label: "1 km",  value: 1000 },
  { label: "2 km",  value: 2000 },
  { label: "5 km",  value: 5000 },
];

export default function Supermarkets() {
  const [stores, setStores]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [radius, setRadius]         = useState(2000);
  const [searched, setSearched]     = useState(false);

  async function findSupermarkets() {
    setLoading(true);
    setError(null);
    setStores([]);
    setSearched(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });

        try {
          const query = buildOverpassQuery(latitude, longitude, radius);

          // Try primary endpoint, fall back to mirror on 429/5xx
          const ENDPOINTS = [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
          ];
          let res;
          for (const url of ENDPOINTS) {
            res = await fetch(url, { method: "POST", body: query });
            if (res.ok) break;
            if (res.status === 429 || res.status >= 500) continue;
            throw new Error(`Overpass API error: ${res.status}`);
          }
          if (!res.ok) throw new Error(`Overpass API error: ${res.status} — try again in a moment`);
          const data = await res.json();

          // Deduplicate by name + approximate position
          const seen = new Set();
          const results = data.elements
            .filter((el) => {
              // nodes have lat/lon directly; ways have a "center" object
              const lat = el.lat ?? el.center?.lat;
              const lon = el.lon ?? el.center?.lon;
              return lat && lon && el.tags?.name;
            })
            .map((el) => {
              const lat = el.lat ?? el.center.lat;
              const lon = el.lon ?? el.center.lon;
              return {
                id:           el.id,
                name:         el.tags.name,
                brand:        el.tags.brand || el.tags.operator || "",
                opening_hours: el.tags.opening_hours || "",
                phone:        el.tags.phone || el.tags["contact:phone"] || "",
                website:      el.tags.website || el.tags["contact:website"] || "",
                lat,
                lon,
                distance:     distanceKm(latitude, longitude, lat, lon),
                mapURL:       `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`,
                directionsURL:`https://www.google.com/maps/dir/${latitude},${longitude}/${lat},${lon}`,
              };
            })
            // Remove duplicates (same name within ~50 m)
            .filter((store) => {
              const key = `${store.name.toLowerCase()}_${store.lat.toFixed(3)}_${store.lon.toFixed(3)}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .sort((a, b) => a.distance - b.distance);

          if (results.length === 0) {
            setError(`No stores found within ${radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}. Try a larger radius.`);
          }
          setStores(results);
        } catch (e) {
          setError(`Failed to fetch stores: ${e.message}`);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1)      setError("Location permission denied. Please allow location access and try again.");
        else if (err.code === 2) setError("Location unavailable. Check your device GPS.");
        else                     setError("Could not get your location. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="supermarkets-tab">
      <div className="supermarkets-header">
        <h2>🛒 Shops Near Me</h2>
        <p className="muted-text">
          Find supermarkets and food shops close to your current location.
        </p>
      </div>

      <div className="supermarkets-controls">
        <div className="radius-selector">
          <label className="form-label">Search radius:</label>
          <div className="radius-btns">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`radius-btn ${radius === opt.value ? "radius-btn-active" : ""}`}
                onClick={() => setRadius(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          className="btn btn-primary find-btn"
          onClick={findSupermarkets}
          disabled={loading}
        >
          {loading ? "📡 Locating..." : "📍 Find Shops"}
        </button>
      </div>

      {userCoords && (
        <p className="your-location">
          📍 Your location: {userCoords.latitude.toFixed(5)}, {userCoords.longitude.toFixed(5)}
          {" — "}
          <a
            href={`https://www.openstreetmap.org/#map=15/${userCoords.latitude}/${userCoords.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            View on map
          </a>
        </p>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading && (
        <div className="loading-stores">
          <p className="loading-text">📡 Getting your location and searching nearby stores...</p>
        </div>
      )}

      {!loading && stores.length > 0 && (
        <>
          <p className="section-label">
            Found {stores.length} store{stores.length !== 1 ? "s" : ""} within{" "}
            {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
          </p>
          <ul className="store-list">
            {stores.map((store) => (
              <li key={store.id} className="store-item">
                <div className="store-main">
                  <span className="store-name">🏪 {store.name}</span>
                  <span className="store-distance">
                    {store.distance < 1
                      ? `${Math.round(store.distance * 1000)} m away`
                      : `${store.distance.toFixed(1)} km away`}
                  </span>
                </div>

                {store.brand && store.brand !== store.name && (
                  <span className="store-brand">{store.brand}</span>
                )}

                {store.opening_hours && (
                  <span className="store-hours">🕐 {store.opening_hours}</span>
                )}

                {store.phone && (
                  <span className="store-phone">
                    📞 <a href={`tel:${store.phone}`}>{store.phone}</a>
                  </span>
                )}

                <div className="store-links">
                  <a href={store.mapURL} target="_blank" rel="noreferrer" className="store-link">
                    🗺 View on map
                  </a>
                  <a href={store.directionsURL} target="_blank" rel="noreferrer" className="store-link">
                    🧭 Get directions
                  </a>
                  {store.website && (
                    <a href={store.website} target="_blank" rel="noreferrer" className="store-link">
                      🌐 Website
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {!loading && searched && stores.length === 0 && !error && (
        <p className="muted-text">No stores found.</p>
      )}
    </div>
  );
}