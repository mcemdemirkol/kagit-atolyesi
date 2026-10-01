import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "./sablon/ortak.css";
import "./sablon/canli.css";
import "./sablon/teknik.css";
import "./uygulama.css";
import { App } from "./App";

createRoot(document.getElementById("kok")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
