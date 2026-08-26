import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CookieConsentProvider } from "@/app/privacy/cookie-consent-context";
import { CookieConsentManager } from "@/app/privacy/cookie-consent-manager";
import App from "./App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookieConsentProvider>
      <BrowserRouter>
        <App />
        <CookieConsentManager />
      </BrowserRouter>
    </CookieConsentProvider>
  </StrictMode>,
);
