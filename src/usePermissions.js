/**
 * usePermissions.js
 * Custom hook for managing camera, geolocation, and notification permissions
 * on mobile PWA / phone app environments.
 */
import { useState, useEffect, useCallback } from "react";

export function usePermissions() {
  const [permissions, setPermissions] = useState({
    camera:      "unknown", // "granted" | "denied" | "prompt" | "unknown"
    geolocation: "unknown",
    notifications: "unknown",
  });
  const [loading, setLoading] = useState(true);

  // Query the current state of each permission
  const queryPermissions = useCallback(async () => {
    const results = { camera: "unknown", geolocation: "unknown", notifications: "unknown" };

    // Camera
    if (navigator.permissions) {
      try {
        const cam = await navigator.permissions.query({ name: "camera" });
        results.camera = cam.state; // "granted" | "denied" | "prompt"
        cam.addEventListener("change", () =>
          setPermissions((p) => ({ ...p, camera: cam.state }))
        );
      } catch {
        // Some browsers (e.g. Firefox) don't support querying camera
        results.camera = "unknown";
      }
    }

    // Geolocation
    if (navigator.permissions) {
      try {
        const geo = await navigator.permissions.query({ name: "geolocation" });
        results.geolocation = geo.state;
        geo.addEventListener("change", () =>
          setPermissions((p) => ({ ...p, geolocation: geo.state }))
        );
      } catch {
        results.geolocation = "unknown";
      }
    }

    // Notifications
    if ("Notification" in window) {
      results.notifications =
        Notification.permission === "default" ? "prompt" : Notification.permission;
    }

    setPermissions(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    queryPermissions();
  }, [queryPermissions]);

  // Request camera access
  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop tracks immediately — we just needed the prompt to fire
      stream.getTracks().forEach((t) => t.stop());
      setPermissions((p) => ({ ...p, camera: "granted" }));
      return "granted";
    } catch (err) {
      const state = err.name === "NotAllowedError" ? "denied" : "unknown";
      setPermissions((p) => ({ ...p, camera: state }));
      return state;
    }
  }, []);

  // Request geolocation access
  const requestGeolocation = useCallback(() =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        setPermissions((p) => ({ ...p, geolocation: "denied" }));
        return resolve("denied");
      }
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions((p) => ({ ...p, geolocation: "granted" }));
          resolve("granted");
        },
        (err) => {
          const state = err.code === 1 ? "denied" : "unknown";
          setPermissions((p) => ({ ...p, geolocation: state }));
          resolve(state);
        },
        { timeout: 10000 }
      );
    }), []);

  // Request notification permission
  const requestNotifications = useCallback(async () => {
    if (!("Notification" in window)) return "denied";
    const result = await Notification.requestPermission();
    const state = result === "default" ? "prompt" : result;
    setPermissions((p) => ({ ...p, notifications: state }));
    return state;
  }, []);

  return {
    permissions,
    loading,
    requestCamera,
    requestGeolocation,
    requestNotifications,
    refetch: queryPermissions,
  };
}
