import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/authContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const SEND_INTERVAL_MS = 10_000;

export function useGeolocation() {
  const { token } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);
  const pendingRef = useRef<[number, number] | null>(null);

  const sendPosition = useCallback(
    (position: [number, number] | null) => {
      if (!token) return;
      fetch(`${API_URL}/api/user/location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ position }),
      }).catch(() => {});
    },
    [token]
  );

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        pendingRef.current = coords;

        const now = Date.now();
        if (now - lastSentRef.current >= SEND_INTERVAL_MS) {
          lastSentRef.current = now;
          sendPosition(coords);
        }
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado."
            : "No se pudo obtener la ubicación."
        );
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    setSharing(true);
    setError(null);
    lastSentRef.current = 0;
  }, [sendPosition]);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    pendingRef.current = null;
    setSharing(false);
    sendPosition(null);
  }, [sendPosition]);

  // Flush pending position every interval
  useEffect(() => {
    if (!sharing) return;
    const id = setInterval(() => {
      if (pendingRef.current) {
        sendPosition(pendingRef.current);
        lastSentRef.current = Date.now();
      }
    }, SEND_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sharing, sendPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { sharing, error, startSharing, stopSharing };
}
