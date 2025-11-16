import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Polyfill Buffer for Solana web3.js (required for browser compatibility)
import { Buffer } from 'buffer';
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);
