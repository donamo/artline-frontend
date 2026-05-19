import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { LoginPage } from "./pages/login-page";
import { TimelinePage } from "./pages/timeline-page";
import { apolloClient } from "./lib/apollo";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

const isLoginPage = window.location.pathname.endsWith("/login.html");

createRoot(rootElement).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      {isLoginPage ? <LoginPage /> : <TimelinePage />}
    </ApolloProvider>
  </StrictMode>,
);
