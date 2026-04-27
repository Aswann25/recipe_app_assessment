import { useState, useEffect, useCallback } from "react";
import { Camera, CameraPermissionState } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";

// Custom hook that checks and requests camera, geolocation, and notification permissions
export function usePermissions() {
  // Track the current state of each permission
  const [permissions, setPermissions] = useState({
    camera:        "unknown",
    geolocation:   "unknown",
    notifications: "unknown",
  });
  const [loading, setLoading] = useState(true);

  // Query the current status of all three permissions without prompting the user
  const queryPermissions = useCallback(async () => {
    const results = {
      camera:        "unknown",
      geolocation:   "unknown",
      notifications: "unknown",
    };

    // Camera — use Capacitor native plugin
    try {
      const camStatus = await Camera.checkPermissions();
      results.camera = camStatus.camera; // "granted" | "denied" | "prompt"
    } catch {
      results.camera = "unknown";
    }

    // Geolocation — use Capacitor native plugin
    try {
      const geoStatus = await Geolocation.checkPermissions();
      results.geolocation = geoStatus.location; // "granted" | "denied" | "prompt"
    } catch {
      results.geolocation = "unknown";
    }

    // Notifications — use the web Notification API as Capacitor's free tier
    // doesn't include a dedicated notifications permissions plugin
    if ("Notification" in window) {
      // Normalise "default" (never asked) to "prompt" to match the other permission states
      results.notifications =
        Notification.permission === "default" ? "prompt" : Notification.permission;
    }

    setPermissions(results);
    setLoading(false);
  }, []);

  // Run the permission check once on mount
  useEffect(() => {
    queryPermissions();
  }, [queryPermissions]);

  // Request camera permission — triggers the native Android dialog if not yet decided
  const requestCamera = useCallback(async () => {
    try {
      const result = await Camera.requestPermissions({ permissions: ["camera"] });
      const state = result.camera;
      setPermissions((p) => ({ ...p, camera: state }));
      return state;
    } catch {
      // If the plugin throws, treat it as denied
      setPermissions((p) => ({ ...p, camera: "denied" }));
      return "denied";
    }
  }, []);

  // Request geolocation permission — triggers the native Android dialog if not yet decided
  const requestGeolocation = useCallback(async () => {
    try {
      const result = await Geolocation.requestPermissions();
      const state = result.location;
      setPermissions((p) => ({ ...p, geolocation: state }));
      return state;
    } catch {
      // If the plugin throws, treat it as denied
      setPermissions((p) => ({ ...p, geolocation: "denied" }));
      return "denied";
    }
  }, []);

  // Request notification permission using the web Notification API
  const requestNotifications = useCallback(async () => {
    if (!("Notification" in window)) return "denied"; // not supported in this environment
    const result = await Notification.requestPermission();
    const state = result === "default" ? "prompt" : result; // normalise "default" to "prompt"
    setPermissions((p) => ({ ...p, notifications: state }));
    return state;
  }, []);

  return {
    permissions,
    loading,
    requestCamera,
    requestGeolocation,
    requestNotifications,
    refetch: queryPermissions, // expose so components can re-check after returning from settings
  };
}