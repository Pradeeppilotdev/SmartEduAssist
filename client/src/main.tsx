import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Removed QueryClientProvider from here as it's now in App.tsx
// This prevents duplicate QueryClient instances

createRoot(document.getElementById("root")!).render(
  <App />
);
