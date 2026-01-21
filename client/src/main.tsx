import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App";
import "./index.css";

// Register Service Worker for PWA using vite-plugin-pwa
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New content available, reloading...');
  },
  onOfflineReady() {
    console.log('[PWA] App ready to work offline');
  },
  onRegistered(registration) {
    console.log('[PWA] Service Worker registered:', registration);
  },
  onRegisterError(error) {
    console.error('[PWA] Service Worker registration error:', error);
  },
  immediate: true
});

createRoot(document.getElementById("root")!).render(<App />);
