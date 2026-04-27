import { useState } from "react";
import { usePermissions } from "../usePermissions.js";

const STORAGE_FLAG = "recipe-permissions-seen"; // remembers if the user has seen the gate

// shows one permission with its status and an Allow button if not yet granted
function PermissionRow({ icon, title, description, status, onRequest, requesting }) {
  const statusColors = {
    granted: "var(--green)",
    denied:  "var(--danger)",
    prompt:  "var(--accent)",
    unknown: "var(--muted)",
  };
  const statusLabels = {
    granted: "✓ Allowed",
    denied:  "✗ Denied",
    prompt:  "Not yet asked",
    unknown: "Unknown",
  };

  return (
    <div className="perm-row">
      <span className="perm-icon">{icon}</span>
      <div className="perm-info">
        <strong className="perm-title">{title}</strong>
        <span className="perm-desc">{description}</span>
        <span className="perm-status" style={{ color: statusColors[status] ?? "var(--muted)" }}>
          {statusLabels[status] ?? status}
        </span>
      </div>
      {/* still requestable — show Allow button */}
      {(status === "prompt" || status === "unknown") && (
        <button
          className="btn btn-primary btn-sm perm-btn"
          onClick={onRequest}
          disabled={requesting}
        >
          {requesting ? "Requesting…" : "Allow"}
        </button>
      )}
      {/* denied — user must go to device settings */}
      {status === "denied" && (
        <span className="perm-hint">Enable in device settings</span>
      )}
    </div>
  );
}

export default function PermissionsGate({ children }) {
  const { permissions, loading, requestCamera, requestGeolocation, requestNotifications } =
    usePermissions();

  // read localStorage so the gate only appears on first launch
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem(STORAGE_FLAG)
  );

  // tracks which permission is mid-request to show a spinner
  const [requesting, setRequesting] = useState({
    camera: false, geolocation: false, notifications: false,
  });

  // set the loading flag for a permission, run the request, then clear it
  async function handleRequest(key, fn) {
    setRequesting((p) => ({ ...p, [key]: true }));
    await fn();
    setRequesting((p) => ({ ...p, [key]: false }));
  }

  // persist the flag and close the gate
  function handleContinue() {
    localStorage.setItem(STORAGE_FLAG, "1");
    setDismissed(true);
  }

  // skip the gate if already seen or permissions are still loading
  if (dismissed || loading) return children;

  // notifications are optional; only camera and geolocation are required
  const allGranted =
    permissions.camera === "granted" && permissions.geolocation === "granted";

  return (
    <>
      <div className="perm-overlay">
        <div className="perm-box">
          <div className="perm-header">
            <span className="perm-logo">🍳</span>
            <h2>Recipe Finder needs a few permissions</h2>
            <p className="perm-subtitle">
              These let you tag where you saved a recipe and photograph your food.
              You can allow them now or change them in your device settings later.
            </p>
          </div>

          <div className="perm-list">
            <PermissionRow
              icon="📍"
              title="Location"
              description="Tag where you saved each recipe so you can revisit great spots."
              status={permissions.geolocation}
              onRequest={() => handleRequest("geolocation", requestGeolocation)}
              requesting={requesting.geolocation}
            />
            <PermissionRow
              icon="📷"
              title="Camera"
              description="Photograph your finished dishes and store them with your recipes."
              status={permissions.camera}
              onRequest={() => handleRequest("camera", requestCamera)}
              requesting={requesting.camera}
            />
            <PermissionRow
              icon="🔔"
              title="Notifications"
              description="Optional — get reminders about saved recipes."
              status={permissions.notifications}
              onRequest={() => handleRequest("notifications", requestNotifications)}
              requesting={requesting.notifications}
            />
          </div>

          <div className="perm-actions">
            {/* hide Skip once everything is granted */}
            {!allGranted && (
              <button className="btn btn-secondary" onClick={handleContinue}>
                Skip for now
              </button>
            )}
            <button className="btn btn-primary" onClick={handleContinue}>
              {allGranted ? "Continue to app →" : "Continue anyway →"}
            </button>
          </div>

          {/* hint shown if camera or location was denied */}
          {permissions.camera === "denied" || permissions.geolocation === "denied" ? (
            <p className="perm-denied-hint">
              ⚠ Some permissions were denied. To enable them, open your browser or device
              <strong> Settings → Site Permissions</strong> and allow Camera / Location
              for this site.
            </p>
          ) : null}
        </div>
      </div>

      {/* render children behind the overlay so the app mounts early */}
      <div aria-hidden="true" style={{ visibility: "hidden", pointerEvents: "none" }}>
        {children}
      </div>
    </>
  );
}