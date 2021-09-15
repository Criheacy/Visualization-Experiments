import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ExperimentPage } from "./pages/experiments";

function App() {
  return (
    <Routes>
      <Route path={"experiments/*"} element={<ExperimentPage />} />
    </Routes>
  );
}

export default App;
