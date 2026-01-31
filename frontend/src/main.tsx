import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";
import { AuthProvider } from "./admin/components/AuthContext";
import { TranslationProvider } from "./context/TranslationContext";
import { queryClient } from "./lib/queryClient";
import { GlobalProvider } from "./context/GlobalContext";

// Find root element
const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GlobalProvider>
            <TranslationProvider>
              <AuthProvider>
                <App />
                <Toaster position="top-center" />
              </AuthProvider>
            </TranslationProvider>
          </GlobalProvider>
        </BrowserRouter>
        {/* React Query DevTools - only in development */}

      </QueryClientProvider>
    </StrictMode>
  );
}
