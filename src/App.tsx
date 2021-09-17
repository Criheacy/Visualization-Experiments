import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ExperimentPage } from "./pages/experiments";
import { IndexPage } from "./pages";

function App() {
  return (
    <Routes>
      <Route path={"experiments/*"} element={<ExperimentPage />} />
      <Route path={"/"} element={<IndexPage />} />
    </Routes>
  );
}

export default App;
