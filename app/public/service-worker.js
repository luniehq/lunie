/* global self */

// This service worker file is effectively a 'no-op' that will reset any
// previous service worker registered for the same host:port combination.

self.addEventListener("install", () => self.skipWaiting())
