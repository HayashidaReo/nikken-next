"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        workbox: unknown;
    }
}

export function PwaUnregister() {
    useEffect(() => {
        console.log("[PwaUnregister] Component mounted");

        if (typeof window === "undefined") return;

        if (!("serviceWorker" in navigator)) {
            console.log("[PwaUnregister] Service Worker not supported");
            return;
        }

        console.log("[PwaUnregister] Checking for registrations...");
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            console.log("[PwaUnregister] Found registrations:", registrations.length);
            if (registrations.length === 0) {
                console.log("[PwaUnregister] No active service workers found.");
            }
            for (const registration of registrations) {
                console.log("[PwaUnregister] Unregistering service worker:", registration);
                registration.unregister().then(success => {
                    console.log("[PwaUnregister] Unregister success:", success);
                });
            }
        });
    }, []);

    return null;
}
