import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { DataProvider } from "./data/store";
import { Crash } from "./ui/Crash";
import "./styles.css";

if (localStorage.getItem("roslop-theme") === "light") document.documentElement.classList.add("light");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Crash full>
      <DataProvider>
        <App />
      </DataProvider>
    </Crash>
  </StrictMode>,
);
